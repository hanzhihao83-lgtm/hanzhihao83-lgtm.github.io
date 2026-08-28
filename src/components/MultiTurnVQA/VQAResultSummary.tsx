"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./MultiTurnVQAProject.module.css";

type QuestionResult = {
  id: string;
  status: string;
  type: "pass" | "review";
  basis: string;
};

const resultSummary = {
  passed: 3,
  total: 4,
  displayRate: "75%",
  title: "完成一组四轮 SFT 案例，3 项通过，1 项进入复核。",
  description:
    "覆盖 5 项质量维度与 6 步审查流程，成功定位指代歧义与首轮答案遗漏，并将问题样本回流至改写环节。",
  boundary:
    "当前结果基于一组四轮代表案例，用于展示数据改写与质量审查方法，不代表正式数据集的统计性结论。",
} as const;

const questionResults: readonly QuestionResult[] = [
  {
    id: "Q01",
    status: "PASS / GROUNDED",
    type: "pass",
    basis: "桌面、杯子与书本均存在可回查的视觉证据。",
  },
  {
    id: "Q02",
    status: "REVIEW / AMBIGUOUS",
    type: "review",
    basis: "“它”存在杯子和书本两个候选对象，需要改写为唯一指代。",
  },
  {
    id: "Q03",
    status: "PASS / STABLE",
    type: "pass",
    basis: "书本颜色与相邻关系在问题和答案中保持稳定。",
  },
  {
    id: "Q04",
    status: "PASS / GROUNDED",
    type: "pass",
    basis: "窗户作为参照物明确，空间关系可以由画面复核。",
  },
] as const;

const SCAN_DURATION = 2600;
const resultTitleParts = resultSummary.title.split("3 项通过");

export function VQAResultSummary() {
  const resultRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scanRevision, setScanRevision] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const activeResult = questionResults[activeIndex] ?? questionResults[0];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const updatePageVisibility = () => setIsPageVisible(!document.hidden);
    updatePageVisibility();
    document.addEventListener("visibilitychange", updatePageVisibility);
    return () => document.removeEventListener("visibilitychange", updatePageVisibility);
  }, []);

  useEffect(() => {
    const result = resultRef.current;
    if (!result) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.18 },
    );

    observer.observe(result);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !isInView || !isPageVisible) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % questionResults.length);
    }, SCAN_DURATION);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isInView, isPageVisible, prefersReducedMotion, scanRevision]);

  const selectQuestion = (index: number) => {
    setActiveIndex(index);
    setScanRevision((revision) => revision + 1);
  };

  return (
    <div className={styles.resultConsole} ref={resultRef}>
      <header className={styles.resultHeader}>
        <div>
          <span>08 / RESULT</span>
          <h2>结果与能力沉淀</h2>
        </div>
        <p><i aria-hidden="true" />DEMO SAMPLE / REVIEW COMPLETE</p>
      </header>

      <div className={styles.resultMain}>
        <div className={styles.resultGauge}>
          <div
            aria-label={`${resultSummary.total}个问题中${resultSummary.passed}个通过，演示通过率${resultSummary.displayRate}`}
            className={styles.resultOrbit}
            role="img"
          >
            <i className={styles.resultAxisHorizontal} aria-hidden="true" />
            <i className={styles.resultAxisVertical} aria-hidden="true" />
            <i className={styles.resultSweep} aria-hidden="true" />
            <div className={styles.resultNumber}>
              0{resultSummary.passed}<small>/0{resultSummary.total}</small>
            </div>
          </div>
          <p>{resultSummary.displayRate} / DEMO PASS</p>
        </div>

        <div className={styles.resultNarrative}>
          <div>
            <span className={styles.resultLabel}>ONE CLEAR RESULT</span>
            <h3>
              {resultTitleParts[0]}<em>3 项通过</em>{resultTitleParts[1]}
            </h3>
            <p>{resultSummary.description}</p>
          </div>

          <div className={styles.resultQuestionTrack} role="group" aria-label="选择问题审查结果">
            {questionResults.map((result, index) => (
              <button
                aria-label={`${result.id}：${result.status}`}
                aria-pressed={activeIndex === index}
                className={styles.resultQuestion}
                data-type={result.type}
                key={result.id}
                onClick={() => selectQuestion(index)}
                type="button"
              >
                <span>{result.id}</span>
                <strong>{result.type === "pass" ? "PASS" : "REVIEW"}</strong>
                <small>{result.status}</small>
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className={styles.resultInspector} aria-live="polite" aria-atomic="true">
        <strong className={styles.resultActiveId}>{activeResult.id}</strong>
        <div className={styles.resultDecision} key={`${activeResult.id}-${scanRevision}`}>
          <span>DECISION BASIS</span>
          <strong>{activeResult.basis}</strong>
        </div>
        <div className={styles.resultFinalStatus} data-type={activeResult.type}>
          <span>FINAL STATUS</span>
          <strong>{activeResult.status}</strong>
        </div>
        <div className={styles.resultBoundary}>
          <span>DEMO BOUNDARY</span>
          <p>{resultSummary.boundary}</p>
        </div>
      </section>
    </div>
  );
}
