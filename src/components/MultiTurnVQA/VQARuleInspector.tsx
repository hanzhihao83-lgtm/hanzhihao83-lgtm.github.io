"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./MultiTurnVQAProject.module.css";

type FocusArea = "mug" | "book" | "spatial" | "reference" | "history" | "pair";

type RuleExample = {
  code: string;
  evidence: string;
  check: string;
  nodes: readonly [string, string, string];
  focus: FocusArea;
  conclusion: string;
  support: string;
};

const ruleExamples: Record<string, RuleExample> = {
  对象识别: {
    code: "RULE / OBJECT",
    evidence: "F02 / RED MUG",
    check: "回答中的“杯子”能够回到画面中的红色杯子证据框。",
    nodes: ["IMAGE", "MUG", "ANSWER"],
    focus: "mug",
    conclusion: "杯子",
    support: "GROUNDED / F02",
  },
  属性追踪: {
    code: "RULE / ATTRIBUTE",
    evidence: "F03 / YELLOW BOOK",
    check: "黄色属性在 Q3 的提问与回答中保持一致，不发生漂移。",
    nodes: ["BOOK", "YELLOW", "Q3"],
    focus: "book",
    conclusion: "黄色",
    support: "STABLE / F03",
  },
  空间关系: {
    code: "RULE / SPATIAL",
    evidence: "R01 / BOOK ↔ WINDOW",
    check: "书本的位置描述明确使用窗户作为参照物。",
    nodes: ["BOOK", "R01", "WINDOW"],
    focus: "spatial",
    conclusion: "关系成立",
    support: "LINKED / R01",
  },
  指代消解: {
    code: "RULE / REFERENCE",
    evidence: "Q2 / 它 = 杯子",
    check: "代词“它”只指向 Q1 已确认的杯子，不存在第二候选对象。",
    nodes: ["Q1", "MUG", "Q2"],
    focus: "reference",
    conclusion: "它 = 杯子",
    support: "UNIQUE / Q2",
  },
  上下文一致: {
    code: "RULE / CONTEXT",
    evidence: "Q1 → Q2 → Q3 → Q4",
    check: "后续回答沿用已确认对象、属性和关系，不推翻历史事实。",
    nodes: ["HISTORY", "FACTS", "PASS"],
    focus: "history",
    conclusion: "PASS",
    support: "Q1 → Q4",
  },
  答案充分: {
    code: "RULE / SUFFICIENCY",
    evidence: "A1 / MUG + BOOK",
    check: "答案覆盖桌面上的两个目标物品，同时不加入图像外信息。",
    nodes: ["QUESTION", "COVER", "ANSWER"],
    focus: "pair",
    conclusion: "两项覆盖",
    support: "MUG + BOOK",
  },
};

const inspectionStages = ["IMAGE", "EVIDENCE", "ANSWER"] as const;
const INSPECTION_DURATION = 2400;

export function VQARuleInspector({ rules }: { rules: string[] }) {
  const inspectorRef = useRef<HTMLElement>(null);
  const [activeRule, setActiveRule] = useState(rules[0]);
  const [activeStage, setActiveStage] = useState(0);
  const [playbackRevision, setPlaybackRevision] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const active = ruleExamples[activeRule] ?? ruleExamples.对象识别;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
      if (mediaQuery.matches) setActiveStage(inspectionStages.length - 1);
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
    const inspector = inspectorRef.current;
    if (!inspector) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.18 },
    );

    observer.observe(inspector);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || isHovered || !isInView || !isPageVisible) return;

    const timer = window.setTimeout(() => {
      setActiveStage((stage) => (stage + 1) % inspectionStages.length);
    }, INSPECTION_DURATION);

    return () => window.clearTimeout(timer);
  }, [activeRule, activeStage, isHovered, isInView, isPageVisible, playbackRevision, prefersReducedMotion]);

  const selectRule = (rule: string) => {
    setActiveRule(rule);
    setActiveStage(0);
    setPlaybackRevision((revision) => revision + 1);
  };

  const selectStage = (stage: number) => {
    setActiveStage(stage);
    setPlaybackRevision((revision) => revision + 1);
  };

  const stageDetails = [
    { evidence: "FULL FRAME / INPUT", check: "读取原始画面，建立对象候选。", status: "SCANNING / IMAGE" },
    { evidence: active.evidence, check: active.check, status: "EVIDENCE / LOCKED" },
    { evidence: `${active.evidence} → ANSWER`, check: active.check, status: "DEMO / CHECKABLE" },
  ] as const;
  const currentDetails = stageDetails[activeStage];

  return (
    <div className={styles.ruleWorkspace}>
      <div className={styles.ruleMatrix} aria-label="改写规则列表">
        {rules.map((rule, index) => (
          <button
            aria-label={`检查规则：${rule}。${ruleExamples[rule]?.check ?? ""}`}
            aria-pressed={activeRule === rule}
            key={rule}
            onClick={() => selectRule(rule)}
            type="button"
          >
            <span>0{index + 1}</span>
            <div><h3>{rule}</h3><p>{ruleExamples[rule]?.check}</p></div>
            <i aria-hidden="true">INSPECT ↗</i>
          </button>
        ))}
      </div>

      <aside
        className={styles.ruleEvidence}
        data-focus={active.focus}
        data-stage={activeStage}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        ref={inspectorRef}
      >
        <div className={styles.ruleEvidenceHeader}>
          <span>ACTIVE RULE INSPECTOR</span>
          <strong>{active.code}</strong>
        </div>
        <div className={styles.ruleEvidenceFlow}>
          <div className={styles.ruleEvidenceTrack} aria-hidden="true" />
          <div className={styles.ruleEvidencePulse} aria-hidden="true" />
          {active.nodes.map((node, index) => {
            const state = index === activeStage ? "active" : index < activeStage ? "complete" : "idle";
            return (
              <button
                aria-label={`查看${activeRule}规则的第 ${index + 1} 步证据：${node}`}
                aria-pressed={index === activeStage}
                className={styles.ruleLens}
                data-lens={inspectionStages[index].toLowerCase()}
                data-state={state}
                key={`${activeRule}-${node}`}
                onClick={() => selectStage(index)}
                type="button"
              >
                {index < 2 ? <span className={styles.ruleLensVisual} aria-hidden="true" /> : (
                  <span className={styles.ruleLensAnswer}>
                    <strong>{active.conclusion}</strong>
                    <small>{active.support}</small>
                  </span>
                )}
                <span className={styles.ruleLensScan} aria-hidden="true" />
                <i>{String(index + 1).padStart(2, "0")}</i>
                <span>{index === 1 ? active.evidence : inspectionStages[index]}</span>
              </button>
            );
          })}
        </div>
        <dl aria-live="polite" aria-atomic="true">
          <div><dt>VISUAL EVIDENCE</dt><dd>{currentDetails.evidence}</dd></div>
          <div><dt>CHECK CONTENT</dt><dd>{currentDetails.check}</dd></div>
          <div><dt>REVIEW STATUS</dt><dd><i aria-hidden="true" /> {currentDetails.status}</dd></div>
        </dl>
      </aside>
    </div>
  );
}
