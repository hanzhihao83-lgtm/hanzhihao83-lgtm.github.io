"use client";

import type { CSSProperties, FocusEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { EvaluationDimension, VideoCase } from "@/types/evaluation";

import styles from "./IssueLedger.module.css";

interface IssueLedgerProps {
  activeTagId: string | null;
  cases: VideoCase[];
  className?: string;
  dimensions: EvaluationDimension[];
  filteredCases: VideoCase[];
  onClearTag: () => void;
  onSelectTag: (tagId: string) => void;
  onVerifyCase: (item: VideoCase) => void;
}

const SCAN_DURATION = 1100;
const RESUME_DELAY = 1000;

const issueDisplayCodes: Record<string, string> = {
  "if-action-partial": "IF-A",
  "if-camera-partial": "IF-C",
  "mq-transition-rigid": "MQ-T",
  "mq-water-feedback": "MQ-W",
  "vq-subject-detail": "VQ-D",
  "vq-material-coverage": "VQ-M",
  "tc-prop-structure": "TC-P",
  "tc-umbrella-shape": "TC-U",
  "tc-hand-prop": "TC-H",
  "av-timeline": "AV-T",
  "av-train-early": "AV-E",
  "av-spatial-direction": "AV-S",
};

function displayScore(score: VideoCase["score"]) {
  if (typeof score === "number") return `${score}/5`;
  if (score === "NA") return "N/A";
  return "—";
}

export function IssueLedger({
  activeTagId,
  cases,
  className,
  dimensions,
  filteredCases,
  onClearTag,
  onSelectTag,
  onVerifyCase,
}: IssueLedgerProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const scanTimerRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const scanIndexRef = useRef(0);
  const resumeImmediatelyRef = useRef(false);
  const activeTagIdRef = useRef(activeTagId);
  const focusWithinTagsRef = useRef(false);

  const [isInView, setIsInView] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const tracks = useMemo(() => dimensions.flatMap((dimension) => {
    const caseData = cases.find((item) => item.dimension === dimension.id);
    if (!caseData) return [];
    const tags = caseData.issueTags.flatMap((tagId) => {
      const tag = dimension.issueTags.find((item) => item.id === tagId);
      return tag ? [{ ...tag, code: issueDisplayCodes[tag.id] ?? tag.id.toUpperCase() }] : [];
    });
    return [{ caseData, dimension, tags }];
  }), [cases, dimensions]);

  const allTags = useMemo(() => tracks.flatMap((track, trackIndex) =>
    track.tags.map((tag) => ({ tag, trackIndex }))), [tracks]);
  const selectedEntry = allTags.find(({ tag }) => tag.id === activeTagId) ?? null;
  const selectedTrack = selectedEntry ? tracks[selectedEntry.trackIndex] : null;
  const evidenceCase = filteredCases[0] ?? selectedTrack?.caseData ?? null;
  const selectedShortName = selectedTrack?.caseData.caseId.split("-")[0] ?? "—";

  const clearScanTimer = useCallback(() => {
    if (scanTimerRef.current === null) return;
    window.clearTimeout(scanTimerRef.current);
    scanTimerRef.current = null;
  }, []);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current === null) return;
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = null;
  }, []);

  const selectTag = useCallback((tagId: string) => {
    clearScanTimer();
    clearResumeTimer();
    setIsInteracting(true);
    onSelectTag(tagId);
  }, [clearResumeTimer, clearScanTimer, onSelectTag]);

  const resumeScan = useCallback(() => {
    clearResumeTimer();
    if (isReducedMotion) return;
    resumeTimerRef.current = window.setTimeout(() => {
      resumeImmediatelyRef.current = true;
      setIsInteracting(false);
      resumeTimerRef.current = null;
    }, RESUME_DELAY);
  }, [clearResumeTimer, isReducedMotion]);

  const handleTagBlur = (event: FocusEvent<HTMLButtonElement>) => {
    const tagRegistry = event.currentTarget.closest('[data-tag-registry="true"]');
    if (tagRegistry?.contains(event.relatedTarget as Node | null)) return;
    focusWithinTagsRef.current = false;
    resumeScan();
  };

  const handleTagMouseLeave = () => {
    if (focusWithinTagsRef.current) return;
    resumeScan();
  };

  const clearSelection = () => {
    clearScanTimer();
    onClearTag();
    setIsInteracting(true);
    resumeScan();
  };

  useEffect(() => {
    activeTagIdRef.current = activeTagId;
  }, [activeTagId]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), {
      rootMargin: "-18% 0px -22% 0px",
      threshold: 0.08,
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cameraIssue = allTags.find(({ tag }) => tag.id === "if-camera-partial")?.tag;
    const updateMotionPreference = () => {
      const reduced = motionQuery.matches;
      setIsReducedMotion(reduced);
      if (reduced && !activeTagIdRef.current && cameraIssue) onSelectTag(cameraIssue.id);
    };
    updateMotionPreference();
    motionQuery.addEventListener("change", updateMotionPreference);
    return () => motionQuery.removeEventListener("change", updateMotionPreference);
  }, [allTags, onSelectTag]);

  useEffect(() => {
    clearScanTimer();
    if (!isInView || isReducedMotion || isInteracting || !allTags.length) return;

    const currentIndex = allTags.findIndex(({ tag }) => tag.id === activeTagIdRef.current);
    scanIndexRef.current = currentIndex >= 0 ? (currentIndex + 1) % allTags.length : 0;

    const scan = () => {
      const next = allTags[scanIndexRef.current];
      onSelectTag(next.tag.id);
      scanIndexRef.current = (scanIndexRef.current + 1) % allTags.length;
      scanTimerRef.current = window.setTimeout(scan, SCAN_DURATION);
    };
    const initialDelay = resumeImmediatelyRef.current ? 0 : activeTagIdRef.current ? SCAN_DURATION : 0;
    resumeImmediatelyRef.current = false;
    scanTimerRef.current = window.setTimeout(scan, initialDelay);
    return clearScanTimer;
  }, [allTags, clearScanTimer, isInView, isInteracting, isReducedMotion, onSelectTag]);

  useEffect(() => () => {
    clearScanTimer();
    clearResumeTimer();
  }, [clearResumeTimer, clearScanTimer]);

  return (
    <section
      aria-labelledby="tags-title"
      className={[className, styles.section].filter(Boolean).join(" ")}
      id="issue-tags"
      ref={sectionRef}
      style={{ "--issue-active": selectedTrack?.dimension.color ?? "#b9ff43" } as CSSProperties}
    >
      <header className={styles.heading}>
        <span>06 / ISSUE LEDGER</span>
        <h2 id="tags-title">一条标签，<br />一条归属轨道。</h2>
        <p>问题标签按维度登记，不跨维度复用。每条轨道连接唯一案例，点击标签即可返回Score Lab定位证据。</p>
      </header>

      <div aria-hidden="true" className={styles.columnHead}>
        <span>UNIQUE DIMENSION</span><span>ISSUE TAG REGISTRY</span><span>LINKED CASE</span>
      </div>

      <div className={styles.tracks}>
        {tracks.map(({ caseData, dimension, tags }, trackIndex) => {
          const trackActive = selectedEntry?.trackIndex === trackIndex;
          return (
            <article
              className={styles.track}
              data-active={trackActive || undefined}
              key={dimension.id}
              style={{ "--dimension-color": dimension.color } as CSSProperties}
            >
              <header className={styles.dimension}>
                <span>{String(trackIndex + 1).padStart(2, "0")}</span>
                <h3>{dimension.name}<small>{dimension.englishName}</small></h3>
              </header>
              <div className={styles.tags} data-tag-registry="true">
                {tags.map((tag) => {
                  const selected = tag.id === activeTagId;
                  return (
                    <button
                      aria-label={`${tag.label}，代码 ${tag.code}，唯一归属 ${dimension.name}，关联案例 ${caseData.caseId}`}
                      aria-pressed={selected}
                      data-tag-id={tag.id}
                      data-dimmed={activeTagId !== null && !selected || undefined}
                      key={tag.id}
                      onBlur={handleTagBlur}
                      onClick={() => selectTag(tag.id)}
                      onFocus={(event) => {
                        focusWithinTagsRef.current = event.currentTarget.matches(":focus-visible");
                        selectTag(tag.id);
                      }}
                      onMouseEnter={() => selectTag(tag.id)}
                      onMouseLeave={handleTagMouseLeave}
                      type="button"
                    >
                      <span>{tag.label}</span><i>{tag.code}</i>
                    </button>
                  );
                })}
              </div>
              <div className={styles.caseMeta}>
                <strong>{caseData.caseId}</strong>
                <span>{displayScore(caseData.score)} · N=1</span>
              </div>
            </article>
          );
        })}
      </div>

      <footer aria-atomic="true" aria-live="polite" className={styles.inspector}>
        <div>
          <span>SELECTED ISSUE</span>
          <strong>{selectedEntry?.tag.label ?? "未选择"}</strong>
          {activeTagId && <button aria-label="清除问题标签选择" onClick={clearSelection} type="button">CLEAR ×</button>}
        </div>
        <div>
          <span>LOCKED DIMENSION</span>
          <strong className={styles.lockedDimension}>{selectedTrack ? `${selectedTrack.dimension.name} / ${selectedShortName}` : "—"}</strong>
        </div>
        <div>
          <span>EVIDENCE CASE</span>
          <strong>{evidenceCase ? `${evidenceCase.caseId} · ${displayScore(evidenceCase.score)}` : "—"}</strong>
        </div>
        <button
          aria-label={evidenceCase ? `在 Score Lab 验证 ${selectedEntry?.tag.label ?? "所选问题"}，打开案例 ${evidenceCase.caseId}` : "请先选择问题标签"}
          disabled={!evidenceCase}
          onClick={() => evidenceCase && onVerifyCase(evidenceCase)}
          type="button"
        >
          VERIFY IN LAB ↗
        </button>
      </footer>
    </section>
  );
}
