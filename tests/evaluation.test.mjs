import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { evaluationDimensions } from "../src/data/evaluation-config.ts";
import { i2vEvaluationProject as videoEvaluationProject } from "../src/data/projects/i2v-evaluation.ts";
import {
  buildProductResults,
  calculateOverallScore,
  validateEvaluationCases,
} from "../src/lib/evaluation.ts";

test("the evaluation system uses five isolated dimensions and the complete tag taxonomy", () => {
  assert.equal(evaluationDimensions.length, 5);
  assert.equal(evaluationDimensions.reduce((total, dimension) => total + dimension.issueTags.length, 0), 93);
  assert.deepEqual(evaluationDimensions.map((dimension) => dimension.weight), [0.25, 0.2, 0.2, 0.2, 0.15]);
});

test("registered media paths are local, present, and attached to known products", () => {
  const productIds = new Set(videoEvaluationProject.products.map((product) => product.id));
  videoEvaluationProject.cases.forEach((item) => {
    assert.ok(productIds.has(item.product), `${item.id} references an unknown product`);
    [item.video, item.poster].forEach((asset) => {
      assert.ok(asset.startsWith("/"), `${item.id} uses a non-local asset path`);
      assert.doesNotMatch(asset, /^https?:\/\//, `${item.id} hotlinks media`);
      assert.ok(existsSync(join(process.cwd(), "public", asset)), `${item.id} is missing ${asset}`);
      assert.ok(statSync(join(process.cwd(), "public", asset)).size > 0, `${item.id} has an empty asset`);
    });
  });
  assert.deepEqual(validateEvaluationCases(videoEvaluationProject.cases, evaluationDimensions), []);
});

test("the Kling case demo contains one scored case per dimension and resolves to 3.80", () => {
  assert.equal(videoEvaluationProject.cases.length, 5);
  assert.deepEqual(videoEvaluationProject.cases.map((item) => item.caseId), ["IF-001", "MQ-001", "VQ-001", "TC-001", "AVS-001"]);
  assert.deepEqual(videoEvaluationProject.cases.map((item) => item.score), [4, 4, 4, 3, 4]);
  assert.deepEqual(videoEvaluationProject.cases.map((item) => item.weight), [0.25, 0.2, 0.2, 0.2, 0.15]);
  const counts = new Map(evaluationDimensions.map((dimension) => [dimension.id, 0]));
  videoEvaluationProject.cases.forEach((item) => counts.set(item.dimension, (counts.get(item.dimension) ?? 0) + 1));
  assert.deepEqual([...counts.values()], [1, 1, 1, 1, 1]);

  const [result] = buildProductResults(videoEvaluationProject.products, videoEvaluationProject.cases, evaluationDimensions);
  assert.equal(result.overallScore, 3.8);
  assert.equal(result.validWeight, 1);
  assert.equal(videoEvaluationProject.summary.overallScore, 3.8);
  assert.equal(videoEvaluationProject.summary.percentage, 76);
  assert.match(videoEvaluationProject.summary.disclaimer, /不代表对产品整体能力的统计性结论/);
});

test("every evaluation case exposes four local frame-evidence assets and a valid issue seek target", () => {
  videoEvaluationProject.cases.forEach((item) => {
    assert.equal(item.keyframes.length, 4, `${item.caseId} should expose four keyframes`);
    assert.deepEqual(item.keyframes.map((frame) => frame.timestamp), [0.3, 1.6, 3.1, 4.6]);
    item.keyframes.forEach((frame) => {
      assert.ok(frame.imageSrc.startsWith("/images/i2v-evaluation/evidence/"));
      assert.ok(existsSync(join(process.cwd(), "public", frame.imageSrc)), `${item.caseId} is missing ${frame.imageSrc}`);
      assert.ok(statSync(join(process.cwd(), "public", frame.imageSrc)).size > 0, `${frame.imageSrc} is empty`);
      assert.ok(frame.frameLabel.length > 0 && frame.title.length > 0 && frame.englishTitle.length > 0);
      assert.ok(frame.facts.length >= 2 && frame.facts.length <= 4, `${frame.id} should expose concise evidence facts`);
      assert.ok(frame.promptMatch >= 1 && frame.promptMatch <= 5, `${frame.id} prompt match is outside 1–5`);
      frame.annotations.forEach((annotation) => {
        [annotation.x, annotation.y, annotation.targetX, annotation.targetY].forEach((coordinate) => {
          assert.ok(coordinate >= 0 && coordinate <= 1, `${annotation.id} uses a non-normalized coordinate`);
        });
      });
    });
    assert.ok(item.issueTags.includes(item.primaryIssue), `${item.caseId} primary issue is not attached to the case`);
    assert.ok(item.keyframes.some((frame) => frame.timestamp === item.issueTimestamp), `${item.caseId} issue timestamp has no evidence frame`);
    assert.ok(item.evidenceCoverage >= 1 && item.evidenceCoverage <= 5);
  });
});

test("visual quality and consistency cases expose complete original prompts without TODO text", () => {
  const visual = videoEvaluationProject.cases.find((item) => item.id === "visual-quality-001");
  const consistency = videoEvaluationProject.cases.find((item) => item.id === "temporal-consistency-001");

  assert.match(visual?.originalPrompt ?? "", /八根金属伞骨清晰完整/);
  assert.match(visual?.originalPrompt ?? "", /负面要求：低清晰度/);
  assert.match(consistency?.originalPrompt ?? "", /固定人物设定：/);
  assert.match(consistency?.originalPrompt ?? "", /第4–5秒/);
  [visual, consistency].forEach((item) => {
    assert.doesNotMatch(item?.promptSummary ?? "", /TODO/i);
    assert.doesNotMatch(item?.originalPrompt ?? "", /TODO/i);
  });
});

test("overall scores normalize valid weights and distinguish N/A from missing data", () => {
  const result = calculateOverallScore({
    "instruction-following": 5,
    "motion-quality": 4,
    "visual-quality": "NA",
    "temporal-consistency": 3,
  }, evaluationDimensions);

  assert.equal(result.score, 4.08);
  assert.equal(result.validWeight, 0.65);
  assert.equal(calculateOverallScore({}, evaluationDimensions).score, null);
});

test("product dimension scores average real cases without inventing missing scores", () => {
  const product = { id: "p1", name: "P1", shortName: "P1", note: "" };
  const base = {
    caseId: "CASE",
    title: "case",
    video: "/video.mp4",
    poster: "/poster.webp",
    product: product.id,
    promptSummary: "prompt",
    weight: 0.25,
    scoreLabel: null,
    observableFacts: ["fact"],
    issueTags: [],
    evaluatorNote: "",
    startTime: 0,
    endTime: null,
    audioRequired: false,
    audioStatus: "not-required",
    evaluationCoverage: "标准",
  };
  const cases = [
    { ...base, id: "c1", dimension: "instruction-following", score: 3, issueTags: ["if-other"] },
    { ...base, id: "c2", dimension: "instruction-following", score: 4, issueTags: ["if-other"] },
    { ...base, id: "c3", dimension: "audio-visual-sync", score: "NA", weight: 0.15 },
  ];
  const [result] = buildProductResults([product], cases, evaluationDimensions);

  assert.equal(result.dimensionScores["instruction-following"], 3.5);
  assert.equal(result.dimensionScores["audio-visual-sync"], "NA");
  assert.equal(result.dimensionScores["motion-quality"], undefined);
  assert.equal(result.overallScore, 3.5);
});

test("case validation rejects low scores without tags, cross-dimension tags and invalid audio N/A", () => {
  const base = {
    caseId: "CASE",
    title: "case",
    video: "/video.mp4",
    poster: "/poster.webp",
    product: "p1",
    promptSummary: "prompt",
    scoreLabel: null,
    weight: 0.2,
    observableFacts: ["fact"],
    evaluatorNote: "",
    startTime: 0,
    endTime: null,
    audioStatus: "available",
    evaluationCoverage: "标准",
  };
  const errors = validateEvaluationCases([
    { ...base, id: "low", dimension: "motion-quality", score: 4, issueTags: [], audioRequired: false },
    { ...base, id: "wrong-tag", dimension: "motion-quality", score: 3, issueTags: ["vq-blurry"], audioRequired: false },
    { ...base, id: "bad-na", dimension: "audio-visual-sync", score: "NA", weight: 0.15, issueTags: [], audioRequired: true },
  ], evaluationDimensions);

  assert.equal(errors.length, 3);
});
