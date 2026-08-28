"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import styles from "./MultiTurnVQAProject.module.css";

type ExecutionDetail = {
  id: string;
  code: string;
  action: string;
  evidence: string;
  output: string;
};

const executionDetails: readonly ExecutionDetail[] = [
  {
    id: "01",
    code: "GROUND VISUAL FACTS",
    action: "识别画面中的对象、属性与空间关系。",
    evidence: "红色杯子、黄色书本、绿色植物与窗户。",
    output: "F01—F03 / R01 事实节点",
  },
  {
    id: "02",
    code: "BUILD Q1 / A1",
    action: "根据完整对象集合生成不依赖历史的首轮问题。",
    evidence: "F01 / TABLE OBJECT SET",
    output: "Q1 / A1 独立问答",
  },
  {
    id: "03",
    code: "LINK Q2—Q4",
    action: "让后续问题真实依赖前文已确认对象。",
    evidence: "Q1 → F02 → F03",
    output: "3—5 轮递进问题链",
  },
  {
    id: "04",
    code: "VERIFY EACH TURN",
    action: "逐轮核对事实、属性、指代与答案完整性。",
    evidence: "问题标签、唯一主维度和证据节点。",
    output: "PASS / REVIEW 审查记录",
  },
  {
    id: "05",
    code: "REWRITE AMBIGUITY",
    action: "将歧义指代、弱依赖与遗漏答案退回改写。",
    evidence: "Q2 指代歧义 / A1 对象遗漏",
    output: "修订后的稳定样本",
  },
  {
    id: "06",
    code: "RELEASE SFT SAMPLE",
    action: "保留修改记录并按统一结构完成版本归档。",
    evidence: "复核通过的问题链与事实节点",
    output: "MULTI-TURN SFT / READY",
  },
] as const;

const STEP_DURATION = 2800;

export function VQAExecutionTimeline({ steps }: { steps: string[] }) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const trackViewportRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scanRevision, setScanRevision] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const activeDetail = executionDetails[activeIndex] ?? executionDetails[0];
  const activeName = steps[activeIndex] ?? "";
  const progress = executionDetails.length > 1 ? (activeIndex / (executionDetails.length - 1)) * 100 : 0;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);

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
    const timeline = timelineRef.current;
    if (!timeline) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.18 },
    );

    observer.observe(timeline);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !isInView || !isPageVisible) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % executionDetails.length);
    }, STEP_DURATION);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isInView, isPageVisible, prefersReducedMotion, scanRevision]);

  useEffect(() => {
    const viewport = trackViewportRef.current;
    const button = buttonRefs.current[activeIndex];
    if (!viewport || !button || viewport.scrollWidth <= viewport.clientWidth) return;

    const targetLeft = button.offsetLeft - (viewport.clientWidth - button.offsetWidth) / 2;
    viewport.scrollTo({ left: Math.max(0, targetLeft), behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [activeIndex, prefersReducedMotion]);

  const selectStep = (index: number) => {
    setActiveIndex(index);
    setScanRevision((revision) => revision + 1);
  };

  return (
    <div className={styles.executionTimeline} ref={timelineRef}>
      <header className={styles.executionHeader}>
        <div>
          <span>07 / EXECUTION</span>
          <h2>执行流程</h2>
        </div>
        <p><i aria-hidden="true" />ONE-PASS WORKFLOW SCAN / 01—06</p>
      </header>

      <div className={styles.executionTrackViewport} ref={trackViewportRef}>
        <div
          className={styles.executionTrack}
          style={{ "--execution-progress": `${progress}%` } as CSSProperties}
        >
          <div className={styles.executionTrackLine} aria-hidden="true"><i /></div>
          <div className={styles.executionStepGrid} role="group" aria-label="选择执行流程步骤">
            {executionDetails.map((detail, index) => {
              const name = steps[index] ?? "";
              const isActive = activeIndex === index;
              return (
                <button
                  aria-label={`第 ${index + 1} 步：${name}，${detail.code}`}
                  aria-pressed={isActive}
                  className={styles.executionStep}
                  data-complete={index < activeIndex}
                  key={detail.id}
                  onClick={() => selectStep(index)}
                  ref={(node) => { buttonRefs.current[index] = node; }}
                  type="button"
                >
                  <i className={styles.executionPulse} aria-hidden="true" />
                  <span>{detail.id}</span>
                  <strong>{name}</strong>
                  <small>{detail.code}</small>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section className={styles.executionDetail} aria-live="polite" aria-atomic="true">
        <div className={styles.executionLiveIndex}>{activeDetail.id}<small> / 06</small></div>
        <div className={styles.executionDetailContent} key={`${activeDetail.id}-${scanRevision}`}>
          <div><span>ACTION</span><strong>{activeDetail.action}</strong></div>
          <div><span>EVIDENCE</span><strong>{activeDetail.evidence}</strong></div>
          <div className={styles.executionOutput}><span>OUTPUT</span><strong>{activeDetail.output}</strong></div>
        </div>
        <div className={styles.executionActiveState}>ACTIVE STEP / {activeDetail.id} · {activeName}</div>
        <i className={styles.executionTimer} key={`timer-${activeDetail.id}-${scanRevision}`} aria-hidden="true" />
      </section>
    </div>
  );
}
