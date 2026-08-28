"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";

import styles from "./HomePage.module.css";

const evidenceTargets = [
  { id: "F02", label: "F02 / RED MUG", target: "红色杯子" },
  { id: "F03", label: "F03 / YELLOW BOOK", target: "黄色书本" },
] as const;

const scanStages = [
  { code: "Q", status: "READING / QUESTION" },
  { code: "E", status: "LOCATING / F02" },
  { code: "A", status: "LINKING / F03" },
  { code: "✓", status: "VERIFIED / CONSISTENT" },
] as const;

const STAGE_DURATION = 1800;

export function MultiTurnVQACoverVisual() {
  const visualRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
      if (mediaQuery.matches) setActiveStage(scanStages.length - 1);
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
    const visual = visualRef.current;
    if (!visual) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.22 },
    );

    observer.observe(visual);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !isInView || !isPageVisible) return;

    const timer = window.setTimeout(() => {
      setActiveStage((stage) => (stage + 1) % scanStages.length);
    }, STAGE_DURATION);

    return () => window.clearTimeout(timer);
  }, [activeStage, isInView, isPageVisible, prefersReducedMotion]);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const visual = visualRef.current;
    if (!visual) return;

    const bounds = visual.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    visual.style.setProperty("--vqa-cover-x", `${x * -7}px`);
    visual.style.setProperty("--vqa-cover-y", `${y * -5}px`);
  };

  const resetPointerOffset = () => {
    const visual = visualRef.current;
    if (!visual) return;
    visual.style.setProperty("--vqa-cover-x", "0px");
    visual.style.setProperty("--vqa-cover-y", "0px");
  };

  const evidenceIsActive = (targetIndex: number) =>
    activeStage === targetIndex + 1 || activeStage === scanStages.length - 1;

  return (
    <div
      className={`${styles.projectVisual} ${styles.vqaCoverVisual}`}
      onPointerLeave={resetPointerOffset}
      onPointerMove={handlePointerMove}
      ref={visualRef}
    >
      <Image
        alt=""
        className={styles.vqaCoverImage}
        fill
        sizes="(max-width: 680px) calc(100vw - 2rem), (max-width: 980px) 55vw, 33vw"
        src="/images/projects/project-02/multi-turn-vqa-hero.png"
      />
      <div className={styles.vqaCoverShade} aria-hidden="true" />
      <div className={styles.vqaCoverScanlines} aria-hidden="true" />
      <div className={styles.vqaCoverEvidence} aria-hidden="true">
        <i className={styles.vqaCoverScan} />
        <i className={styles.vqaStageRail} />
        <div className={styles.vqaStageNodes}>
          {scanStages.map((stage, index) => (
            <span data-active={activeStage === index} key={stage.code}>{stage.code}</span>
          ))}
        </div>
        {evidenceTargets.map((target, index) => (
          <span
            className={styles.vqaEvidenceBox}
            data-active={evidenceIsActive(index)}
            data-target={target.id}
            key={target.id}
          >
            <i>{target.label}</i>
          </span>
        ))}
        <span className={styles.vqaEvidenceLink} data-verified={activeStage === scanStages.length - 1} />
      </div>
      <span className={styles.vqaCoverStatus} aria-live="polite">
        {scanStages[activeStage]?.status}
      </span>
    </div>
  );
}
