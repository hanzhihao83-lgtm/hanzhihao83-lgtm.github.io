"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

import type { EvaluationDimension, VideoCase } from "@/types/evaluation";

import { ActiveEvidenceInspector } from "./ActiveEvidenceInspector";
import styles from "./FrameEvidencePanel.module.css";

const defaultDuration = 5;
const audioWave = [36, 68, 48, 82, 42, 74, 54, 92, 46, 64, 38, 78, 52, 86, 44, 70, 58, 80];

interface FrameEvidencePanelProps {
  caseData: VideoCase;
  dimension: EvaluationDimension;
  onSeek: (time: number, focusVideo?: boolean) => void;
}

export interface FrameEvidencePanelHandle {
  updateProgress: (currentTime: number, duration: number, playing: boolean) => void;
}

function formatEvidenceTime(time: number) {
  return `00:${time.toFixed(1).padStart(4, "0")}`;
}

export const FrameEvidencePanel = forwardRef<FrameEvidencePanelHandle, FrameEvidencePanelProps>(function FrameEvidencePanel(
  { caseData, dimension, onSeek },
  forwardedRef,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const timelineInputRef = useRef<HTMLInputElement>(null);
  const timeReadoutRef = useRef<HTMLTimeElement>(null);
  const activeFrameRef = useRef(0);
  const durationRef = useRef(caseData.endTime ?? defaultDuration);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const updateDomProgress = (currentTime: number, duration: number) => {
    const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : defaultDuration;
    const boundedTime = Math.min(Math.max(0, currentTime), safeDuration);
    const progress = boundedTime / safeDuration;
    durationRef.current = safeDuration;
    rootRef.current?.style.setProperty("--evidence-progress", String(progress));
    if (timelineInputRef.current) {
      timelineInputRef.current.max = String(safeDuration);
      timelineInputRef.current.value = String(boundedTime);
      timelineInputRef.current.setAttribute("aria-valuetext", `${formatEvidenceTime(boundedTime)} / ${formatEvidenceTime(safeDuration)}`);
    }
    if (timeReadoutRef.current) timeReadoutRef.current.textContent = formatEvidenceTime(boundedTime);

    let nextFrame = 0;
    caseData.keyframes.forEach((frame, index) => {
      // Browsers may resolve a media seek a few milliseconds before the requested frame.
      if (boundedTime >= frame.timestamp - 0.05) nextFrame = index;
    });
    if (nextFrame !== activeFrameRef.current) {
      activeFrameRef.current = nextFrame;
      setActiveFrameIndex(nextFrame);
    }
  };

  useImperativeHandle(forwardedRef, () => ({
    updateProgress: (currentTime, duration, isPlaying) => {
      updateDomProgress(currentTime, duration);
      setPlaying((current) => current === isPlaying ? current : isPlaying);
    },
  }));

  const seekTo = (time: number, focusVideo = false) => {
    updateDomProgress(time, durationRef.current);
    onSeek(time, focusVideo);
  };

  const primaryIssue = dimension.issueTags.find((tag) => tag.id === caseData.primaryIssue)?.label ?? "暂无问题标签";
  const audioAvailable = caseData.audioStatus === "available";
  const timelineTicks = [0, 1, 2, 3, 4, 5];
  const activeFrame = caseData.keyframes[activeFrameIndex] ?? caseData.keyframes[0];
  const previousFrame = caseData.keyframes[Math.max(0, activeFrameIndex - 1)] ?? activeFrame;
  const nextFrame = caseData.keyframes[(activeFrameIndex + 1) % caseData.keyframes.length] ?? activeFrame;

  return (
    <section
      aria-label={`${caseData.caseId} 关键帧证据台`}
      className={styles.panel}
      data-playing={playing || undefined}
      ref={rootRef}
      style={{ "--evidence-accent": dimension.color, "--evidence-progress": 0 } as CSSProperties}
    >
      <header className={styles.header}>
        <span>FRAME EVIDENCE / {caseData.caseId.replace("-", "–")}</span>
        <span>04 KEY FRAMES</span>
        <span><i aria-hidden="true" />SYNCED TO VIDEO</span>
      </header>

      <div className={styles.frameScroller}>
        <div className={styles.frameStrip}>
          {caseData.keyframes.map((frame, index) => (
            <button
              aria-current={index === activeFrameIndex ? "true" : undefined}
              aria-label={`跳转到 ${formatEvidenceTime(frame.timestamp)}，${frame.title}`}
              className={styles.keyframe}
              key={frame.id}
              onClick={() => seekTo(frame.timestamp)}
              style={{ "--frame-delay": `${index * 60}ms` } as CSSProperties}
              type="button"
            >
              <span className={styles.imageWrap}>
                <Image
                  alt={`${caseData.title}关键帧：${frame.title}`}
                  fill
                  sizes="(max-width: 680px) 68vw, (max-width: 980px) 42vw, 14vw"
                  src={frame.imageSrc}
                />
                <i aria-hidden="true" className={styles.playhead} />
                <em>SEEK {formatEvidenceTime(frame.timestamp)}</em>
              </span>
              <span className={styles.frameMeta}><b>{frame.frameLabel}</b><time>{formatEvidenceTime(frame.timestamp)}</time></span>
              <strong>{frame.title}</strong>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.timelineBlock}>
        <div className={styles.timelineHeading}>
          <span>EVIDENCE TIMELINE</span>
          <time ref={timeReadoutRef}>00:00.0</time>
        </div>
        <div className={styles.timeline}>
          <i aria-hidden="true" className={styles.timelineProgress} />
          <i aria-hidden="true" className={styles.timelineCursor} />
          {caseData.keyframes.map((frame) => (
            <button
              aria-label={`跳转证据节点：${frame.title}，${formatEvidenceTime(frame.timestamp)}`}
              className={styles.eventNode}
              key={frame.id}
              onClick={() => seekTo(frame.timestamp)}
              style={{ left: `${(frame.timestamp / defaultDuration) * 100}%` }}
              type="button"
            >
              <i aria-hidden="true" />
              <span>{frame.title}</span>
            </button>
          ))}
          <input
            aria-label="证据时间轴，左右方向键可逐帧定位"
            defaultValue={0}
            max={defaultDuration}
            min={0}
            onChange={(event) => seekTo(Number(event.currentTarget.value))}
            ref={timelineInputRef}
            step="0.01"
            type="range"
          />
          <div aria-hidden="true" className={styles.ticks}>
            {timelineTicks.map((tick) => <span key={tick} style={{ left: `${(tick / defaultDuration) * 100}%` }}>{`00:0${tick}`}</span>)}
          </div>
        </div>
      </div>

      <ActiveEvidenceInspector
        activeFrame={activeFrame}
        caseData={caseData}
        dimension={dimension}
        key={activeFrame.id}
        nextFrame={nextFrame}
        onSeek={seekTo}
        playing={playing}
        previousFrame={previousFrame}
      />

      <div className={styles.diagnostics}>
        <section>
          <span>EVIDENCE COVERAGE</span>
          <div className={styles.coverage} aria-label={`${caseData.evidenceCoverage} / 5 COVERED`} role="img">
            {Array.from({ length: 5 }, (_, index) => <i data-lit={index < caseData.evidenceCoverage || undefined} key={index} />)}
          </div>
          <strong>{caseData.evidenceCoverage} / 5 COVERED</strong>
        </section>
        <section>
          <span>CAMERA MOTION</span>
          <div aria-hidden="true" className={styles.motionTrace}><i /><b /></div>
          <div className={styles.motionEnds}><i>LEFT</i><i>RIGHT</i></div>
          <strong>{caseData.cameraMotion}</strong>
        </section>
        <section>
          <span>AUDIO EVENT</span>
          <div aria-hidden="true" className={styles.audioWave}>
            {audioWave.map((height, index) => <i key={`${height}-${index}`} style={{ "--wave-height": `${height}%`, "--wave-delay": `${index * -57}ms` } as CSSProperties} />)}
          </div>
          <strong>{audioAvailable ? "TRACK AVAILABLE · STATUS TRACE" : "NO AUDIO DATA"}</strong>
        </section>
        <section className={styles.issue}>
          <span>ISSUE / NOTE</span>
          <strong>{primaryIssue}</strong>
          <button onClick={() => seekTo(caseData.issueTimestamp)} type="button">SEEK FRAME →</button>
        </section>
      </div>
    </section>
  );
});
