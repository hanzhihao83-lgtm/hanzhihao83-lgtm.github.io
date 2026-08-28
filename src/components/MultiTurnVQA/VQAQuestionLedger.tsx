"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./MultiTurnVQAProject.module.css";

type ReviewStatus = "pass" | "review" | "fail";

type QuestionReview = {
  id: string;
  question: string;
  primary: string;
  secondary: string;
  checkItem: string;
  evidence: "F01" | "F02" | "F03" | "R01";
  dependency: string;
  status: ReviewStatus;
  statusLabel: string;
  decisionBasis: string;
  nextAction: string;
};

const questionReviews: readonly QuestionReview[] = [
  {
    id: "Q01",
    question: "桌面上有什么物品？",
    primary: "对象识别",
    secondary: "答案充分",
    checkItem: "对象可定位",
    evidence: "F01",
    dependency: "NONE",
    status: "pass",
    statusLabel: "PASS / GROUNDED",
    decisionBasis: "问题独立完整，杯子和书本均存在可回查证据。",
    nextAction: "保留样本，进入下一轮检查。",
  },
  {
    id: "Q02",
    question: "它是什么颜色的？",
    primary: "指代消解",
    secondary: "属性追踪",
    checkItem: "指代唯一性",
    evidence: "F02",
    dependency: "Q01",
    status: "review",
    statusLabel: "REVIEW / AMBIGUOUS",
    decisionBasis: "Q01同时出现杯子与书本，“它”的指向存在歧义。",
    nextAction: "改写为“其中带把手的物品是什么颜色？”。",
  },
  {
    id: "Q03",
    question: "杯子旁边的物品是什么颜色？",
    primary: "属性追踪",
    secondary: "对象识别 / 上下文一致",
    checkItem: "属性一致性",
    evidence: "F03",
    dependency: "Q02",
    status: "pass",
    statusLabel: "PASS / STABLE",
    decisionBasis: "F03黄色书本与后续颜色回答保持一致。",
    nextAction: "保留样本，并继续检查上下文依赖。",
  },
  {
    id: "Q04",
    question: "书在窗户的什么位置？",
    primary: "空间关系",
    secondary: "上下文一致",
    checkItem: "参照物完整性",
    evidence: "R01",
    dependency: "Q03",
    status: "pass",
    statusLabel: "PASS / GROUNDED",
    decisionBasis: "画面中的窗户与R01关系节点共同支持空间描述。",
    nextAction: "保留样本，记录空间关系证据。",
  },
] as const;

const statusCounts = questionReviews.reduce<Record<ReviewStatus, number>>(
  (counts, review) => ({ ...counts, [review.status]: counts[review.status] + 1 }),
  { pass: 0, review: 0, fail: 0 },
);

const SCAN_DURATION = 2900;

export function VQAQuestionLedger() {
  const ledgerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scanRevision, setScanRevision] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const activeQuestion = questionReviews[activeIndex] ?? questionReviews[0];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
      if (mediaQuery.matches) setActiveIndex(1);
    };

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
    const ledger = ledgerRef.current;
    if (!ledger) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.15 },
    );

    observer.observe(ledger);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || isHovered || !isInView || !isPageVisible) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % questionReviews.length);
    }, SCAN_DURATION);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isHovered, isInView, isPageVisible, prefersReducedMotion, scanRevision]);

  const selectQuestion = (index: number) => {
    setActiveIndex(index);
    setScanRevision((revision) => revision + 1);
  };

  return (
    <div
      className={styles.ledgerReview}
      data-status={activeQuestion.status}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={ledgerRef}
    >
      <header className={styles.ledgerHeading}>
        <span>05 / QUESTION LEDGER</span>
        <h2>问题标签与唯一维度</h2>
        <div className={styles.ledgerCounts} aria-label="审查状态汇总：3条通过，1条待复核，0条失败">
          <span data-status="pass">{String(statusCounts.pass).padStart(2, "0")} PASS</span>
          <span data-status="review">{String(statusCounts.review).padStart(2, "0")} REVIEW</span>
          <span data-status="fail">{String(statusCounts.fail).padStart(2, "0")} FAIL</span>
        </div>
      </header>

      <div className={styles.ledgerScanBar}>
        <span>AUTO SCAN / CHECK ITEM → STATUS</span>
        <strong aria-live="polite">INSPECTING {activeQuestion.id}</strong>
      </div>

      <div className={styles.ledgerTable} role="table" aria-label="动态问题审查表">
        <div className={styles.ledgerHeader} role="row">
          {[
            "Question ID",
            "当前问题",
            "Primary Dimension",
            "Check Item",
            "Evidence",
            "Review Status",
          ].map((label) => <span key={label} role="columnheader">{label}</span>)}
        </div>

        {questionReviews.map((review, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              className={styles.ledgerRow}
              data-active={isActive}
              data-status={review.status}
              key={review.id}
              role="row"
            >
              <div className={styles.ledgerQuestionId} data-label="Question ID" role="cell">
                <button
                  aria-label={`审查 ${review.id}：${review.question}，当前状态 ${review.statusLabel}`}
                  aria-pressed={isActive}
                  onClick={() => selectQuestion(index)}
                  type="button"
                >
                  {review.id}
                </button>
              </div>
              <strong className={styles.ledgerQuestion} data-label="当前问题" role="cell">{review.question}</strong>
              <span className={styles.primaryDimension} data-label="Primary Dimension" role="cell"><i aria-hidden="true" />{review.primary}</span>
              <span className={styles.ledgerCheckItem} data-label="Check Item" role="cell">{review.checkItem}</span>
              <span className={styles.ledgerEvidenceCode} data-label="Evidence" role="cell">{review.evidence}</span>
              <span className={styles.ledgerStatus} data-label="Review Status" data-status={review.status} role="cell"><i aria-hidden="true" />{review.statusLabel}</span>

              {isActive ? (
                <div className={styles.ledgerMobileDetails} role="cell" aria-live="polite">
                  <ReviewDetails review={review} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <section className={styles.ledgerInspector} aria-live="polite" aria-atomic="true">
        <ReviewDetails review={activeQuestion} />
      </section>

      <footer className={styles.ledgerLegend} aria-label="审查状态图例">
        <span data-status="pass">PASS / 证据充分</span>
        <span data-status="review">REVIEW / 需要改写或确认</span>
        <span data-status="fail">FAIL / 明确冲突</span>
      </footer>

      <p className={styles.demoBoundary}>DEMO SAMPLE / 主维度唯一性仅用于说明登记方法，不代表正式数据集统计。</p>
    </div>
  );
}

function ReviewDetails({ review }: { review: QuestionReview }) {
  return (
    <>
      <div className={styles.ledgerDetailCheck}>
        <small>CHECK ITEM</small>
        <strong>{review.checkItem}</strong>
        <dl>
          <div><dt>SECONDARY TAGS</dt><dd>{review.secondary}</dd></div>
          <div><dt>DEPENDENCY TURN</dt><dd>{review.dependency}</dd></div>
        </dl>
      </div>
      <div>
        <small>DECISION BASIS</small>
        <strong>{review.decisionBasis}</strong>
      </div>
      <div>
        <small>NEXT ACTION</small>
        <strong>{review.nextAction}</strong>
      </div>
      <div className={styles.ledgerFinalStatus} data-status={review.status}>
        <small>FINAL STATUS</small>
        <strong><i aria-hidden="true" />{review.statusLabel}</strong>
      </div>
    </>
  );
}
