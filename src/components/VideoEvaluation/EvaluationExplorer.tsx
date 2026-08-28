"use client";

import { useCallback, useId, useState } from "react";

import type { EvaluationDimension, Product, VideoCase } from "@/types/evaluation";

import { EvaluationDimensionBento } from "./EvaluationDimensionBento";
import { IssueLedger } from "./IssueLedger";
import { ScoreLabMediaColumn } from "./ScoreLabMediaColumn";
import dimensionStyles from "./EvaluationDimensions.module.css";
import styles from "./VideoEvaluationProject.module.css";

interface EvaluationExplorerProps {
  cases: VideoCase[];
  comparison: React.ReactNode;
  dimensions: EvaluationDimension[];
  products: Product[];
}

const audioStatusLabels: Record<VideoCase["audioStatus"], string> = {
  available: "AAC 立体声音轨可用",
  "missing-required": "要求声音，但音轨缺失",
  "not-required": "提示词未要求声音 · N/A",
  unknown: "声音状态待确认",
};

const inspectionLabels: Record<EvaluationDimension["id"], { facts: string; prompt: string }> = {
  "instruction-following": { prompt: "PROMPT CHECK", facts: "REQUIREMENT CHECK" },
  "motion-quality": { prompt: "MOTION TRACE", facts: "MOVEMENT CHECKPOINTS" },
  "visual-quality": { prompt: "FRAME INSPECTION", facts: "FRAME OBSERVATIONS" },
  "temporal-consistency": { prompt: "TEMPORAL LOCK", facts: "CONSISTENCY CHECK" },
  "audio-visual-sync": { prompt: "AUDIO × VISUAL", facts: "SYNC CHECKPOINTS" },
};

const dimensionCardDetails: Record<EvaluationDimension["id"], { caseTitle: string; englishName?: string; metrics: readonly [string, string] }> = {
  "instruction-following": { caseTitle: "雨后车站与流星", metrics: ["主体符合", "场景完整"] },
  "motion-quality": { caseTitle: "跑步跨越水洼", metrics: ["动作连贯", "落地稳定"] },
  "visual-quality": { caseTitle: "雨后天台画面质量", metrics: ["细节清晰", "光影自然"] },
  "temporal-consistency": { caseTitle: "透明雨伞形变测试", metrics: ["主体稳定", "伞面形变"] },
  "audio-visual-sync": { caseTitle: "脚步与环境声同步", englishName: "AUDIO–VISUAL SYNC", metrics: ["节奏匹配", "事件对齐"] },
};

function displayScore(score: VideoCase["score"]) {
  if (score === "NA") return "N/A";
  if (score === null) return "—";
  return score;
}

function PromptDisclosure({ caseId, originalPrompt }: Pick<VideoCase, "caseId" | "originalPrompt">) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  if (!originalPrompt) return null;

  return (
    <div className={styles.fullPrompt}>
      <button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className={styles.promptToggle}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span>{isOpen ? "收起完整提示词" : "查看完整提示词"}</span>
        <i aria-hidden="true">{isOpen ? "−" : "+"}</i>
      </button>
      {isOpen ? (
        <div aria-label={`${caseId} 完整原始提示词`} className={styles.fullPromptContent} id={contentId} role="region">
          <div>{originalPrompt}</div>
        </div>
      ) : null}
    </div>
  );
}

export function EvaluationExplorer({ cases, comparison, dimensions, products }: EvaluationExplorerProps) {
  const firstDimension = dimensions[0];
  const [activeDimensionId, setActiveDimensionId] = useState(firstDimension.id);
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [activeTagId, setActiveTagId] = useState<string | null>(null);

  const activeDimension = dimensions.find((item) => item.id === activeDimensionId) ?? firstDimension;
  const dimensionCases = cases.filter((item) => item.dimension === activeDimensionId);
  const activeCase = dimensionCases[activeCaseIndex] ?? dimensionCases[0] ?? null;
  const filteredTagCases = activeTagId ? cases.filter((item) => item.issueTags.includes(activeTagId)) : [];
  const activeProduct = activeCase ? products.find((product) => product.id === activeCase.product) : null;
  const inspectionLabel = inspectionLabels[activeDimension.id];
  const scoredCases = cases.filter((item) => typeof item.score === "number");
  const validWeight = scoredCases.reduce((total, item) => total + item.weight, 0);
  const overallScore = validWeight > 0
    ? scoredCases.reduce((total, item) => total + (typeof item.score === "number" ? item.score * item.weight : 0), 0) / validWeight
    : 0;
  const overallPercent = Math.round((overallScore / 5) * 100);

  const switchDimension = (dimensionId: EvaluationDimension["id"]) => {
    setActiveDimensionId(dimensionId);
    setActiveCaseIndex(0);
  };

  const viewDimensionCase = (dimensionId: EvaluationDimension["id"]) => {
    switchDimension(dimensionId);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("score-lab")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  const openCase = useCallback((item: VideoCase) => {
    const matching = cases.filter((candidate) => candidate.dimension === item.dimension);
    setActiveDimensionId(item.dimension);
    setActiveCaseIndex(Math.max(0, matching.findIndex((candidate) => candidate.id === item.id)));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("score-lab")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }, [cases]);

  const selectIssueTag = useCallback((tagId: string) => setActiveTagId(tagId), []);
  const clearIssueTag = useCallback(() => setActiveTagId(null), []);

  return (
    <>
      <section aria-labelledby="dimension-title" className={styles.section} id="dimensions">
        <div className={dimensionStyles.overview}>
          <div className={dimensionStyles.overviewCopy}>
            <span>03 / FIVE-DIMENSION SCORE</span>
            <div>
              <h2 id="dimension-title">五维评分系统</h2>
              <p>以统一标尺拆解生成质量，定位问题并形成可复核结论。</p>
            </div>
          </div>
          <dl className={dimensionStyles.overviewStats}>
            <div><dt>OVERALL SCORE</dt><dd>{overallScore.toFixed(2)} <i>/ 5</i></dd></div>
            <div><dt>OVERALL PERCENT</dt><dd>{overallPercent}<i>%</i></dd></div>
            <div><dt>CASE TYPE</dt><dd>CASE DEMO</dd></div>
            <div><dt>SAMPLE</dt><dd>N=1 <i>/ DIM</i></dd></div>
          </dl>
        </div>
        <EvaluationDimensionBento cases={cases} details={dimensionCardDetails} dimensions={dimensions} onViewCase={viewDimensionCase} />
      </section>

      <section
        aria-labelledby="score-lab-title"
        className={`${styles.section} ${styles.scoreLab}`}
        id="score-lab"
        style={{ "--lab-accent": activeDimension.color } as React.CSSProperties}
      >
        <div className={styles.labHeader}>
          <div><span>04 / INTERACTIVE SCORE LAB</span><h2 id="score-lab-title">Score Lab</h2></div>
          <p>切换维度即可检视对应视频、观察事实和问题标签；上一段视频会立即暂停并重置。</p>
        </div>

        <div aria-label="评测维度" className={styles.dimensionTabs} role="tablist">
          {dimensions.map((dimension) => {
            const dimensionCase = cases.find((item) => item.dimension === dimension.id);
            return (
              <button
                aria-controls="score-lab-panel"
                aria-selected={dimension.id === activeDimensionId}
                key={dimension.id}
                onClick={() => switchDimension(dimension.id)}
                role="tab"
                style={{ "--tab-accent": dimension.color } as React.CSSProperties}
                type="button"
              ><i aria-hidden="true" /><span>{dimension.name}</span><strong>{displayScore(dimensionCase?.score ?? null)}</strong></button>
            );
          })}
        </div>

        {activeCase ? (
          <div className={styles.labWorkspace} id="score-lab-panel" role="tabpanel">
            <div className={styles.labMediaColumn}>
              <ScoreLabMediaColumn
                caseData={activeCase}
                dimension={activeDimension}
                key={activeCase.id}
                productName={activeProduct?.name ?? "未知产品"}
              />
              {dimensionCases.length > 1 && (
                <div aria-label="同维度案例" className={styles.caseTabs}>
                  {dimensionCases.map((item, index) => (
                    <button aria-pressed={index === activeCaseIndex} key={item.id} onClick={() => setActiveCaseIndex(index)} type="button">
                      {String(index + 1).padStart(2, "0")} / {item.caseId}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <aside className={styles.caseInfo}>
              <div className={styles.caseKicker}>
                <span>{activeDimension.name} / {activeDimension.englishName}</span>
                <strong>CASE / {activeCase.caseId}</strong>
              </div>
              <div className={styles.caseScore}>
                <span>SCORE</span>
                <strong>{displayScore(activeCase.score)}</strong>
                <i>/ 5</i>
                <p>{activeCase.scoreLabel ?? "等级待确认"}</p>
              </div>
              <dl className={styles.caseMeta}>
                <div><dt>PRODUCT</dt><dd>{activeProduct?.name ?? "未知产品"}</dd></div>
                <div><dt>WEIGHT</dt><dd>{Math.round(activeCase.weight * 100)}%</dd></div>
                <div><dt>COVERAGE</dt><dd>{activeCase.evaluationCoverage === "有限" ? "评测覆盖度有限" : "标准覆盖"}</dd></div>
                <div><dt>AUDIO</dt><dd>{audioStatusLabels[activeCase.audioStatus]}</dd></div>
                {activeCase.speechTimeRange && <div><dt>VOICE TIME</dt><dd>{activeCase.speechTimeRange.start.toFixed(2)}–{activeCase.speechTimeRange.end.toFixed(2)} 秒</dd></div>}
              </dl>
              <h3 className={styles.caseTitle}>{activeCase.title}</h3>
              {activeCase.coverageNote && <div className={styles.coverageNotice}><span>LIMITED COVERAGE</span><p>{activeCase.coverageNote}</p></div>}
              {activeCase.focusNote && <div className={styles.focusNote}><span>REVIEW FOCUS</span><p>{activeCase.focusNote}</p></div>}
              <div className={styles.prompt}>
                <span>{inspectionLabel.prompt} / PROMPT SUMMARY</span>
                <p>{activeCase.promptSummary}</p>
                <PromptDisclosure caseId={activeCase.caseId} key={activeCase.id} originalPrompt={activeCase.originalPrompt} />
              </div>
              <div className={styles.facts}><span>{inspectionLabel.facts} / OBSERVABLE FACTS</span><ul>{activeCase.observableFacts.map((fact) => <li key={fact}><i aria-hidden="true">✓</i><span>{fact}</span></li>)}</ul></div>
              <div className={styles.caseTags}><span>ISSUE TAGS</span><div>{activeCase.issueTags.map((tagId) => <i key={tagId}>{activeDimension.issueTags.find((tag) => tag.id === tagId)?.label}</i>)}</div></div>
              <div className={styles.evaluatorNote}><span>EVALUATOR NOTE</span><p>{activeCase.evaluatorNote}</p></div>
            </aside>
          </div>
        ) : <div className={styles.emptyCase} role="status"><strong>暂无代表案例</strong></div>}
      </section>

      {comparison}

      <IssueLedger
        activeTagId={activeTagId}
        cases={cases}
        className={styles.section}
        dimensions={dimensions}
        filteredCases={filteredTagCases}
        onClearTag={clearIssueTag}
        onSelectTag={selectIssueTag}
        onVerifyCase={openCase}
      />
    </>
  );
}
