"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./HomePage.module.css";

const reviewStages = [
  { code: "01", label: "MASK", status: "MASKING / MODEL IDENTITY", candidate: "A" },
  { code: "02", label: "COMPARE", status: "COMPARING / SHARED PROMPT", candidate: "C" },
  { code: "03", label: "EVIDENCE", status: "TRACING / ROLE EVIDENCE", candidate: "B" },
  { code: "04", label: "REVIEW", status: "READY / BLIND REVIEW", candidate: "D" },
] as const;

const dimensions = ["人设", "语气", "知识", "情境", "边界"] as const;
const candidates = ["A", "B", "C", "D"] as const;
const STAGE_DURATION = 1650;

export function BlindEvaluationCoverVisual() {
  const visualRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setPrefersReducedMotion(query.matches);
      if (query.matches) setActiveStage(reviewStages.length - 1);
    };

    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const updateVisibility = () => setIsPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    const visual = visualRef.current;
    if (!visual) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.24 },
    );

    observer.observe(visual);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !isInView || !isPageVisible) return;

    const timer = window.setTimeout(() => {
      setActiveStage((stage) => (stage + 1) % reviewStages.length);
    }, STAGE_DURATION);

    return () => window.clearTimeout(timer);
  }, [activeStage, isInView, isPageVisible, prefersReducedMotion]);

  const stage = reviewStages[activeStage];

  return (
    <div className={`${styles.projectVisual} ${styles.blindCoverVisual}`} ref={visualRef}>
      <div className={styles.blindCoverGrid} aria-hidden="true" />
      <header className={styles.blindCoverHeader}>
        <span>BLIND ROOM / 04</span>
        <i><b />IDENTITY MASKED</i>
      </header>

      <div className={styles.blindCoverBody}>
        <ol className={styles.blindCandidateRail} aria-label="匿名候选">
          {candidates.map((candidate) => (
            <li data-active={stage.candidate === candidate} key={candidate}>
              <span>CANDIDATE</span><b>{candidate}</b>
            </li>
          ))}
        </ol>

        <section className={styles.blindPromptPanel} aria-label="当前盲测题面">
          <p>PROMPT / SHARED</p>
          <strong>“朋友临时失约，你会怎样回应？”</strong>
          <div className={styles.blindResponse}>
            <span>RESPONSE / {stage.candidate}</span>
            <i /><i /><i />
          </div>
        </section>

        <div className={styles.blindEvidencePanel} aria-hidden="true">
          <p>EVIDENCE / 05</p>
          {dimensions.map((dimension, index) => (
            <span data-active={index <= activeStage} key={dimension}>
              <i>{dimension}</i><b><em style={{ width: `${44 + ((index * 13 + activeStage * 9) % 47)}%` }} /></b>
            </span>
          ))}
        </div>
      </div>

      <div className={styles.blindCoverScan} aria-hidden="true"><i /></div>
      <footer className={styles.blindCoverFooter}>
        <ol aria-hidden="true">
          {reviewStages.map((item, index) => (
            <li data-active={activeStage === index} key={item.code}>
              <span>{item.code}</span><i>{item.label}</i>
            </li>
          ))}
        </ol>
        <span aria-live="polite">{stage.status}</span>
      </footer>
    </div>
  );
}
