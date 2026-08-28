"use client";

import type { CSSProperties, FocusEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./WeightedResultSection.module.css";

export interface WeightedResultDimension {
  caseId: string;
  color: string;
  contribution: number;
  id: string;
  name: string;
  score: number;
  weight: number;
}

interface WeightedResultSectionProps {
  className?: string;
  dimensions: WeightedResultDimension[];
  overallScore: number;
  percentage: number;
  productName: string;
  rating: string;
  sampleSize: number;
  status: string;
  validWeight: number;
}

const SCORE_DURATION = 1050;
const SCAN_START = 1250;
const SCAN_STEP = 470;
const SUMMARY_START = 3650;
const LOOP_DURATION = 5300;
const RESUME_DELAY = 800;

function formatNumber(value: number) {
  return value.toFixed(2);
}

export function WeightedResultSection({
  className,
  dimensions,
  overallScore,
  percentage,
  productName,
  rating,
  sampleSize,
  status,
  validWeight,
}: WeightedResultSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const percentageRef = useRef<HTMLSpanElement>(null);
  const animationFrameRef = useRef(0);
  const sequenceTimersRef = useRef<number[]>([]);
  const resumeTimerRef = useRef<number | null>(null);
  const focusWithinRowsRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isFinal, setIsFinal] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [manualIndex, setManualIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const [loopIteration, setLoopIteration] = useState(0);

  const totalFormula = dimensions.map((dimension) => formatNumber(dimension.contribution)).join(" + ");
  const activeDimension = activeIndex === null ? null : dimensions[activeIndex];
  const formula = activeDimension
    ? `${activeDimension.name}：${formatNumber(activeDimension.score)} / 5 × ${Math.round(activeDimension.weight * 100)}% = ${formatNumber(activeDimension.contribution)}`
    : isFinal ? "SCORE × WEIGHT = CONTRIBUTION" : "CALCULATING WEIGHTED RESULT…";

  const clearSequence = useCallback(() => {
    window.cancelAnimationFrame(animationFrameRef.current);
    sequenceTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    sequenceTimersRef.current = [];
  }, []);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current === null) return;
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = null;
  }, []);

  const showFinalScore = useCallback(() => {
    if (scoreRef.current) scoreRef.current.textContent = formatNumber(overallScore);
    if (percentageRef.current) percentageRef.current.textContent = String(percentage).padStart(2, "0");
    sectionRef.current?.style.setProperty("--weighted-progress", `${percentage}%`);
    sectionRef.current?.setAttribute("data-score-complete", "true");
  }, [overallScore, percentage]);

  const selectManualDimension = useCallback((index: number) => {
    clearResumeTimer();
    setManualIndex(index);
    setActiveIndex(index);
    setIsFinal(false);
  }, [clearResumeTimer]);

  const resumeAutomaticDemo = useCallback(() => {
    clearResumeTimer();
    if (pinnedIndex !== null || isReducedMotion) return;
    resumeTimerRef.current = window.setTimeout(() => {
      setManualIndex(null);
      setLoopIteration((current) => current + 1);
      resumeTimerRef.current = null;
    }, RESUME_DELAY);
  }, [clearResumeTimer, isReducedMotion, pinnedIndex]);

  const handleRowClick = (index: number) => {
    if (pinnedIndex === index) {
      setPinnedIndex(null);
      setManualIndex(null);
      setLoopIteration((current) => current + 1);
      return;
    }
    setPinnedIndex(index);
    selectManualDimension(index);
  };

  const handleRowBlur = (event: FocusEvent<HTMLButtonElement>) => {
    const rows = event.currentTarget.parentElement;
    if (rows?.contains(event.relatedTarget as Node | null)) return;
    focusWithinRowsRef.current = false;
    if (pinnedIndex !== null) {
      selectManualDimension(pinnedIndex);
      return;
    }
    resumeAutomaticDemo();
  };

  const handleRowMouseLeave = () => {
    if (focusWithinRowsRef.current) return;
    if (pinnedIndex !== null) {
      selectManualDimension(pinnedIndex);
      return;
    }
    resumeAutomaticDemo();
  };

  const replay = () => {
    clearResumeTimer();
    setPinnedIndex(null);
    setManualIndex(null);
    setLoopIteration((current) => current + 1);
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), {
      rootMargin: "-15% 0px -20% 0px",
      threshold: 0.12,
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setIsReducedMotion(motionQuery.matches);
    updateMotionPreference();
    motionQuery.addEventListener("change", updateMotionPreference);
    return () => motionQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    clearSequence();
    if (!isInView) return;

    if (isReducedMotion) {
      showFinalScore();
      sequenceTimersRef.current.push(window.setTimeout(() => {
        setActiveIndex(manualIndex);
        setIsFinal(manualIndex === null);
      }, 0));
      return clearSequence;
    }

    if (manualIndex !== null) {
      showFinalScore();
      return;
    }

    const section = sectionRef.current;
    section?.removeAttribute("data-score-complete");
    section?.style.setProperty("--weighted-progress", "0%");
    if (scoreRef.current) scoreRef.current.textContent = "0.00";
    if (percentageRef.current) percentageRef.current.textContent = "00";
    sequenceTimersRef.current.push(window.setTimeout(() => {
      setActiveIndex(null);
      setIsFinal(false);
    }, 0));

    const startedAt = performance.now();
    const animateScore = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / SCORE_DURATION);
      const eased = 1 - ((1 - progress) ** 3);
      if (scoreRef.current) scoreRef.current.textContent = formatNumber(overallScore * eased);
      if (percentageRef.current) percentageRef.current.textContent = String(Math.round(percentage * eased)).padStart(2, "0");
      section?.style.setProperty("--weighted-progress", `${percentage * eased}%`);
      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(animateScore);
      } else {
        section?.setAttribute("data-score-complete", "true");
      }
    };
    animationFrameRef.current = window.requestAnimationFrame(animateScore);

    dimensions.forEach((_, index) => {
      const timer = window.setTimeout(() => {
        setActiveIndex(index);
        setIsFinal(false);
      }, SCAN_START + index * SCAN_STEP);
      sequenceTimersRef.current.push(timer);
    });

    sequenceTimersRef.current.push(window.setTimeout(() => {
      setActiveIndex(null);
      setIsFinal(true);
    }, SUMMARY_START));

    sequenceTimersRef.current.push(window.setTimeout(() => {
      setLoopIteration((current) => current + 1);
    }, LOOP_DURATION));

    return clearSequence;
  }, [clearSequence, dimensions, isInView, isReducedMotion, loopIteration, manualIndex, overallScore, percentage, showFinalScore]);

  useEffect(() => () => {
    clearSequence();
    clearResumeTimer();
  }, [clearResumeTimer, clearSequence]);

  return (
    <section
      aria-labelledby="comparison-title"
      className={[className, styles.section].filter(Boolean).join(" ")}
      id="product-comparison"
      ref={sectionRef}
      style={{ "--weighted-progress": `${percentage}%` } as CSSProperties}
    >
      <header className={styles.heading}>
        <div className={styles.index}>
          <span>05 / WEIGHTED RESULT</span>
          <button aria-label="重新播放综合结果计算演示" onClick={replay} type="button">REPLAY ↻</button>
        </div>
        <h2 id="comparison-title">综合结果</h2>
        <p>五个维度各包含一条代表案例，综合分按有效维度权重计算，用于展示评测方法而非产品排名。</p>
      </header>

      <div className={styles.main}>
        <div className={styles.scorePanel}>
          <span className={styles.label}>OVERALL SCORE</span>
          <div className={styles.scoreRow} aria-label={`综合评分 ${formatNumber(overallScore)}，满分 5 分`}>
            <span className={styles.score} ref={scoreRef}>{formatNumber(overallScore)}</span>
            <span className={styles.unit}>/ 5</span>
          </div>
          <div className={styles.progress} aria-label={`综合评分进度 ${percentage}%`} role="progressbar" aria-valuemax={100} aria-valuemin={0} aria-valuenow={percentage}>
            <span className={styles.trackArea}>
              <i className={styles.rail}><i /></i>
              <i aria-hidden="true" className={styles.reticle}><i /></i>
            </span>
            <strong><span ref={percentageRef}>{String(percentage).padStart(2, "0")}</span>%</strong>
          </div>
          <div className={styles.status}>
            <i aria-hidden="true" />
            <span>STATUS</span>
            <strong>{status} · {rating}</strong>
          </div>
        </div>

        <div className={styles.composition}>
          <header>
            <span className={styles.label}>WEIGHTED COMPOSITION</span>
            <span aria-live={manualIndex !== null ? "polite" : "off"} className={styles.formula}>{formula}</span>
          </header>
          <div aria-label="五维加权构成" className={styles.dimensionRows}>
            {dimensions.map((dimension, index) => {
              const active = index === activeIndex;
              return (
                <button
                  aria-label={`${dimension.name}，案例 ${dimension.caseId}，评分 ${formatNumber(dimension.score)}，权重 ${Math.round(dimension.weight * 100)}%，加权贡献 ${formatNumber(dimension.contribution)}`}
                  aria-pressed={pinnedIndex === index}
                  className={styles.dimensionRow}
                  data-active={active || undefined}
                  data-dimmed={activeIndex !== null && !active || undefined}
                  data-final={isFinal || undefined}
                  key={dimension.id}
                  onBlur={handleRowBlur}
                  onClick={() => handleRowClick(index)}
                  onFocus={() => {
                    focusWithinRowsRef.current = true;
                    selectManualDimension(index);
                  }}
                  onMouseEnter={() => selectManualDimension(index)}
                  onMouseLeave={handleRowMouseLeave}
                  style={{
                    "--dimension-color": dimension.color,
                    "--contribution-width": `${(dimension.score / 5) * 100}%`,
                  } as CSSProperties}
                  type="button"
                >
                  <span className={styles.dimensionName}>{dimension.name}<i>{dimension.caseId}</i></span>
                  <span className={styles.dimensionScore}><i>SCORE</i>{formatNumber(dimension.score)}</span>
                  <span className={styles.dimensionWeight}><i>WEIGHT</i>{Math.round(dimension.weight * 100)}%</span>
                  <strong><i>CONTRIBUTION</i>+{formatNumber(dimension.contribution)}</strong>
                  <span aria-hidden="true" className={styles.contributionLine} />
                </button>
              );
            })}
          </div>
          <div className={styles.sum}>
            <span>{totalFormula}</span>
            <strong>= {formatNumber(overallScore)}</strong>
          </div>
        </div>
      </div>

      <footer className={styles.meta}>
        <div><span>PRODUCT</span><strong>{productName}</strong></div>
        <div><span>SAMPLE</span><strong>N={sampleSize} / DIM</strong></div>
        <div><span>METHOD</span><strong>WEIGHTED / {Math.round(validWeight * 100)}%</strong></div>
        <div><span>BOUNDARY</span><strong>CASE DEMO · NOT RANKING</strong></div>
      </footer>
    </section>
  );
}
