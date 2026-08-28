"use client";

import type { CSSProperties, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";

import styles from "./VideoEvaluationProject.module.css";

const ANIMATION_DURATION = 1100;
const SCAN_STEP_DURATION = 820;
const SCAN_COMPLETE_HOLD = 1500;
const SCAN_RESET_DELAY = 260;
const SCAN_RESUME_DELAY = 1000;

interface SnapshotDimension {
  caseId: string;
  color: string;
  id: string;
  name: string;
  score: number;
  weight: number;
}

interface EvaluationSnapshotProps {
  badge: string;
  caseCount: number;
  dimensionCount: number;
  dimensions: SnapshotDimension[];
  percentage: number;
  rating: string;
  score: number;
  status: string;
}

export function EvaluationSnapshot({
  badge,
  caseCount,
  dimensionCount,
  dimensions,
  percentage,
  rating,
  score,
  status,
}: EvaluationSnapshotProps) {
  const rootRef = useRef<HTMLElement>(null);
  const frameRef = useRef(0);
  const animationElapsedRef = useRef(0);
  const previousFrameRef = useRef(0);
  const isVisibleRef = useRef(false);
  const resumeTimerRef = useRef(0);
  const pointerInsideRef = useRef(false);
  const focusInsideRef = useRef(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isScoreComplete, setIsScoreComplete] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [lockedIndex, setLockedIndex] = useState<number | null>(null);
  const [activeContribution, setActiveContribution] = useState<number | null>(null);
  const [contributionStep, setContributionStep] = useState(-1);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    let fallbackTimer = 0;
    let preferenceTimer = 0;

    const renderProgress = (elapsed: number) => {
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayScore(score * eased);
      setDisplayPercentage(Math.round(percentage * eased));
      setDisplayProgress(percentage * eased);
      return progress;
    };

    const finish = () => {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      animationElapsedRef.current = ANIMATION_DURATION;
      setDisplayScore(score);
      setDisplayPercentage(percentage);
      setDisplayProgress(percentage);
      setIsActive(true);
      setIsScoreComplete(true);
    };

    const resume = () => {
      if (animationElapsedRef.current >= ANIMATION_DURATION || frameRef.current) return;
      if (motionQuery.matches) {
        finish();
        return;
      }

      setIsActive(true);
      previousFrameRef.current = performance.now();

      const tick = (now: number) => {
        if (!isVisibleRef.current) {
          frameRef.current = 0;
          return;
        }

        const elapsed = Math.min(animationElapsedRef.current + now - previousFrameRef.current, ANIMATION_DURATION);
        animationElapsedRef.current = elapsed;
        previousFrameRef.current = now;
        if (renderProgress(elapsed) < 1) frameRef.current = window.requestAnimationFrame(tick);
        else finish();
      };

      frameRef.current = window.requestAnimationFrame(tick);
    };

    const handleMotionPreference = () => {
      setIsReducedMotion(motionQuery.matches);
      if (motionQuery.matches) finish();
      else if (isVisibleRef.current) resume();
    };

    motionQuery.addEventListener("change", handleMotionPreference);
    preferenceTimer = window.setTimeout(handleMotionPreference, 0);

    if (window.IntersectionObserver) {
      observer = new IntersectionObserver(([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) resume();
        else {
          window.cancelAnimationFrame(frameRef.current);
          frameRef.current = 0;
        }
      }, { threshold: 0.35 });
      observer.observe(root);
    } else fallbackTimer = window.setTimeout(() => {
      isVisibleRef.current = true;
      setIsVisible(true);
      resume();
    }, 0);

    return () => {
      observer?.disconnect();
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(preferenceTimer);
      motionQuery.removeEventListener("change", handleMotionPreference);
      window.cancelAnimationFrame(frameRef.current);
    };
  }, [percentage, score]);

  useEffect(() => {
    if (!isScoreComplete || !isVisible || isReducedMotion || activeContribution !== null) return;

    const timer = window.setTimeout(() => {
      setContributionStep((current) => current >= dimensions.length - 1 ? -1 : current + 1);
    }, contributionStep < 0 ? 320 : 430);

    return () => window.clearTimeout(timer);
  }, [activeContribution, contributionStep, dimensions.length, isReducedMotion, isScoreComplete, isVisible]);

  useEffect(() => {
    if (!isVisible || isReducedMotion || lockedIndex !== null || previewIndex !== null) return;

    const delay = scanStep === dimensionCount
      ? SCAN_COMPLETE_HOLD
      : scanStep === 0 ? SCAN_RESET_DELAY : SCAN_STEP_DURATION;
    const timer = window.setTimeout(() => {
      setScanStep((current) => current === dimensionCount ? 0 : current + 1);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [dimensionCount, isReducedMotion, isVisible, lockedIndex, previewIndex, scanStep]);

  useEffect(() => () => window.clearTimeout(resumeTimerRef.current), []);

  const clearResumeTimer = () => {
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = 0;
  };

  const previewDimension = (index: number) => {
    clearResumeTimer();
    setPreviewIndex(index);
  };

  const scheduleScanResume = () => {
    clearResumeTimer();
    resumeTimerRef.current = window.setTimeout(() => setPreviewIndex(null), SCAN_RESUME_DELAY);
  };

  const handlePointerEnter = (index: number) => {
    pointerInsideRef.current = true;
    previewDimension(index);
  };

  const handlePointerLeave = () => {
    pointerInsideRef.current = false;
    if (!focusInsideRef.current) scheduleScanResume();
  };

  const handleFocus = (index: number) => {
    focusInsideRef.current = true;
    previewDimension(index);
  };

  const handleBlur = () => {
    focusInsideRef.current = false;
    if (!pointerInsideRef.current) scheduleScanResume();
  };

  const toggleDimensionLock = (index: number) => {
    clearResumeTimer();
    setPreviewIndex(null);
    setScanStep(index + 1);
    setLockedIndex((current) => current === index ? null : index);
  };

  const replayScan = () => {
    clearResumeTimer();
    pointerInsideRef.current = false;
    focusInsideRef.current = false;
    setPreviewIndex(null);
    setLockedIndex(null);
    setScanStep(0);
  };

  const openScoreLab = (event: MouseEvent<HTMLAnchorElement>) => {
    const scoreLab = document.getElementById("score-lab");
    if (!scoreLab) return;
    event.preventDefault();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scoreLab.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  const automaticIndex = Math.max(0, Math.min(dimensions.length - 1, scanStep - 1));
  const displayedIndex = previewIndex ?? lockedIndex ?? automaticIndex;
  const displayedDimension = dimensions[displayedIndex] ?? dimensions[0];
  const displayedCount = previewIndex !== null
    ? previewIndex + 1
    : lockedIndex !== null ? lockedIndex + 1 : scanStep;
  const isScanning = isVisible && !isReducedMotion && lockedIndex === null && previewIndex === null;
  const displayedContributionIndex = activeContribution ?? contributionStep;
  const displayedContribution = activeContribution !== null
    ? dimensions[activeContribution]
    : undefined;
  const displayedContributionValue = displayedContribution
    ? displayedContribution.score * displayedContribution.weight
    : score;
  const contributionDetail = displayedContribution
    ? `${displayedContribution.name} ${displayedContribution.score}/5 × ${Math.round(displayedContribution.weight * 100)}% = ${displayedContributionValue.toFixed(2)}`
    : `五维加权合计 = ${score.toFixed(2)}`;

  return (
    <section
      aria-label="评测快照"
      className={styles.snapshot}
      data-active={isActive || undefined}
      data-score-complete={isScoreComplete || undefined}
      ref={rootRef}
      style={{
        "--overall-progress": `${displayProgress}%`,
        "--snapshot-progress": `${percentage}%`,
      } as CSSProperties}
    >
      <header className={styles.snapshotHeader}>
        <span>EVALUATION SNAPSHOT</span>
        <span className={styles.snapshotBadge}><i aria-hidden="true" />{badge}</span>
      </header>

      <div className={styles.snapshotGrid}>
        <div className={`${styles.snapshotMetric} ${styles.overallMetric}`}>
          <div className={styles.overallMain}>
            <div className={styles.overallPrimary}>
              <span className={styles.snapshotLabel}>OVERALL SCORE</span>
              <div aria-label={`综合评分 ${score.toFixed(2)}，满分 5 分`} className={styles.overallValue}>
                <strong aria-hidden="true" className={styles.animatedScore}>{displayScore.toFixed(2)}</strong>
                <strong aria-hidden="true" className={styles.reducedScore}>{score.toFixed(2)}</strong>
                <i aria-hidden="true">/ 5</i>
              </div>
            </div>
            <div className={styles.weightedResult}>
              <span className={styles.snapshotLabel}>WEIGHTED RESULT</span>
              <strong aria-label={`加权结果 ${percentage}%`}>
                <span aria-hidden="true" className={styles.animatedPercentage}>{String(displayPercentage).padStart(2, "0")}</span>
                <span aria-hidden="true" className={styles.reducedPercentage}>{percentage}</span><span aria-hidden="true">%</span>
              </strong>
              <i>{rating}</i>
            </div>
          </div>
          <div className={styles.scoreTrackWrap}>
            <span
              aria-label={`综合评分进度 ${percentage}%`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={percentage}
              className={styles.progressRail}
              role="progressbar"
            >
              <i className={styles.progressFill} />
              <b className={styles.progressReticle}><i /><i /></b>
            </span>
            <span aria-hidden="true" className={styles.scoreScale}>{[0, 1, 2, 3, 4, 5].map((tick) => <i key={tick}>{tick}</i>)}</span>
          </div>
          <div
            className={styles.contributionArea}
            data-detail-visible={activeContribution !== null ? "true" : undefined}
            onMouseLeave={() => setActiveContribution(null)}
          >
            <div aria-label="五个维度的加权得分" className={styles.contributionBars}>
              {dimensions.map((dimension, index) => {
                const contribution = dimension.score * dimension.weight;
                const shortCode = dimension.caseId.split("-")[0];
                const detail = `${dimension.name} ${dimension.score}/5 × ${Math.round(dimension.weight * 100)}% = ${contribution.toFixed(2)}`;
                return (
                  <button
                    aria-label={detail}
                    data-active={displayedContributionIndex === index || undefined}
                    key={dimension.id}
                    onBlur={() => setActiveContribution(null)}
                    onClick={() => setActiveContribution(index)}
                    onFocus={() => setActiveContribution(index)}
                    onMouseEnter={() => setActiveContribution(index)}
                    style={{ "--contribution-color": dimension.color } as CSSProperties}
                    type="button"
                  >
                    <span>{shortCode}</span><strong>{contribution.toFixed(2)}</strong>
                  </button>
                );
              })}
            </div>
            <output aria-live="polite" className={styles.contributionDetail}>{contributionDetail}</output>
          </div>
        </div>

        <div
          className={styles.scanArea}
          data-scanning={isScanning || undefined}
          style={{ "--scan-color": displayedDimension?.color ?? "#b9ff43" } as CSSProperties}
        >
          <i aria-hidden="true" className={styles.scanBeam} />
          <div className={styles.snapshotMetric}>
            <span className={styles.snapshotLabel}>DIMENSIONS</span>
            <strong className={styles.metricCount}>
              <span className={styles.animatedMetricCount} key={`dimensions-${displayedCount}`}>{String(displayedCount).padStart(2, "0")}</span>
              <span className={styles.reducedMetricCount} key="dimensions-reduced">{String(dimensionCount).padStart(2, "0")}</span>
            </strong>
            <ol aria-label="选择评测维度" className={styles.dimensionTicks}>
              {dimensions.map((dimension, index) => (
                <li key={dimension.id}>
                  <button
                    aria-label={`选择${dimension.name}，案例${dimension.caseId}`}
                    aria-pressed={lockedIndex === index}
                    data-active={displayedIndex === index || undefined}
                    onBlur={handleBlur}
                    onClick={() => toggleDimensionLock(index)}
                    onFocus={() => handleFocus(index)}
                    onMouseEnter={() => handlePointerEnter(index)}
                    onMouseLeave={handlePointerLeave}
                    style={{ "--dimension-color": dimension.color } as CSSProperties}
                    type="button"
                  ><i aria-hidden="true" /></button>
                </li>
              ))}
            </ol>
          </div>

          <div className={`${styles.snapshotMetric} ${styles.videoCasesMetric}`}>
            <span className={styles.snapshotLabel}>VIDEO CASES</span>
            <strong className={styles.metricCount}>
              <span className={styles.animatedMetricCount} key={`cases-${displayedCount}`}>{String(displayedCount).padStart(2, "0")}</span>
              <span className={styles.reducedMetricCount} key="cases-reduced">{String(caseCount).padStart(2, "0")}</span>
            </strong>
            {displayedDimension && (
              <div className={styles.activeCaseInfo} key={displayedDimension.id}>
                <span className={styles.activeCaseHead}>ACTIVE CASE <button onClick={replayScan} type="button">REPLAY ↻</button></span>
                <strong style={{ color: displayedDimension.color }}>{displayedDimension.caseId}</strong>
                <span>ONE CASE / DIM · {displayedDimension.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className={styles.snapshotStatus}>
        <span className={styles.caseStatus}><i aria-hidden="true" />{status}</span>
        <span>METHOD DEMONSTRATION</span>
        <span>SAMPLE BOUNDARY / LIMITED</span>
        <a href="#score-lab" onClick={openScoreLab}>VIEW SCORE LAB ↓</a>
      </footer>
    </section>
  );
}
