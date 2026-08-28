"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";

import styles from "./HomePage.module.css";

const captionScanStages = [
  { code: "01", label: "SCENE", status: "READING / RAINY PLATFORM" },
  { code: "02", label: "SUBJECT", status: "LOCATING / COMMUTER" },
  { code: "03", label: "RELATION", status: "LINKING / TRAIN + REFLECTION" },
  { code: "04", label: "CAPTION", status: "CAPTION / EVIDENCE VERIFIED" },
] as const;

const captionEvidence = [
  { id: "subject", label: "SUBJECT / 01", detail: "雨伞下的通勤者", activateAt: 1 },
  { id: "train", label: "ACTION / 02", detail: "列车经过站台", activateAt: 2 },
  { id: "reflection", label: "DETAIL / 03", detail: "雨水形成倒影", activateAt: 2 },
] as const;

const STAGE_DURATION = 1700;

export function ImageCaptionCoverVisual() {
  const visualRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setPrefersReducedMotion(query.matches);
      if (query.matches) setActiveStage(captionScanStages.length - 1);
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
      { threshold: 0.28 },
    );

    observer.observe(visual);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !isInView || !isPageVisible) return;

    const timer = window.setTimeout(() => {
      setActiveStage((stage) => (stage + 1) % captionScanStages.length);
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
    visual.style.setProperty("--caption-cover-x", `${x * -8}px`);
    visual.style.setProperty("--caption-cover-y", `${y * -5}px`);
  };

  const resetPointerOffset = () => {
    const visual = visualRef.current;
    if (!visual) return;
    visual.style.setProperty("--caption-cover-x", "0px");
    visual.style.setProperty("--caption-cover-y", "0px");
  };

  const evidenceIsActive = (activateAt: number) =>
    activeStage === captionScanStages.length - 1 || activeStage === activateAt;

  return (
    <div
      className={`${styles.projectVisual} ${styles.captionCoverVisual}`}
      onPointerLeave={resetPointerOffset}
      onPointerMove={handlePointerMove}
      ref={visualRef}
    >
      <Image
        alt="雨后站台上，一名撑透明雨伞的男子注视经过的列车"
        className={styles.captionCoverImage}
        fill
        sizes="(max-width: 680px) calc(100vw - 2rem), (max-width: 980px) 55vw, 33vw"
        src="/images/projects/project-03/caption-home-cover.jpg"
      />
      <div className={styles.captionCoverShade} aria-hidden="true" />
      <div className={styles.captionCoverScanlines} aria-hidden="true" />
      <div className={styles.captionCoverHud} aria-hidden="true">
        <header><span>CAPTION ENGINE / 03</span><i>LIVE EVIDENCE</i></header>
        <div className={styles.captionScan}><i /></div>
        {captionEvidence.map((evidence) => (
          <span
            className={styles.captionEvidenceBox}
            data-active={evidenceIsActive(evidence.activateAt)}
            data-target={evidence.id}
            key={evidence.id}
          >
            <i>{evidence.label}</i>
            <b>{evidence.detail}</b>
          </span>
        ))}
        <ol className={styles.captionStageRail}>
          {captionScanStages.map((stage, index) => (
            <li data-active={activeStage === index} key={stage.code}>
              <span>{stage.code}</span><i>{stage.label}</i>
            </li>
          ))}
        </ol>
      </div>
      <span className={styles.captionCoverStatus} aria-live="polite">
        {captionScanStages[activeStage]?.status}
      </span>
    </div>
  );
}
