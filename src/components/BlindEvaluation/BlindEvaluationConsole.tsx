"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./BlindEvaluationProject.module.css";

const candidates = ["A", "B", "C", "D"] as const;
const dimensions = ["CHARACTER", "VOICE", "BOUNDARY", "CONTEXT", "SAFETY"] as const;
const stageCopy = [
  "MASKING / MODEL IDENTITY",
  "SAMPLING / SHARED PROMPT",
  "REVIEWING / ROLE EVIDENCE",
  "CALIBRATING / DISAGREEMENT",
  "READY / BLIND RESULT",
] as const;

const STAGE_DURATION = 1450;

export function BlindEvaluationConsole() {
  const consoleRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setPrefersReducedMotion(query.matches);
      if (query.matches) setActiveStage(stageCopy.length - 1);
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
    const current = consoleRef.current;
    if (!current) return;
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !isInView || !isPageVisible) return;
    const timer = window.setTimeout(() => setActiveStage((stage) => (stage + 1) % stageCopy.length), STAGE_DURATION);
    return () => window.clearTimeout(timer);
  }, [activeStage, isInView, isPageVisible, prefersReducedMotion]);

  return (
    <div className={styles.heroConsole} ref={consoleRef}>
      <header>
        <span>BLIND TEST / SESSION 01</span>
        <p><i aria-hidden="true" />IDENTITY MASKED</p>
        <strong>DEMO / UNDISCLOSED</strong>
      </header>

      <div className={styles.matrix}>
        <div className={styles.matrixCorner}>DIMENSION</div>
        {candidates.map((candidate, index) => (
          <div className={styles.candidateHead} data-active={activeStage === index} key={candidate}>
            <span>CANDIDATE</span><strong>{candidate}</strong>
          </div>
        ))}
        {dimensions.map((dimension, rowIndex) => (
          <div className={styles.matrixRow} key={dimension}>
            <div className={styles.dimensionLabel}><span>{String(rowIndex + 1).padStart(2, "0")}</span>{dimension}</div>
            {candidates.map((candidate, columnIndex) => (
              <div className={styles.matrixCell} data-active={activeStage === columnIndex || activeStage === stageCopy.length - 1} key={candidate}>
                <i style={{ "--blind-level": `${32 + ((rowIndex * 17 + columnIndex * 13) % 52)}%` } as React.CSSProperties} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className={styles.consoleFoot}>
        <ol>
          {stageCopy.map((stage, index) => <li data-active={activeStage === index} key={stage}><span>{String(index + 1).padStart(2, "0")}</span></li>)}
        </ol>
        <p aria-live="polite">{stageCopy[activeStage]}</p>
      </div>
    </div>
  );
}
