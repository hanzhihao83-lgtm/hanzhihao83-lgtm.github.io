"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { EvaluationDimension, VideoCase } from "@/types/evaluation";

import styles from "./EvaluationDimensions.module.css";

const END_HOLD_DURATION = 300;
const TRANSITION_HALF = 150;

type MediaStatus = "loading" | "ready" | "error";
type TransitionStage = "out" | "in" | null;

interface CardDetail {
  caseTitle: string;
  englishName?: string;
  metrics: readonly [string, string];
}

interface EvaluationDimensionBentoProps {
  cases: VideoCase[];
  details: Record<EvaluationDimension["id"], CardDetail>;
  dimensions: EvaluationDimension[];
  onViewCase: (dimensionId: EvaluationDimension["id"]) => void;
}

interface BentoVideoCase {
  id: EvaluationDimension["id"];
  title: string;
  englishTitle: string;
  description: string;
  score: number;
  scoreLabel: string;
  weight: number;
  accent: string;
  posterSrc: string;
  videoSrc: string;
  metrics: readonly [string, string];
  caseId: string;
  evaluationCoverage: VideoCase["evaluationCoverage"];
}

function formatTime(value: number) {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  const minutes = Math.floor(safeValue / 60);
  const seconds = safeValue % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function MetricEqualizer({
  active,
  metric,
  metricIndex,
  peak,
  playing,
  score,
}: {
  active: boolean;
  metric: string;
  metricIndex: number;
  peak: boolean;
  playing: boolean;
  score: number;
}) {
  return (
    <div className={styles.metric}>
      <i aria-hidden="true">{metricIndex === 0 ? "◎" : "⌗"}</i>
      <span>{metric}</span>
      <b aria-label={`${metric} ${score} 分，满分 5 分`} className={styles.equalizer} role="img">
        {Array.from({ length: 5 }, (_, slotIndex) => {
          const lit = slotIndex < score;
          const rhythm = active && lit && playing;
          return (
            <i
              className={styles.beatSlot}
              data-lit={lit || undefined}
              data-peak={peak && active && lit || undefined}
              data-rhythm={rhythm || undefined}
              key={slotIndex}
            >
              <span /><span /><span />
            </i>
          );
        })}
      </b>
    </div>
  );
}

export function EvaluationDimensionBento({ cases, details, dimensions, onViewCase }: EvaluationDimensionBentoProps) {
  const sequenceRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const sequenceButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const scanStatusRef = useRef<HTMLElement>(null);
  const timeStatusRef = useRef<HTMLElement>(null);
  const animationFrameRef = useRef(0);
  const transitionTimersRef = useRef<number[]>([]);
  const activeIndexRef = useRef(0);
  const manualPausedRef = useRef(false);
  const autoplayBlockedRef = useRef(false);
  const shouldResumeRef = useRef(false);
  const completionHandledRef = useRef(false);

  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [mediaStatus, setMediaStatus] = useState<MediaStatus>("loading");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionStage, setTransitionStage] = useState<TransitionStage>(null);
  const [isInView, setIsInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [peak, setPeak] = useState(false);

  const bentoCases = useMemo(() => dimensions.flatMap((dimension) => {
    const caseData = cases.find((item) => item.dimension === dimension.id);
    if (!caseData) return [];
    const cardDetails = details[dimension.id];
    return [{
      id: dimension.id,
      title: dimension.name,
      englishTitle: cardDetails.englishName ?? dimension.englishName,
      description: cardDetails.caseTitle,
      score: typeof caseData.score === "number" ? caseData.score : 0,
      scoreLabel: caseData.scoreLabel ?? "暂无等级",
      weight: dimension.weight,
      accent: dimension.color,
      posterSrc: caseData.poster,
      videoSrc: caseData.video,
      metrics: cardDetails.metrics,
      caseId: caseData.caseId,
      evaluationCoverage: caseData.evaluationCoverage,
    } satisfies BentoVideoCase];
  }), [cases, details, dimensions]);

  const activeCase = bentoCases[activeCaseIndex];
  const nextCase = bentoCases[(activeCaseIndex + 1) % Math.max(bentoCases.length, 1)];

  const clearTransitionTimers = useCallback(() => {
    transitionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    transitionTimersRef.current = [];
  }, []);

  const updateVisualProgress = useCallback((progress: number, currentTime = 0, duration = 0) => {
    const boundedProgress = Math.min(1, Math.max(0, progress));
    const activeCard = cardRefs.current[activeIndexRef.current];
    activeCard?.style.setProperty("--scan-progress", String(boundedProgress));

    sequenceButtonRefs.current.forEach((button, index) => {
      const segmentProgress = index < activeIndexRef.current
        ? 1
        : index === activeIndexRef.current
          ? boundedProgress
          : 0;
      button?.style.setProperty("--sequence-progress", String(segmentProgress));
    });

    if (scanStatusRef.current) {
      scanStatusRef.current.textContent = `SCAN ${String(Math.round(boundedProgress * 100)).padStart(3, "0")}%`;
    }
    if (timeStatusRef.current) {
      timeStatusRef.current.textContent = `${formatTime(currentTime)} / ${duration > 0 ? formatTime(duration) : "--:--"}`;
    }
  }, []);

  const pauseCurrentVideo = useCallback((reset = false) => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    if (reset) {
      try {
        video.currentTime = 0;
      } catch {
        // The media may not have metadata yet; the next mounted case starts at zero.
      }
    }
  }, []);

  const attemptPlay = useCallback(async (userInitiated = false) => {
    const video = videoRef.current;
    if (!video || mediaStatus === "error") return;
    if (!userInitiated && autoplayBlockedRef.current) return;

    try {
      await video.play();
      if (userInitiated) autoplayBlockedRef.current = false;
    } catch {
      if (!userInitiated) autoplayBlockedRef.current = true;
      setIsPlaying(false);
    }
  }, [mediaStatus]);

  const switchCase = useCallback((nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= bentoCases.length || isTransitioning) return;

    clearTransitionTimers();
    pauseCurrentVideo(true);
    setIsPlaying(false);
    setIsMuted(true);
    setPeak(false);
    manualPausedRef.current = !motionEnabled;
    autoplayBlockedRef.current = false;
    completionHandledRef.current = false;

    if (nextIndex === activeIndexRef.current) {
      setMediaStatus("loading");
      updateVisualProgress(0);
      const video = videoRef.current;
      if (video) {
        video.load();
      }
      return;
    }

    setIsTransitioning(true);
    setTransitionStage("out");
    const swapTimer = window.setTimeout(() => {
      activeIndexRef.current = nextIndex;
      setActiveCaseIndex(nextIndex);
      setMediaStatus("loading");
      setTransitionStage("in");
      updateVisualProgress(0);

      const finishTimer = window.setTimeout(() => {
        setTransitionStage(null);
        setIsTransitioning(false);
      }, TRANSITION_HALF);
      transitionTimersRef.current.push(finishTimer);
    }, TRANSITION_HALF);
    transitionTimersRef.current.push(swapTimer);
  }, [bentoCases.length, clearTransitionTimers, isTransitioning, motionEnabled, pauseCurrentVideo, updateVisualProgress]);

  const handleEnded = useCallback(() => {
    const video = videoRef.current;
    if (!video || completionHandledRef.current) return;
    completionHandledRef.current = true;
    updateVisualProgress(1, video.duration, video.duration);
    setIsPlaying(false);
    setPeak(true);

    if (!motionEnabled) return;
    const timer = window.setTimeout(() => {
      setPeak(false);
      switchCase((activeIndexRef.current + 1) % bentoCases.length);
    }, END_HOLD_DURATION);
    transitionTimersRef.current.push(timer);
  }, [bentoCases.length, motionEnabled, switchCase, updateVisualProgress]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      const enabled = !motionQuery.matches;
      setMotionEnabled(enabled);
      manualPausedRef.current = !enabled;
      if (!enabled) {
        pauseCurrentVideo();
        updateVisualProgress(0);
      }
    };
    updateMotion();
    motionQuery.addEventListener("change", updateMotion);
    return () => motionQuery.removeEventListener("change", updateMotion);
  }, [pauseCurrentVideo, updateVisualProgress]);

  useEffect(() => {
    const root = sequenceRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), { threshold: 0.01 });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isInView || !pageVisible) {
      shouldResumeRef.current = !video.paused && !manualPausedRef.current;
      video.pause();
      return;
    }

    const shouldAutoplay = motionEnabled && !manualPausedRef.current && !autoplayBlockedRef.current;
    if ((shouldResumeRef.current || shouldAutoplay) && mediaStatus === "ready") {
      shouldResumeRef.current = false;
      void attemptPlay();
    }
  }, [attemptPlay, isInView, mediaStatus, motionEnabled, pageVisible]);

  useEffect(() => {
    window.cancelAnimationFrame(animationFrameRef.current);
    if (!isPlaying) return;

    const tick = () => {
      const video = videoRef.current;
      if (!video) return;
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const progress = duration > 0 ? video.currentTime / duration : 0;
      updateVisualProgress(progress, video.currentTime, duration);
      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    animationFrameRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrameRef.current);
  }, [activeCaseIndex, isPlaying, updateVisualProgress]);

  useEffect(() => {
    updateVisualProgress(0);
  }, [activeCaseIndex, updateVisualProgress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setMediaStatus("loading");
    const markReady = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        setMediaStatus("ready");
      }
    };
    video.addEventListener("loadeddata", markReady);
    video.addEventListener("canplay", markReady);
    markReady();

    return () => {
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("canplay", markReady);
    };
  }, [activeCaseIndex]);

  useEffect(() => () => {
    window.cancelAnimationFrame(animationFrameRef.current);
    clearTransitionTimers();
    pauseCurrentVideo(true);
  }, [clearTransitionTimers, pauseCurrentVideo]);

  if (!activeCase) return null;

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (mediaStatus === "error") {
      autoplayBlockedRef.current = false;
      manualPausedRef.current = false;
      setMediaStatus("loading");
      video.load();
      return;
    }
    if (video.paused) {
      manualPausedRef.current = false;
      void attemptPlay(true);
    } else {
      manualPausedRef.current = true;
      video.pause();
    }
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && video.paused) {
      manualPausedRef.current = false;
      void attemptPlay(true);
    }
  };

  return (
    <div className={styles.sequenceShell} data-playing={isPlaying || undefined} ref={sequenceRef}>
      <nav aria-label="五维视频评测序列" className={styles.sequence}>
        {bentoCases.map((item, index) => (
          <button
            aria-current={index === activeCaseIndex ? "step" : undefined}
            aria-label={`播放案例 ${String(index + 1).padStart(2, "0")} ${item.title}`}
            key={item.id}
            onClick={() => switchCase(index)}
            ref={(node) => { sequenceButtonRefs.current[index] = node; }}
            style={{ "--dimension-accent": item.accent, "--sequence-progress": index < activeCaseIndex ? 1 : 0 } as CSSProperties}
            type="button"
          >
            <span><i>{String(index + 1).padStart(2, "0")}</i>{item.title}</span>
            <b aria-hidden="true"><i /></b>
          </button>
        ))}
      </nav>

      <div className={styles.grid} data-reveal>
        {bentoCases.map((item, index) => {
          const active = index === activeCaseIndex;
          return (
            <article
              className={styles.card}
              data-active={active || undefined}
              data-transition-stage={active && isTransitioning ? transitionStage : undefined}
              id={`case-${item.caseId.toLowerCase()}`}
              key={item.id}
              ref={(node) => { cardRefs.current[index] = node; }}
              style={{
                "--dimension-accent": item.accent,
                "--rhythm-speed": item.id === "audio-visual-sync" ? ".92s" : "1.08s",
                "--scan-progress": 0,
                "--score-progress": item.score / 5,
              } as CSSProperties}
            >
              <div className={styles.media} data-active={active || undefined} data-media-status={active ? mediaStatus : undefined}>
                <Image
                  alt=""
                  className={styles.poster}
                  fill
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 680px) 100vw, (max-width: 1100px) 48vw, 24vw"
                  src={item.posterSrc}
                />

                {active && (
                  <>
                    <video
                      autoPlay={motionEnabled && isInView && pageVisible}
                      className={styles.scanVideo}
                      key={item.id}
                      muted={isMuted}
                      onCanPlay={() => setMediaStatus("ready")}
                      onEnded={handleEnded}
                      onError={() => {
                        setMediaStatus("error");
                        setIsPlaying(false);
                      }}
                      onLoadedData={() => setMediaStatus("ready")}
                      onLoadedMetadata={(event) => {
                        event.currentTarget.muted = true;
                        setIsMuted(true);
                        updateVisualProgress(0, 0, event.currentTarget.duration);
                      }}
                      onPause={() => setIsPlaying(false)}
                      onPlay={() => {
                        completionHandledRef.current = false;
                        setIsPlaying(true);
                        setMediaStatus("ready");
                      }}
                      playsInline
                      poster={item.posterSrc}
                      preload="auto"
                      ref={videoRef}
                      src={item.videoSrc}
                    />
                    {motionEnabled && <div aria-hidden="true" className={styles.unscannedMask} />}
                    {motionEnabled && <i aria-hidden="true" className={styles.scanLine}><span /></i>}
                    <button
                      aria-label={isPlaying ? `暂停${item.title}案例视频` : `播放${item.title}案例视频`}
                      className={styles.videoToggle}
                      onClick={togglePlayback}
                      type="button"
                    />
                    <span className={styles.mediaIndex}>{String(index + 1).padStart(2, "0")}</span>
                    {item.evaluationCoverage === "有限" && <em>评测覆盖度有限</em>}
                    <b className={styles.scanStatus} ref={scanStatusRef}>SCAN 000%</b>
                    <b className={styles.timeStatus} ref={timeStatusRef}>00:00 / --:--</b>
                    {mediaStatus === "loading" && <span className={styles.loadingStatus}>LOADING VIDEO</span>}
                    {mediaStatus === "error" && <span className={styles.errorStatus}>视频加载失败，当前显示封面</span>}
                    <div className={styles.mediaControls}>
                      <button aria-label={isPlaying ? "暂停视频" : "播放视频"} onClick={togglePlayback} type="button">
                        {isPlaying ? "PAUSE" : mediaStatus === "error" ? "RETRY" : "PLAY"}
                      </button>
                      <button
                        aria-label={isMuted ? "开启视频声音" : "静音视频"}
                        className={item.id === "audio-visual-sync" ? styles.syncSound : undefined}
                        onClick={toggleSound}
                        type="button"
                      >
                        {isMuted ? item.id === "audio-visual-sync" ? "开启声音检查同步" : "开启声音" : "静音"}
                      </button>
                      <span>{item.caseId}</span>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.body}>
                <header>
                  <div><strong>{item.score}</strong><span>/ 5</span></div>
                  <i>{item.scoreLabel}</i>
                </header>
                <h3>{item.title}</h3>
                <p className={styles.english}>{item.englishTitle}</p>
                <div className={styles.progress} aria-label={`固定评分进度 ${item.score} / 5`} role="img"><i /></div>
                <p className={styles.caseTitle}>{item.description}</p>
                <dl className={styles.meta}>
                  <div><dt>CASE ID</dt><dd>{item.caseId}</dd></div>
                  <div><dt>WEIGHT</dt><dd>{Math.round(item.weight * 100)}%</dd></div>
                </dl>
                <button className={styles.viewCase} onClick={() => onViewCase(item.id)} type="button">VIEW CASE →</button>
              </div>

              <div className={styles.metrics}>
                {item.metrics.map((metric, metricIndex) => (
                  <MetricEqualizer
                    active={active}
                    key={metric}
                    metric={metric}
                    metricIndex={metricIndex}
                    peak={peak}
                    playing={isPlaying}
                    score={item.score}
                  />
                ))}
              </div>
            </article>
          );
        })}
      </div>

      {nextCase && nextCase.id !== activeCase.id && (
        <video aria-hidden="true" className={styles.nextMetadata} key={nextCase.id} muted playsInline preload="metadata" src={nextCase.videoSrc} />
      )}
      <p aria-live="polite" className={styles.srStatus}>
        {mediaStatus === "error"
          ? `${activeCase.title}视频加载失败，已显示封面。`
          : `${activeCase.title}，${isPlaying ? "正在播放并扫描" : "已暂停"}。`}
      </p>
    </div>
  );
}
