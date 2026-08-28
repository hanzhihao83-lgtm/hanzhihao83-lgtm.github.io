"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";

import type { EvaluationDimension, VideoCase } from "@/types/evaluation";

import styles from "./EvaluationVideo.module.css";

type MediaState = "idle" | "loading" | "ready" | "playing" | "paused" | "error";

interface EvaluationVideoProps {
  caseData: VideoCase;
  compact?: boolean;
  dimension: EvaluationDimension;
  onProgress?: (progress: EvaluationVideoProgress) => void;
  productName: string;
}

export interface EvaluationVideoProgress {
  currentTime: number;
  duration: number;
  playing: boolean;
}

export interface EvaluationVideoHandle {
  focus: () => void;
  seekTo: (time: number) => void;
}

const waveform = [16, 30, 21, 39, 13, 34, 24, 43, 18, 31, 11, 37, 26, 45, 19, 33, 15, 40, 23, 35, 12, 42, 28, 17, 38, 22, 32, 14, 44, 25];
const defaultCaseDuration = 5;

const mediaStateLabels: Record<MediaState, string> = {
  idle: "STANDBY",
  loading: "LOADING",
  ready: "READY",
  playing: "REC",
  paused: "PAUSE",
  error: "MEDIA ERROR",
};

const scoreEnglishLabels: Record<string, string> = {
  完全不可用: "UNUSABLE",
  明显不足: "INSUFFICIENT",
  部分可用: "PARTIALLY USABLE",
  基本可用: "BASICALLY USABLE",
  稳定可用: "STABLE",
  不适用: "NOT APPLICABLE",
};

const inspectionModes: Record<EvaluationDimension["id"], string> = {
  "instruction-following": "PROMPT CHECK",
  "motion-quality": "MOTION TRACE",
  "visual-quality": "FRAME INSPECTION",
  "temporal-consistency": "TEMPORAL LOCK",
  "audio-visual-sync": "AUDIO SYNC RANGE",
};

function formatTime(seconds: number) {
  const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const hours = Math.floor(safe / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((safe % 3600) / 60).toString().padStart(2, "0");
  const rest = Math.floor(safe % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${rest}`;
}

export const EvaluationVideo = forwardRef<EvaluationVideoHandle, EvaluationVideoProps>(function EvaluationVideo(
  { caseData, compact = false, dimension, onProgress, productName },
  forwardedRef,
) {
  const isAudioEvaluation = caseData.dimension === "audio-visual-sync";
  const playerId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameReadyRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);
  const [mediaState, setMediaState] = useState<MediaState>("idle");
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(caseData.startTime);
  const [duration, setDuration] = useState(caseData.endTime ?? defaultCaseDuration);

  const frameVisible = mediaState === "ready" || mediaState === "playing" || mediaState === "paused";
  const playing = mediaState === "playing";
  const controlsReady = frameVisible;
  const timelineEnd = caseData.endTime ?? duration;
  const progressMax = Math.max(caseData.startTime + 0.01, timelineEnd || 0.01);
  const scoreLabel = caseData.scoreLabel ?? "等级待确认";
  const englishScoreLabel = scoreEnglishLabels[scoreLabel] ?? "PENDING REVIEW";
  const statusLabel = mediaStateLabels[mediaState];

  const reportProgress = (video: HTMLVideoElement, isPlaying = !video.paused) => {
    const mediaDuration = Number.isFinite(video.duration) ? video.duration : duration;
    onProgress?.({
      currentTime: video.currentTime,
      duration: caseData.endTime ?? mediaDuration,
      playing: isPlaying,
    });
  };

  useEffect(() => {
    const video = videoRef.current;
    const root = rootRef.current;
    if (!video || !root) return;

    const pauseVideo = () => {
      if (!video.paused) video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) pauseVideo();
    }, { threshold: 0.15 });
    observer.observe(root);

    const pauseOther = (event: Event) => {
      const playingId = (event as CustomEvent<string>).detail;
      if (playingId !== playerId) pauseVideo();
    };
    const pauseWhenHidden = () => {
      if (document.hidden) pauseVideo();
    };
    document.addEventListener("evaluation-video-play", pauseOther);
    document.addEventListener("visibilitychange", pauseWhenHidden);

    return () => {
      observer.disconnect();
      document.removeEventListener("evaluation-video-play", pauseOther);
      document.removeEventListener("visibilitychange", pauseWhenHidden);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [playerId]);

  const prepareVideo = (video: HTMLVideoElement) => {
    if (mediaState !== "idle" && mediaState !== "error") return;
    frameReadyRef.current = false;
    setMediaState("loading");
    setTime(caseData.startTime);
    setDuration(caseData.endTime ?? defaultCaseDuration);
    video.src = caseData.video;
    video.muted = muted;
    video.load();
  };

  const revealRenderableFrame = (video: HTMLVideoElement) => {
    if (video.seeking || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    frameReadyRef.current = true;
    setMediaState(video.paused ? "ready" : "playing");
  };

  const startPlayback = async (withSound = false) => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = withSound ? false : muted;
    if (withSound) setMuted(false);
    prepareVideo(video);
    video.muted = nextMuted;
    try {
      await video.play();
    } catch {
      setMediaState(frameReadyRef.current ? "paused" : "loading");
    }
  };

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!controlsReady || video.paused) void startPlayback();
    else video.pause();
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video || caseData.audioStatus === "not-required") return;
    if (isAudioEvaluation && (mediaState === "idle" || mediaState === "error")) {
      void startPlayback(true);
      return;
    }
    const nextMuted = !muted;
    video.muted = nextMuted;
    setMuted(nextMuted);
  };

  const restart = () => {
    const video = videoRef.current;
    if (!video) return;
    if (mediaState === "idle" || mediaState === "error") {
      void startPlayback();
      return;
    }
    video.currentTime = caseData.startTime;
    setTime(caseData.startTime);
    void video.play().catch(() => setMediaState("paused"));
  };

  const requestFullscreen = () => {
    const target = rootRef.current;
    if (!target?.requestFullscreen) return;
    void target.requestFullscreen().catch(() => undefined);
  };

  useImperativeHandle(forwardedRef, () => ({
    focus: () => videoRef.current?.focus({ preventScroll: true }),
    seekTo: (nextTime: number) => {
      const video = videoRef.current;
      if (!video) return;
      const safeDuration = Number.isFinite(video.duration) && video.duration > 0
        ? video.duration
        : caseData.endTime ?? defaultCaseDuration;
      const boundedTime = Math.min(Math.max(caseData.startTime, nextTime), safeDuration);

      if (mediaState === "idle" || mediaState === "error" || mediaState === "loading") {
        pendingSeekRef.current = boundedTime;
        if (mediaState !== "loading") prepareVideo(video);
        return;
      }

      video.currentTime = boundedTime;
      setTime(boundedTime);
      onProgress?.({ currentTime: boundedTime, duration: caseData.endTime ?? safeDuration, playing: !video.paused });
    },
  }));

  const style = { "--video-accent": dimension.color } as CSSProperties;
  const voiceStart = caseData.speechTimeRange ? (caseData.speechTimeRange.start / progressMax) * 100 : 0;
  const voiceWidth = caseData.speechTimeRange ? ((caseData.speechTimeRange.end - caseData.speechTimeRange.start) / progressMax) * 100 : 0;

  return (
    <div className={styles.frame} data-compact={compact || undefined} data-media-state={mediaState} ref={rootRef} style={style}>
      <div className={styles.media}>
        <div aria-hidden="true" className={styles.gridBackdrop} />
        {caseData.poster ? (
          <Image
            alt=""
            className={styles.poster}
            data-hidden={frameVisible || undefined}
            fill
            priority={!compact}
            sizes={compact ? "(max-width: 780px) 100vw, 62vw" : "(max-width: 900px) 100vw, 52vw"}
            src={caseData.poster}
          />
        ) : <div aria-hidden="true" className={styles.noPoster} />}
        <video
          aria-label={`${caseData.title} 视频播放器`}
          className={styles.video}
          data-visible={frameVisible || undefined}
          muted={muted}
          onCanPlay={(event) => revealRenderableFrame(event.currentTarget)}
          onEnded={(event) => {
            setMediaState("paused");
            reportProgress(event.currentTarget, false);
          }}
          onError={() => {
            frameReadyRef.current = false;
            setMediaState("error");
          }}
          onLoadedData={(event) => revealRenderableFrame(event.currentTarget)}
          onLoadedMetadata={(event) => {
            const video = event.currentTarget;
            const mediaDuration = Number.isFinite(video.duration) ? video.duration : 0;
            setDuration(caseData.endTime ?? mediaDuration);
            const safeStart = pendingSeekRef.current ?? (caseData.startTime === 0 ? 0.01 : caseData.startTime);
            pendingSeekRef.current = null;
            if (mediaDuration > safeStart && Math.abs(video.currentTime - safeStart) > 0.005) video.currentTime = safeStart;
            else if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) revealRenderableFrame(video);
            setTime(safeStart);
            onProgress?.({ currentTime: safeStart, duration: caseData.endTime ?? mediaDuration, playing: false });
          }}
          onPause={() => {
            if (frameReadyRef.current) setMediaState("paused");
            if (videoRef.current) reportProgress(videoRef.current, false);
          }}
          onPlay={(event) => {
            if (frameReadyRef.current) setMediaState("playing");
            reportProgress(event.currentTarget, true);
            document.dispatchEvent(new CustomEvent("evaluation-video-play", { detail: playerId }));
          }}
          onSeeked={(event) => {
            revealRenderableFrame(event.currentTarget);
            reportProgress(event.currentTarget);
          }}
          onTimeUpdate={(event) => {
            const current = event.currentTarget.currentTime;
            setTime(current);
            reportProgress(event.currentTarget);
            if (caseData.endTime !== null && current >= caseData.endTime) event.currentTarget.pause();
          }}
          playsInline
          preload="metadata"
          ref={videoRef}
          tabIndex={-1}
        />
        <div aria-hidden="true" className={styles.mediaShade} />
        <div aria-hidden="true" className={styles.scanlines} />
        <div aria-hidden="true" className={styles.scanBeam} />
        <div aria-hidden="true" className={styles.corners}><i /><i /><i /><i /></div>

        <div className={styles.topHud} aria-hidden="true">
          <span><b>CASE / {caseData.caseId}</b><i>{dimension.englishName}</i></span>
          <span><b>{caseData.score === null ? "STATUS / TODO" : `SCORE / ${caseData.score}`}</b><i>{englishScoreLabel}</i></span>
        </div>

        <div className={styles.modeHud} aria-hidden="true"><i />{inspectionModes[dimension.id]}</div>

        {(mediaState === "idle" || mediaState === "ready" || mediaState === "paused") && (
          <button
            aria-label={mediaState === "idle" ? `加载并播放 ${caseData.title}` : `继续播放 ${caseData.title}`}
            className={styles.playButton}
            onClick={() => void startPlayback()}
            type="button"
          >
            <i aria-hidden="true">▶</i>
            <span>{mediaState === "idle" ? "加载并播放" : "继续播放"}</span>
          </button>
        )}
        {mediaState === "loading" && <div className={styles.loading} role="status"><i /><span>正在准备首帧</span></div>}
        {mediaState === "error" && (
          <div className={styles.error} role="status">
            <strong>视频暂时无法加载</strong>
            <span>封面已保留，请检查本地文件路径或编码格式。</span>
            <button onClick={() => void startPlayback()} type="button">重新尝试</button>
          </div>
        )}

        <div className={styles.waveform} aria-hidden="true">
          {waveform.map((height, index) => <i key={`${height}-${index}`} style={{ "--bar-height": `${height}px`, "--bar-delay": `${index * -53}ms` } as CSSProperties} />)}
        </div>
        <div className={styles.bottomHud} aria-hidden="true">
          <span>{productName.toUpperCase()}</span>
          <span><i data-live={playing || undefined} />{statusLabel} · {formatTime(time)} / {formatTime(timelineEnd)}</span>
        </div>
      </div>

      <div className={styles.controls} aria-label="视频播放控制">
        <button aria-label={playing ? "暂停视频" : "播放视频"} onClick={togglePlayback} type="button">{playing ? "Ⅱ" : "▶"}</button>
        <time>{formatTime(time)}</time>
        <div className={styles.progress}>
          {caseData.speechTimeRange && <span className={styles.voiceRange} style={{ left: `${voiceStart}%`, width: `${voiceWidth}%` }}><i>VOICE</i></span>}
          <input
            aria-label={`视频进度，当前 ${formatTime(time)}`}
            disabled={!controlsReady}
            max={progressMax}
            min={caseData.startTime}
            onChange={(event) => {
              const nextTime = Number(event.currentTarget.value);
              if (videoRef.current) videoRef.current.currentTime = nextTime;
              setTime(nextTime);
              if (videoRef.current) reportProgress(videoRef.current);
            }}
            step="0.01"
            type="range"
            value={Math.min(time, progressMax)}
          />
          <span className={styles.timelineMarks} aria-hidden="true"><i>START</i><i>END</i></span>
        </div>
        <time>{formatTime(timelineEnd)}</time>
        <button
          aria-label={muted ? "开启视频声音" : "关闭视频声音"}
          className={styles.sound}
          data-prominent={isAudioEvaluation || undefined}
          disabled={caseData.audioStatus === "not-required" || (!isAudioEvaluation && !controlsReady)}
          onClick={toggleSound}
          type="button"
        >{isAudioEvaluation && muted ? "开启声音评测" : muted ? "静音" : "声音开启"}</button>
        <button aria-label="重新播放视频" onClick={restart} type="button">↺</button>
        <button aria-label="全屏播放视频" onClick={requestFullscreen} type="button">⛶</button>
      </div>
      {caseData.speechTimeRange && (
        <div className={styles.voiceNote}><span>VOICE RANGE</span><strong>{caseData.speechTimeRange.start.toFixed(2)}–{caseData.speechTimeRange.end.toFixed(2)} 秒</strong></div>
      )}
    </div>
  );
});
