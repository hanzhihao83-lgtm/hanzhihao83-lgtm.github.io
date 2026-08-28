import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const routes = [
  "out/index.html",
  "out/visual-notes/index.html",
  "out/photography/index.html",
  "out/moving-image/index.html",
  "out/projects/i2v-evaluation/index.html",
  "out/projects/project-02/index.html",
  "out/projects/project-03/index.html",
  "out/projects/project-04/index.html",
  "out/404.html",
];

test("all public routes are present in the static export", () => {
  routes.forEach((route) => assert.ok(existsSync(route), `missing ${route}`));
});

test("every main page has a title and description", () => {
  routes.slice(0, 8).forEach((route) => {
    const html = readFileSync(route, "utf8");
    assert.match(html, /<title>.+<\/title>/, `${route} has no title`);
    assert.match(html, /<meta name="description" content=".+?"\/>/, `${route} has no description`);
  });
});

test("static pages do not hotlink media", () => {
  routes.slice(0, 8).forEach((route) => {
    const html = readFileSync(route, "utf8");
    assert.doesNotMatch(html, /(?:src|poster)="https?:\/\//, `${route} contains remote media`);
  });
});

test("the exported video evaluation case exposes the five-dimension 1–5 score lab", () => {
  const html = readFileSync("out/projects/i2v-evaluation/index.html", "utf8");
  ["指令遵循", "运动质量", "画面质量", "一致性", "音画同步", "Score Lab"].forEach((label) => {
    assert.match(html, new RegExp(label), `evaluation page is missing ${label}`);
  });
  assert.doesNotMatch(html, /0\s*分|SCORE\s*0/i, "evaluation page contains a zero score");
});

test("the five-dimension overview exports the compact bento report content", () => {
  const html = readFileSync("out/projects/i2v-evaluation/index.html", "utf8");
  const component = readFileSync("src/components/VideoEvaluation/EvaluationExplorer.tsx", "utf8");
  const styles = readFileSync("src/components/VideoEvaluation/EvaluationDimensions.module.css", "utf8");

  [
    "03 / FIVE-DIMENSION SCORE",
    "五维评分系统",
    "以统一标尺拆解生成质量，定位问题并形成可复核结论。",
    "CASE DEMO",
    "N=1",
    "VIEW CASE",
    "主体符合",
    "动作连贯",
    "细节清晰",
    "伞面形变",
    "事件对齐",
  ].forEach((label) => assert.match(html, new RegExp(label), `dimension overview is missing ${label}`));

  [
    "instruction-following-001.webp",
    "motion-quality-001.webp",
    "visual-quality-001.webp",
    "temporal-consistency-001.webp",
    "audio-visual-sync-001.webp",
  ].forEach((poster) => assert.match(html, new RegExp(poster), `dimension overview is missing ${poster}`));

  assert.match(component, /dimensions\.map/, "dimension cards are not data-driven");
  assert.match(component, /viewDimensionCase/, "dimension cards do not reuse Score Lab navigation");
  assert.match(styles, /grid-template-columns:\s*repeat\(6/, "desktop bento grid is missing");
  assert.match(styles, /\.card:nth-child\(n \+ 4\)/, "wide second-row cards are missing");
  assert.match(styles, /prefers-reduced-motion/, "dimension motion does not respect reduced motion");
});

test("the five-dimension bento exports a video-driven scan loop and metric rhythm", () => {
  const component = readFileSync("src/components/VideoEvaluation/EvaluationDimensionBento.tsx", "utf8");
  const styles = readFileSync("src/components/VideoEvaluation/EvaluationDimensions.module.css", "utf8");

  [
    "activeCaseIndex",
    "updateVisualProgress",
    "isPlaying",
    "mediaStatus",
    "isTransitioning",
    "requestAnimationFrame",
    "IntersectionObserver",
    "visibilitychange",
    "prefers-reduced-motion",
    "SCAN 000%",
  ].forEach((token) => assert.match(component, new RegExp(token), `auto-scan loop is missing ${token}`));

  assert.match(component, /video\.currentTime \/ duration/, "scan progress is not driven by the real video timeline");
  assert.match(component, /\(activeIndexRef\.current \+ 1\) % bentoCases\.length/, "the fifth case does not loop back to the first");
  assert.match(component, /固定评分进度/, "score progress is not distinguished from scan progress");
  assert.match(component, /Array\.from\(\{ length: 5 \}/, "metric equalizer does not expose five score slots");
  assert.match(component, /preload="auto"/, "the active video is not prepared for playback");
  assert.match(component, /preload="metadata"/, "the next video does not preload metadata only");
  assert.match(component, /开启声音检查同步/, "audio-visual sync control copy is missing");
  assert.match(styles, /\.unscannedMask/, "the playback-driven unscanned mask is missing");
  assert.match(styles, /\.scanVideo[\s\S]*filter:\s*none/, "active video quality filters are not disabled");
  assert.match(styles, /metricLevelA/, "metric rhythm keyframes are missing");
  assert.match(styles, /transform:\s*scaleY/, "metric rhythm does not use transform-based animation");
});

test("the evaluation hero exports an accessible ambient video stage", () => {
  const html = readFileSync("out/projects/i2v-evaluation/index.html", "utf8");
  const video = html.match(/<video[^>]+instruction-following-001\.mp4[^>]*>/)?.[0] ?? "";
  assert.match(html, /aria-label="查看指令遵循代表案例与完整评分"/);
  ["autoPlay", "loop", "muted", "playsInline", 'preload="metadata"', 'poster="/images/i2v-evaluation/instruction-following-001.webp"'].forEach((attribute) => {
    assert.match(video, new RegExp(attribute), `hero video is missing ${attribute}`);
  });
  assert.doesNotMatch(video, /controls/, "hero ambient video must not expose native controls");
});

test("the homepage featured case defers video on mobile and data-saving connections", () => {
  const html = readFileSync("out/index.html", "utf8");
  const component = readFileSync("src/components/Home/FeaturedEvaluationCard.tsx", "utf8");
  const mediaPolicy = readFileSync("src/hooks/useAutoplayMediaPolicy.ts", "utf8");
  assert.match(html, /aria-label="查看AI视频生成质量评测项目"/);
  assert.match(html, /home-featured-7s\.jpg/, "homepage featured poster is missing");
  assert.doesNotMatch(html, /<video[^>]+home-featured-7s\.mp4/, "homepage must not preload the featured video during static render");
  assert.match(component, /preload="none"/, "homepage featured video must opt out of browser preloading");
  assert.match(component, /useAutoplayMediaPolicy/, "homepage featured video is not connection aware");
  assert.match(component, /video\.currentTime/, "evaluation HUD is not synchronized to the video timeline");
  assert.match(component, /IntersectionObserver/, "featured playback is not visibility managed");
  assert.match(mediaPolicy, /min-width: 769px/, "mobile devices are not excluded from autoplay");
  assert.match(mediaPolicy, /saveData/, "data-saving connections are not excluded from autoplay");
  assert.match(mediaPolicy, /slow-2g|2g/, "slow connections are not excluded from autoplay");
  assert.ok(existsSync("public/videos/i2v-evaluation/home-featured-7s.mp4"), "optimized featured video is missing");
  assert.ok(existsSync("public/images/i2v-evaluation/home-featured-7s.jpg"), "featured poster is missing");
});

test("the Score Lab video uses a poster-safe media state machine and custom controls", () => {
  const html = readFileSync("out/projects/i2v-evaluation/index.html", "utf8");
  const component = readFileSync("src/components/VideoEvaluation/EvaluationVideo.tsx", "utf8");
  const scoreLabVideo = html.match(/<video[^>]+视频播放器[^>]*>/)?.[0] ?? "";
  assert.doesNotMatch(scoreLabVideo, /controls/, "Score Lab must not expose native video controls");
  ["idle", "loading", "ready", "playing", "paused", "error"].forEach((state) => {
    assert.match(component, new RegExp(`"${state}"`), `media state machine is missing ${state}`);
  });
  assert.match(component, /onLoadedData/, "video does not wait for a renderable frame");
  assert.match(component, /HAVE_CURRENT_DATA/, "video readiness is not checked before reveal");
  assert.match(component, /video\.seeking/, "video does not wait for the safe initial seek");
  assert.match(component, /type="range"/, "custom timeline range input is missing");
  assert.match(component, /visibilitychange/, "background playback is not paused");
  assert.match(html, /加载并播放 雨后车站与流星/, "idle Score Lab does not expose an accessible load action");
});

test("the Score Lab exports a synchronized keyframe evidence panel", () => {
  const html = readFileSync("out/projects/i2v-evaluation/index.html", "utf8");
  const panel = readFileSync("src/components/VideoEvaluation/FrameEvidencePanel.tsx", "utf8");
  const inspector = readFileSync("src/components/VideoEvaluation/ActiveEvidenceInspector.tsx", "utf8");
  const mediaColumn = readFileSync("src/components/VideoEvaluation/ScoreLabMediaColumn.tsx", "utf8");
  const video = readFileSync("src/components/VideoEvaluation/EvaluationVideo.tsx", "utf8");

  ["FRAME EVIDENCE", "IF–001", "04 KEY FRAMES", "SYNCED TO VIDEO", "EVIDENCE TIMELINE", "EVIDENCE COVERAGE", "CAMERA MOTION", "AUDIO EVENT", "ISSUE / NOTE"].forEach((label) => {
    assert.match(html, new RegExp(label), `frame evidence export is missing ${label}`);
  });
  assert.match(panel, /caseData\.keyframes\.map/, "keyframes are not data-driven");
  assert.match(panel, /--evidence-progress/, "evidence cursor does not expose synchronized progress");
  ["ACTIVE EVIDENCE", "EVIDENCE DETAIL", "OBSERVED FACT", "PROMPT MATCH", "ISSUE TAG", "SEEK VIDEO"].forEach((label) => {
    assert.match(inspector, new RegExp(label), `active evidence inspector is missing ${label}`);
  });
  assert.match(inspector, /annotation\.targetX/, "annotation positions are not data-driven");
  assert.match(inspector, /previousFrame/, "consistency comparison mode is missing");
  assert.match(mediaColumn, /updateProgress/, "video progress is not connected to frame evidence");
  assert.match(video, /seekTo:/, "the Score Lab player does not expose an evidence seek command");
});

test("reveal animations keep working after client-side route changes", () => {
  const runtime = readFileSync("public/runtime.js", "utf8");
  const revealStyles = readFileSync("src/components/GlobalInteractions/Reveal.module.css", "utf8");
  assert.match(runtime, /MutationObserver/, "runtime does not watch client-side page replacements");
  assert.match(runtime, /record\.addedNodes/, "new reveal nodes are not registered");
  assert.match(revealStyles, /\.reveal\s*\{[\s\S]*?opacity:\s*1/, "content is hidden when runtime is unavailable");
});
