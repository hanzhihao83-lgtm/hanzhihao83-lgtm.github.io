"use client";

import type { CSSProperties, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";

import styles from "./ContextTransitionCover.module.css";

const SCAN_STEP_DURATION = 1100;
const SCAN_COMPLETE_HOLD = 1500;
const SCAN_RESUME_DELAY = 800;

const nodePositions = [
  [50, 4],
  [89, 33],
  [74, 84],
  [26, 84],
  [11, 33],
] as const;

interface TransitionDimension {
  caseId: string;
  color: string;
  id: string;
  name: string;
}

interface ContextTransitionCoverProps {
  dimensions: TransitionDimension[];
}

export function ContextTransitionCover({ dimensions }: ContextTransitionCoverProps) {
  const rootRef = useRef<HTMLElement>(null);
  const resumeTimerRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    let fallbackTimer = 0;

    const handleMotionPreference = () => {
      setIsReducedMotion(motionQuery.matches);
      if (motionQuery.matches) {
        setActiveIndex(0);
        setPreviewIndex(null);
      }
    };

    handleMotionPreference();
    motionQuery.addEventListener("change", handleMotionPreference);

    if (window.IntersectionObserver) {
      observer = new IntersectionObserver(([entry]) => {
        setIsVisible(entry.isIntersecting);
      }, { threshold: 0.28 });
      observer.observe(root);
    } else fallbackTimer = window.setTimeout(() => setIsVisible(true), 0);

    return () => {
      observer?.disconnect();
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(resumeTimerRef.current);
      motionQuery.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (!isVisible || isReducedMotion || previewIndex !== null || dimensions.length === 0) return;

    const delay = activeIndex === dimensions.length - 1
      ? SCAN_COMPLETE_HOLD
      : SCAN_STEP_DURATION;
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => current === dimensions.length - 1 ? 0 : current + 1);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [activeIndex, dimensions.length, isReducedMotion, isVisible, previewIndex]);

  useEffect(() => () => window.clearTimeout(resumeTimerRef.current), []);

  const clearResumeTimer = () => {
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = 0;
  };

  const previewDimension = (index: number) => {
    clearResumeTimer();
    setPreviewIndex(index);
  };

  const resumeScan = (index: number) => {
    clearResumeTimer();
    resumeTimerRef.current = window.setTimeout(() => {
      setActiveIndex(index);
      setPreviewIndex(null);
    }, SCAN_RESUME_DELAY);
  };

  const selectDimension = (index: number) => {
    clearResumeTimer();
    setActiveIndex(index);
    setPreviewIndex(index);
  };

  const openContext = (event: MouseEvent<HTMLAnchorElement>) => {
    const context = document.getElementById("context");
    if (!context) return;
    event.preventDefault();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    context.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  const displayedIndex = previewIndex ?? activeIndex;
  const displayedDimension = dimensions[displayedIndex] ?? dimensions[0];
  const isScanning = isVisible && !isReducedMotion && previewIndex === null;

  if (!displayedDimension) return null;

  return (
    <section
      aria-labelledby="transition-cover-title"
      className={styles.cover}
      data-scanning={isScanning || undefined}
      ref={rootRef}
    >
      <header className={styles.header}>
        <span>00 / TRANSITION</span>
        <span className={styles.status}><i aria-hidden="true" />FROM IMPRESSION TO EVIDENCE</span>
      </header>

      <div className={styles.stage}>
        <div className={styles.copy}>
          <span className={styles.kicker}>AI VIDEO QUALITY EVALUATION</span>
          <h2 className={styles.title} id="transition-cover-title">
            <span>BOUNDARY</span>
            <span>BEFORE SCORE.</span>
          </h2>
          <p className={styles.subtitle}>先建立可复核的边界，再讨论生成质量。</p>
        </div>

        <div aria-live="polite" className={styles.radar}>
          <div aria-hidden="true" className={styles.orbit}>
            <i className={styles.radarAxis} />
            <i className={styles.sweep} />
            <i className={styles.core} />
            {dimensions.map((dimension, index) => {
              const [x, y] = nodePositions[index] ?? [50, 50];
              return (
                <i
                  className={styles.node}
                  data-active={displayedIndex === index || undefined}
                  key={dimension.id}
                  style={{
                    "--node-color": dimension.color,
                    "--node-x": `${x}%`,
                    "--node-y": `${y}%`,
                  } as CSSProperties}
                />
              );
            })}
          </div>
          <div className={styles.readout} key={displayedDimension.id}>
            <strong style={{ color: displayedDimension.color }}>{displayedDimension.caseId}</strong>
            <span>{displayedDimension.name}</span>
            <i>{String(displayedIndex + 1).padStart(2, "0")} / {String(dimensions.length).padStart(2, "0")}</i>
          </div>
        </div>

        <nav aria-label="五维评测扫描索引" className={styles.dimensionIndex}>
          {dimensions.map((dimension, index) => (
            <button
              aria-label={`切换到${dimension.name}，案例${dimension.caseId}`}
              aria-pressed={displayedIndex === index}
              data-active={displayedIndex === index || undefined}
              key={dimension.id}
              onBlur={() => resumeScan(index)}
              onClick={() => selectDimension(index)}
              onFocus={() => previewDimension(index)}
              onMouseEnter={() => previewDimension(index)}
              onMouseLeave={() => resumeScan(index)}
              style={{ "--dimension-color": dimension.color } as CSSProperties}
              type="button"
            >
              <span>{String(index + 1).padStart(2, "0")} / {dimension.caseId.split("-")[0]}</span>
              <strong>{dimension.name}</strong>
            </button>
          ))}
        </nav>
      </div>

      <a aria-label="前往下一章：先定义边界，再讨论好坏" className={styles.nextChapter} href="#context" onClick={openContext}>
        <span>NEXT CHAPTER</span>
        <strong>01 / CONTEXT · 先定义边界，再讨论好坏。</strong>
        <i aria-hidden="true">↓</i>
      </a>
    </section>
  );
}
