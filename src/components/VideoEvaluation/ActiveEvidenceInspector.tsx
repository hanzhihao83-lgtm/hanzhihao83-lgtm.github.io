"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useState } from "react";

import type { EvidenceFrame, EvaluationDimension, VideoCase } from "@/types/evaluation";

import styles from "./ActiveEvidenceInspector.module.css";

const inspectorWave = [42, 70, 36, 82, 54, 94, 46, 76, 32, 64, 88, 50, 72, 40, 84, 58, 68, 44, 78, 52, 90, 38, 74, 48];

interface ActiveEvidenceInspectorProps {
  activeFrame: EvidenceFrame;
  caseData: VideoCase;
  dimension: EvaluationDimension;
  nextFrame: EvidenceFrame;
  previousFrame: EvidenceFrame;
  onSeek: (time: number, focusVideo?: boolean) => void;
  playing: boolean;
}

function formatEvidenceTime(time: number) {
  return `00:${time.toFixed(1).padStart(4, "0")}`;
}

export function ActiveEvidenceInspector({
  activeFrame,
  caseData,
  dimension,
  nextFrame,
  previousFrame,
  onSeek,
  playing,
}: ActiveEvidenceInspectorProps) {
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
  const isConsistency = dimension.id === "temporal-consistency";
  const isVisualQuality = dimension.id === "visual-quality";
  const isAudioVisual = dimension.id === "audio-visual-sync";
  const issueTagId = activeFrame.issueTag ?? caseData.primaryIssue;
  const issueLabel = dimension.issueTags.find((tag) => tag.id === issueTagId)?.label ?? "暂无问题标签";
  const activeAnnotation = activeFrame.annotations.find((annotation) => annotation.id === activeAnnotationId);
  const detailTarget = activeFrame.annotations[0];
  const style = {
    "--inspector-accent": dimension.color,
    "--lens-x": `${(detailTarget?.targetX ?? 0.5) * 100}%`,
    "--lens-y": `${(detailTarget?.targetY ?? 0.5) * 100}%`,
  } as CSSProperties;

  const seekCurrentFrame = () => onSeek(activeFrame.timestamp, true);

  return (
    <section
      aria-label={`${activeFrame.frameLabel} 动态证据检查器`}
      className={styles.inspector}
      data-playing={playing || undefined}
      key={activeFrame.id}
      style={style}
    >
      <div className={styles.visualColumn}>
        <header className={styles.visualHeader}>
          <span>ACTIVE EVIDENCE / {activeFrame.frameLabel}</span>
          <span>{isConsistency ? "BEFORE / CURRENT" : `${dimension.englishName} CHECK`}</span>
        </header>

        <div className={styles.evidenceImage} data-consistency={isConsistency || undefined}>
          <Image
            alt={`${caseData.title} ${activeFrame.title}证据画面`}
            className={styles.currentImage}
            fill
            loading="eager"
            sizes="(max-width: 680px) 100vw, (max-width: 980px) 58vw, 42vw"
            src={activeFrame.imageSrc}
          />

          {isConsistency ? (
            <div aria-hidden="true" className={styles.previousFrame}>
              <Image alt="" fill sizes="(max-width: 680px) 100vw, (max-width: 980px) 58vw, 42vw" src={previousFrame.imageSrc} />
              <span>PREVIOUS / {previousFrame.frameLabel}</span>
            </div>
          ) : null}

          <svg aria-hidden="true" className={styles.annotationLines} preserveAspectRatio="none" viewBox="0 0 100 100">
            {activeFrame.annotations.map((annotation, index) => (
              <g
                className={activeAnnotationId === annotation.id ? styles.annotationActive : undefined}
                data-tone={annotation.color}
                key={annotation.id}
                style={{ "--annotation-delay": `${index * 55}ms` } as CSSProperties}
              >
                <line x1={annotation.x * 100} x2={annotation.targetX * 100} y1={annotation.y * 100} y2={annotation.targetY * 100} />
                <path d={`M ${annotation.targetX * 100 - 1.2} ${annotation.targetY * 100} h 2.4 M ${annotation.targetX * 100} ${annotation.targetY * 100 - 1.2} v 2.4`} />
                <rect height="3.4" width="3.4" x={annotation.targetX * 100 - 1.7} y={annotation.targetY * 100 - 1.7} />
              </g>
            ))}
          </svg>

          <div className={styles.annotationLabels}>
            {activeFrame.annotations.map((annotation, index) => (
              <button
                aria-label={`高亮证据标注：${annotation.label}`}
                data-active={activeAnnotationId === annotation.id || undefined}
                data-tone={annotation.color}
                key={annotation.id}
                onBlur={() => setActiveAnnotationId(null)}
                onClick={() => setActiveAnnotationId((current) => current === annotation.id ? null : annotation.id)}
                onFocus={() => setActiveAnnotationId(annotation.id)}
                onMouseEnter={() => setActiveAnnotationId(annotation.id)}
                onMouseLeave={() => setActiveAnnotationId(null)}
                style={{ left: `${annotation.x * 100}%`, top: `${annotation.y * 100}%`, "--annotation-delay": `${index * 55}ms` } as CSSProperties}
                type="button"
              >
                <i aria-hidden="true" />
                <span>{annotation.label}</span>
              </button>
            ))}
          </div>

          {isVisualQuality ? (
            <div aria-hidden="true" className={styles.detailLens}>
              <Image alt="" fill sizes="140px" src={activeFrame.imageSrc} />
              <span>DETAIL / 2×</span>
            </div>
          ) : null}

          <span aria-hidden="true" className={styles.scanTexture} />
          <span aria-hidden="true" className={styles.cornerMark} />
        </div>

        {isAudioVisual ? (
          <div aria-label="音画事件检查轨道，仅展示已知语音区间和视频事件位置" className={styles.syncTrace} role="img">
            <div><span>VIDEO EVENT</span><i className={styles.videoEventLine} /></div>
            <div><span>AUDIO EVENT</span><i className={styles.audioEventLine} /></div>
            <i aria-hidden="true" className={styles.syncCursor} />
            <b>VOICE / 2.16–4.34 SEC</b>
          </div>
        ) : null}

        <footer className={styles.visualFooter}>
          <time dateTime={`PT${activeFrame.timestamp}S`}>{formatEvidenceTime(activeFrame.timestamp)}</time>
          <button onClick={seekCurrentFrame} type="button">SEEK VIDEO →</button>
        </footer>

        <span aria-hidden="true" className={styles.preloadImage}>
          <Image alt="" fill loading="eager" sizes="1px" src={nextFrame.imageSrc} />
        </span>
      </div>

      <aside className={styles.detailColumn}>
        <header className={styles.detailHeader}>
          <span>EVIDENCE DETAIL</span>
          <h3>{activeFrame.title}</h3>
          <p>{activeFrame.englishTitle}</p>
          <time>TIMECODE / <b>{formatEvidenceTime(activeFrame.timestamp)}</b></time>
        </header>

        <section className={styles.factSection}>
          <span>OBSERVED FACT</span>
          <ul>
            {activeFrame.facts.map((fact, index) => (
              <li data-highlight={activeAnnotation?.factIndex === index || undefined} key={fact}>{fact}</li>
            ))}
          </ul>
        </section>

        <section className={styles.matchSection}>
          <span>PROMPT MATCH</span>
          <div aria-label={`${activeFrame.promptMatch} / 5 ELEMENTS VERIFIED`} className={styles.matchBars} role="img">
            {Array.from({ length: 5 }, (_, index) => <i data-lit={index < activeFrame.promptMatch || undefined} key={index} />)}
          </div>
          <strong>{activeFrame.promptMatch} / 5 ELEMENTS VERIFIED</strong>
        </section>

        <section className={styles.issueSection}>
          <span>ISSUE TAG</span>
          <strong>{issueLabel}</strong>
          <button onClick={seekCurrentFrame} type="button">RETURN TO FRAME →</button>
        </section>

        {isAudioVisual ? (
          <div aria-hidden="true" className={styles.miniWave}>
            {inspectorWave.map((height, index) => (
              <i key={`${height}-${index}`} style={{ "--wave-height": `${height}%`, "--wave-delay": `${index * -47}ms` } as CSSProperties} />
            ))}
          </div>
        ) : null}
      </aside>
    </section>
  );
}
