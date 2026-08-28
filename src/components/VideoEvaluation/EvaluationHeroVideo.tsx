"use client";

import { useEffect, useRef, useState } from "react";

import type { VideoCase } from "@/types/evaluation";

import styles from "./EvaluationHeroVideo.module.css";

interface EvaluationHeroVideoProps {
  accent: string;
  caseData: VideoCase;
}

const waveHeights = [18, 31, 14, 42, 24, 37, 12, 28, 46, 20, 34, 16, 39, 25, 48, 19, 32, 13, 41, 27, 36, 15, 44, 22, 30, 12, 38, 26, 47, 17, 35, 23, 43, 14, 29, 40, 18, 33, 12, 45, 21, 37, 16, 28];

function formatDuration(seconds: number) {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.round(seconds)) : 5;
  const hours = Math.floor(safe / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((safe % 3600) / 60).toString().padStart(2, "0");
  const rest = (safe % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${rest}`;
}

export function EvaluationHeroVideo({ accent, caseData }: EvaluationHeroVideoProps) {
  const stageRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const openingTimerRef = useRef<number | null>(null);
  const [duration, setDuration] = useState("00:00:05");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [showPosterOnly, setShowPosterOnly] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!stage || !video) return;

    let isVisible = false;
    let autoplayBlocked = false;
    let disposed = false;

    const keepMuted = () => {
      if (!video.muted) video.muted = true;
      video.defaultMuted = true;
    };

    const playWhenAllowed = async () => {
      if (disposed || autoplayBlocked || !isVisible || document.visibilityState !== "visible") return;
      keepMuted();
      try {
        await video.play();
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        autoplayBlocked = true;
        setShowPosterOnly(true);
        setIsPlaying(false);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) void playWhenAllowed();
      else video.pause();
    }, { threshold: 0.2 });

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") video.pause();
      else if (isVisible) void playWhenAllowed();
    };

    keepMuted();
    observer.observe(stage);
    video.addEventListener("volumechange", keepMuted);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      disposed = true;
      observer.disconnect();
      video.removeEventListener("volumechange", keepMuted);
      document.removeEventListener("visibilitychange", handleVisibility);
      video.pause();
      if (openingTimerRef.current !== null) window.clearTimeout(openingTimerRef.current);
    };
  }, []);

  const openScoreLab = () => {
    const scoreLab = document.getElementById("score-lab");
    if (!scoreLab || isOpening) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      scoreLab.scrollIntoView({ behavior: "auto", block: "start" });
      return;
    }

    setIsOpening(true);
    openingTimerRef.current = window.setTimeout(() => {
      setIsOpening(false);
      scoreLab.scrollIntoView({ behavior: "smooth", block: "start" });
      openingTimerRef.current = null;
    }, 360);
  };

  return (
    <button
      aria-label="查看指令遵循代表案例与完整评分"
      className={styles.stage}
      data-cursor="video"
      data-opening={isOpening || undefined}
      data-playing={isPlaying || undefined}
      onClick={openScoreLab}
      ref={stageRef}
      style={{ "--hero-video-accent": accent } as React.CSSProperties}
      type="button"
    >
      <video
        autoPlay
        className={styles.video}
        data-poster-only={showPosterOnly || undefined}
        loop
        muted
        onError={() => { setShowPosterOnly(true); setIsPlaying(false); }}
        onLoadedMetadata={(event) => setDuration(formatDuration(event.currentTarget.duration))}
        onPause={() => setIsPlaying(false)}
        onPlay={(event) => { event.currentTarget.muted = true; setIsPlaying(true); }}
        onVolumeChange={(event) => { event.currentTarget.muted = true; }}
        playsInline
        poster={caseData.poster}
        preload="metadata"
        ref={videoRef}
        src={caseData.video}
      />

      <span aria-hidden="true" className={styles.tonalOverlay} />
      <span aria-hidden="true" className={styles.scanLine} />
      <span aria-hidden="true" className={styles.corner} data-corner="top-left" />
      <span aria-hidden="true" className={styles.corner} data-corner="top-right" />
      <span aria-hidden="true" className={styles.corner} data-corner="bottom-left" />
      <span aria-hidden="true" className={styles.corner} data-corner="bottom-right" />
      <span aria-hidden="true" className={styles.reticle}>+</span>

      <span aria-hidden="true" className={styles.hud}>
        <span>CASE / {caseData.caseId}</span>
        <time>{duration}</time>
      </span>

      <span aria-hidden="true" className={styles.waveform}>
        {waveHeights.map((height, index) => (
          <i
            key={`${height}-${index}`}
            style={{
              "--wave-delay": `${-((index % 9) * 0.11)}s`,
              "--wave-duration": `${1.15 + (index % 7) * 0.13}s`,
              "--wave-height": `${height}px`,
            } as React.CSSProperties}
          />
        ))}
      </span>

      {showPosterOnly ? <span aria-hidden="true" className={styles.posterState}>PREVIEW / POSTER</span> : null}
      {isOpening ? <span className={styles.opening} role="status">OPENING SCORE LAB</span> : null}
    </button>
  );
}
