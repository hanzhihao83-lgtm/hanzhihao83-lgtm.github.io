"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import styles from "./MultiTurnVQAProject.module.css";

type EvidenceId = "mug" | "book";
type PhaseId = "question" | "evidence" | "context" | "verify";

type VisualPhase = {
  id: PhaseId;
  index: string;
  phase: string;
  nodeLabel: string;
  question: string;
  description: string;
  status: string;
  evidenceLabel: string;
  activeEvidence: readonly EvidenceId[];
  dependency: string;
  relationVisible: boolean;
  controlLabel: string;
};

const visualPhases: readonly VisualPhase[] = [
  {
    id: "question",
    index: "01",
    phase: "QUESTION",
    nodeLabel: "问题读取",
    question: "桌面上有什么物品？",
    description: "读取问题，等待视觉证据定位。",
    status: "ANALYZING / Q1",
    evidenceLabel: "PENDING",
    activeEvidence: [],
    dependency: "IMAGE INPUT",
    relationVisible: false,
    controlLabel: "读取问题",
  },
  {
    id: "evidence",
    index: "02",
    phase: "EVIDENCE",
    nodeLabel: "视觉定位",
    question: "“它”是什么颜色的？",
    description: "锁定 F02：指代对象为红色杯子。",
    status: "EVIDENCE / F02",
    evidenceLabel: "F02 / RED MUG",
    activeEvidence: ["mug"],
    dependency: "Q1 → F02",
    relationVisible: false,
    controlLabel: "定位红色杯子",
  },
  {
    id: "context",
    index: "03",
    phase: "CONTEXT",
    nodeLabel: "上下文关联",
    question: "杯子旁边的物品是什么颜色？",
    description: "关联 F03：杯子旁边的书本为黄色。",
    status: "LINKED / Q1 → Q3",
    evidenceLabel: "F02 + F03",
    activeEvidence: ["mug", "book"],
    dependency: "F02 → F03",
    relationVisible: true,
    controlLabel: "关联黄色书本",
  },
  {
    id: "verify",
    index: "04",
    phase: "VERIFY",
    nodeLabel: "一致性校验",
    question: "上下文事实是否保持一致？",
    description: "对象、属性与空间关系一致，样本通过校验。",
    status: "CONSISTENCY / PASS",
    evidenceLabel: "F02 + F03",
    activeEvidence: ["mug", "book"],
    dependency: "Q1 → Q4 / VALID",
    relationVisible: true,
    controlLabel: "完成一致性校验",
  },
] as const;

const PHASE_DURATION = 3000;

export function MultiTurnVQAContextVisual() {
  const visualRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [playbackRevision, setPlaybackRevision] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const activePhase = visualPhases[activeIndex];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
      if (mediaQuery.matches) setActiveIndex(visualPhases.length - 1);
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
    const element = visualRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.16 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || isHovered || !isInView || !isPageVisible) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % visualPhases.length);
    }, PHASE_DURATION);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isHovered, isInView, isPageVisible, playbackRevision, prefersReducedMotion]);

  const selectPhase = (index: number) => {
    setActiveIndex(index);
    setIsHovered(false);
    setPlaybackRevision((revision) => revision + 1);
  };

  const hasEvidence = (evidenceId: EvidenceId) => activePhase.activeEvidence.includes(evidenceId);

  return (
    <figure
      className={styles.contextVisual}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={visualRef}
    >
      <div className={styles.contextMedia} data-phase={activePhase.id} data-reduced-motion={prefersReducedMotion ? "true" : "false"}>
        <div className={styles.contextWorkspace}>
          <section className={styles.contextReadout} aria-live="polite" aria-atomic="true">
            <span className={styles.contextReadoutEyebrow}>VISUAL CONTEXT / SFT</span>
            <span className={styles.contextReadoutLive}>TURN {activePhase.index} / {activePhase.phase}</span>
            <strong>{activePhase.question}</strong>
            <p>{activePhase.description}</p>
            <dl className={styles.contextReadoutData}>
              <div>
                <dt>EVIDENCE</dt>
                <dd>{activePhase.evidenceLabel}</dd>
              </div>
              <div>
                <dt>LINK</dt>
                <dd>{activePhase.dependency}</dd>
              </div>
            </dl>
          </section>

          <section className={styles.contextEvidenceVisual} aria-label="视觉证据画面">
            <Image
              alt="暮色窗边的视觉问答分析场景：桌面上有红色杯子、黄色书本和绿植，并展示视觉证据与一致性校验关系"
              className={styles.contextImage}
              height={941}
              sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1100px) 62vw, 38vw"
              src="/images/projects/project-02/multi-turn-vqa-hero.jpg"
              width={1672}
            />
            <div className={styles.contextVisualMeta} aria-hidden="true">
              <span>EVIDENCE VIEW / SFT</span>
              <span>{activePhase.status}</span>
            </div>
            <div className={styles.contextVignette} aria-hidden="true" />
            <div className={styles.contextScanLine} aria-hidden="true" />

            <div
              className={`${styles.contextEvidenceBox} ${styles.contextCupBox}`}
              data-active={hasEvidence("mug") ? "true" : "false"}
              aria-hidden="true"
            >
              <i /><i /><i /><i />
              <span>F02 / RED MUG</span>
            </div>
            <div
              className={`${styles.contextEvidenceBox} ${styles.contextBookBox}`}
              data-active={hasEvidence("book") ? "true" : "false"}
              aria-hidden="true"
            >
              <i /><i /><i /><i />
              <span>F03 / YELLOW BOOK</span>
            </div>
            <div className={styles.contextEvidenceFlow} aria-hidden="true" />
            <div className={styles.contextRelationLine} data-visible={activePhase.relationVisible ? "true" : "false"} aria-hidden="true">
              <span>F02 → F03</span>
            </div>
          </section>
        </div>

        <nav className={styles.contextPhaseControls} aria-label="多轮视觉问答分析阶段">
          {visualPhases.map((phase, index) => (
            <button
              aria-label={`切换到${phase.nodeLabel}阶段：${phase.controlLabel}`}
              aria-pressed={index === activeIndex}
              key={phase.id}
              onClick={() => selectPhase(index)}
              type="button"
              data-state={index === activeIndex ? "active" : index < activeIndex ? "complete" : "idle"}
            >
              <span>{phase.index} / {phase.phase}</span>
              <small>{phase.controlLabel}</small>
            </button>
          ))}
        </nav>
      </div>
    </figure>
  );
}
