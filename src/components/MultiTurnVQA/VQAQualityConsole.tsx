"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./MultiTurnVQAProject.module.css";

type QualityScore = {
  id: string;
  name: string;
  score: number;
  status: string;
  basis: string;
  issue: string;
  action: string;
};

const qualityScores: readonly QualityScore[] = [
  {
    id: "01",
    name: "视觉事实准确性",
    score: 4,
    status: "PASS / GROUNDED",
    basis: "红色杯子、黄色书本和空间关系均能回到画面证据。",
    issue: "Q1 对桌面物品的枚举仍需补充绿色植物。",
    action: "保留事实节点，补全首轮对象集合。",
  },
  {
    id: "02",
    name: "上下文依赖有效性",
    score: 3,
    status: "REVIEW / WEAK LINK",
    basis: "Q3 使用前文中的杯子，形成了有效依赖。",
    issue: "Q4 可脱离前文独立回答，Q2 的历史指向偏弱。",
    action: "将 Q4 改为“前面提到的黄色书位于窗户的什么位置？”",
  },
  {
    id: "03",
    name: "指代唯一性",
    score: 3,
    status: "REVIEW / AMBIGUOUS",
    basis: "Q1 同时建立杯子与书本两个候选对象。",
    issue: "Q2 使用“它”，无法唯一确定指向杯子还是书本。",
    action: "将 Q2 改为“其中带把手的物品是什么颜色？”",
  },
  {
    id: "04",
    name: "多轮一致性",
    score: 4,
    status: "PASS / STABLE",
    basis: "杯子颜色、书本颜色及相邻关系在 Q1—Q4 中未发生冲突。",
    issue: "一致性成立，但建立在 Q2 被人工解释为杯子的前提上。",
    action: "修复 Q2 后保留整条问题链。",
  },
  {
    id: "05",
    name: "答案完整性",
    score: 3,
    status: "REVIEW / INCOMPLETE",
    basis: "各轮答案简洁，且没有加入画面外信息。",
    issue: "A1 只回答杯子和书本，遗漏画面中的绿色植物。",
    action: "A1 补充绿色植物，再执行一次全链回查。",
  },
] as const;

const SCAN_DURATION = 3000;

export function VQAQualityConsole() {
  const consoleRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scanRevision, setScanRevision] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const activeScore = qualityScores[activeIndex] ?? qualityScores[0];
  const activeStatus = activeScore.status.startsWith("PASS") ? "pass" : "review";

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
    const scoreConsole = consoleRef.current;
    if (!scoreConsole) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.18 },
    );

    observer.observe(scoreConsole);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !isInView || !isPageVisible) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % qualityScores.length);
    }, SCAN_DURATION);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isInView, isPageVisible, prefersReducedMotion, scanRevision]);

  const selectScore = (index: number) => {
    setActiveIndex(index);
    setScanRevision((revision) => revision + 1);
  };

  return (
    <div className={styles.qualityConsole} ref={consoleRef}>
      <header className={styles.qualityConsoleHeader}>
        <div>
          <span>06 / QUALITY CHECK</span>
          <h2>五项质量检查</h2>
        </div>
        <p><i aria-hidden="true" />AUTO SCAN / DEMO SAMPLE</p>
      </header>

      <div className={styles.qualityConsoleLayout}>
        <div className={styles.qualityScoreList} role="group" aria-label="选择演示评分维度">
          {qualityScores.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                aria-label={`${item.name}，演示评分 ${item.score} 分，${item.status}`}
                aria-pressed={isActive}
                className={styles.qualityScoreRow}
                key={item.id}
                onClick={() => selectScore(index)}
                type="button"
              >
                <span className={styles.qualityScoreIndex}>{item.id}</span>
                <strong>{item.name}</strong>
                <span className={styles.qualityScoreSegments} aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((segment) => (
                    <i data-earned={segment <= item.score} key={segment} />
                  ))}
                </span>
                <span className={styles.qualityScoreValue}>{item.score}<small> / 5</small></span>
              </button>
            );
          })}
        </div>

        <aside className={styles.qualityScoreDetail} data-status={activeStatus} aria-live="polite" aria-atomic="true">
          <div className={styles.qualityDetailLabel}>DIMENSION {activeScore.id} / {activeScore.name}</div>
          <div className={styles.qualityReticle} aria-label={`演示评分 ${activeScore.score} 分，状态 ${activeScore.status}`}>
            <span aria-hidden="true" />
            <strong>{activeScore.score}<small> / 5</small></strong>
            <div className={styles.qualityDetailStatus}><i aria-hidden="true" />{activeScore.status}</div>
          </div>

          <div className={styles.qualityDetailContent} key={`${activeScore.id}-${scanRevision}`}>
            <div><span>DECISION BASIS</span><strong>{activeScore.basis}</strong></div>
            <div><span>ISSUE / NOTE</span><strong>{activeScore.issue}</strong></div>
            <div><span>NEXT ACTION</span><strong>{activeScore.action}</strong></div>
          </div>

          <div className={styles.qualityDemoBoundary}>DEMO SAMPLE SCORE / NOT A FORMAL PROJECT METRIC</div>
          <i className={styles.qualityScanProgress} key={`progress-${activeScore.id}-${scanRevision}`} aria-hidden="true" />
        </aside>
      </div>
    </div>
  );
}
