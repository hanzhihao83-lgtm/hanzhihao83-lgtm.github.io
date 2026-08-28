"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import styles from "./FeaturedEvaluationCard.module.css";

const VIDEO_DURATION = 7;
const PHASE_DURATION = 1.2;

const dimensions = [
  { chinese: "指令遵循", english: "INSTRUCTION", score: 4 },
  { chinese: "运动质量", english: "MOTION", score: 4 },
  { chinese: "画面质量", english: "VISUAL", score: 4 },
  { chinese: "一致性", english: "CONSISTENCY", score: 3 },
  { chinese: "音画同步", english: "AUDIO × VISUAL", score: 4 },
] as const;

const waveform = [18, 29, 12, 37, 22, 44, 17, 32, 25, 41, 14, 28, 46, 20, 35, 16, 39, 24, 31, 11, 43, 27, 19, 36, 15, 40, 23, 33, 13, 45, 26, 34, 18, 38, 21, 42, 16, 30, 24, 47, 20, 35];

interface FeaturedEvaluationCardProps {
  accent: string;
  eyebrow: string;
  href: string;
  title: string;
  summary: string;
  index: string;
  type: string;
}

interface TimelineState {
  phase: number;
  progress: number;
  second: number;
}

function formatTime(value: number) {
  const seconds = Math.max(0, Math.min(99, Math.floor(value)));
  return `00:00:${String(seconds).padStart(2, "0")}`;
}

function getTimeline(currentTime: number): TimelineState {
  if (currentTime >= 6) return { phase: 5, progress: 1, second: Math.floor(currentTime) };
  const phase = Math.min(4, Math.floor(currentTime / PHASE_DURATION));
  const progress = (currentTime - phase * PHASE_DURATION) / PHASE_DURATION;
  return { phase, progress, second: Math.floor(currentTime) };
}

export function FeaturedEvaluationCard({ accent, eyebrow, href, title, summary, index, type }: FeaturedEvaluationCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const visibleRef = useRef(false);
  const blockedRef = useRef(false);
  const frameRef = useRef(0);
  const lastFrameRef = useRef({ phase: -1, bucket: -1, second: -1 });
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(VIDEO_DURATION);
  const [timeline, setTimeline] = useState<TimelineState>({ phase: 5, progress: 1, second: 0 });

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setMotionEnabled(!query.matches);
    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    const video = videoRef.current;
    if (!card || !video) return;

    const cancelTimeline = () => {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };

    const syncTimeline = () => {
      const next = getTimeline(video.currentTime);
      const bucket = Math.round(next.progress * 40);
      if (
        next.phase !== lastFrameRef.current.phase ||
        bucket !== lastFrameRef.current.bucket ||
        next.second !== lastFrameRef.current.second
      ) {
        lastFrameRef.current = { phase: next.phase, bucket, second: next.second };
        setTimeline({ ...next, progress: bucket / 40 });
      }
    };

    const tick = () => {
      syncTimeline();
      if (!video.paused && visibleRef.current && !document.hidden) {
        frameRef.current = window.requestAnimationFrame(tick);
      } else {
        frameRef.current = 0;
      }
    };

    const startTimeline = () => {
      cancelTimeline();
      syncTimeline();
      frameRef.current = window.requestAnimationFrame(tick);
    };

    const pauseVideo = () => {
      video.pause();
      cancelTimeline();
      setIsPlaying(false);
    };

    const playVideo = async () => {
      if (!motionEnabled || blockedRef.current || !visibleRef.current || document.hidden) return;
      video.muted = true;
      video.defaultMuted = true;
      try {
        await video.play();
      } catch {
        blockedRef.current = true;
        pauseVideo();
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      startTimeline();
    };
    const handlePause = () => {
      setIsPlaying(false);
      cancelTimeline();
      syncTimeline();
    };
    const handleMetadata = () => {
      if (Number.isFinite(video.duration)) setDuration(Math.round(video.duration));
      syncTimeline();
    };
    const handleVisibility = () => {
      if (document.hidden) pauseVideo();
      else if (visibleRef.current) void playVideo();
    };

    video.muted = true;
    video.defaultMuted = true;
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("loadedmetadata", handleMetadata);
    video.addEventListener("timeupdate", syncTimeline);
    document.addEventListener("visibilitychange", handleVisibility);

    if (!motionEnabled) {
      pauseVideo();
      return () => {
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("loadedmetadata", handleMetadata);
        video.removeEventListener("timeupdate", syncTimeline);
        document.removeEventListener("visibilitychange", handleVisibility);
        cancelTimeline();
      };
    }

    lastFrameRef.current = { phase: -1, bucket: -1, second: -1 };
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting) void playVideo();
      else pauseVideo();
    }, { threshold: 0.2 });
    observer.observe(card);

    return () => {
      observer.disconnect();
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("loadedmetadata", handleMetadata);
      video.removeEventListener("timeupdate", syncTimeline);
      document.removeEventListener("visibilitychange", handleVisibility);
      pauseVideo();
    };
  }, [motionEnabled]);

  const evaluationComplete = !motionEnabled || timeline.phase === 5;

  return (
    <Link
      aria-label="查看AI视频生成质量评测项目"
      className={styles.card}
      data-cursor="video"
      data-project-accent={accent}
      data-project-index={index}
      data-project-title={title}
      data-project-transition
      data-transition
      href={href}
      ref={cardRef}
    >
      <div className={styles.copy}>
        <div className={styles.meta}><span>{index} / 04</span><span>{type}</span></div>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h3>{title}</h3>
          <p className={styles.summary}>{summary}</p>
        </div>

        <div className={styles.evaluation} aria-label="五维评测：指令遵循4分，运动质量4分，画面质量4分，一致性3分，音画同步4分">
          <div className={styles.evaluationHead}>
            <span>{evaluationComplete ? "EVALUATION COMPLETE" : "LIVE EVALUATION / 05 DIMENSIONS"}</span>
            <strong data-visible={evaluationComplete}>{evaluationComplete ? "3.80 / 5" : `${String(timeline.phase + 1).padStart(2, "0")} / 05`}</strong>
          </div>
          <ol>
            {dimensions.map((dimension, dimensionIndex) => {
              const active = motionEnabled && timeline.phase === dimensionIndex;
              const complete = evaluationComplete || timeline.phase > dimensionIndex;
              const progress = complete ? 1 : active ? timeline.progress : 0;
              return (
                <li data-active={active} data-complete={complete} key={dimension.english}>
                  <i aria-hidden="true" />
                  <span className={styles.dimensionChinese}>{dimension.chinese}</span>
                  <span className={styles.track} aria-hidden="true"><b style={{ transform: `scaleX(${progress})` }} /></span>
                  <span className={styles.dimensionEnglish}>{dimension.english}</span>
                  <strong>{dimension.score}/5</strong>
                </li>
              );
            })}
          </ol>
        </div>

        <div className={styles.enter}><span>OPEN CASE FILE</span><b aria-hidden="true" data-project-arrow>↗</b></div>
      </div>

      <div className={styles.stage} data-playing={isPlaying}>
        <video
          autoPlay={motionEnabled}
          loop
          muted
          playsInline
          poster="/images/i2v-evaluation/home-featured-7s.jpg"
          preload="metadata"
          ref={videoRef}
          src="/videos/i2v-evaluation/home-featured-7s.mp4"
        />
        <div className={styles.videoShade} aria-hidden="true" />
        <div className={styles.scanline} aria-hidden="true" />
        <div className={styles.videoTop} aria-hidden="true"><span>CASE / HOME-007</span><span>KLING AI 3.0 OMNI</span></div>
        <div className={styles.timecode} aria-hidden="true">
          <span data-playing={isPlaying}><i />{isPlaying ? "REC" : "PAUSE"}</span>
          {formatTime(motionEnabled ? timeline.second : 0)} / {formatTime(duration)}
        </div>
        <div className={styles.waveform} aria-hidden="true">
          {waveform.map((height, lineIndex) => <i key={`${height}-${lineIndex}`} style={{ "--wave-height": `${height}px`, "--wave-delay": `${lineIndex * -57}ms` } as CSSProperties} />)}
        </div>
        <div className={styles.frame} aria-hidden="true"><i /><i /><i /><i /><span /></div>
      </div>
    </Link>
  );
}
