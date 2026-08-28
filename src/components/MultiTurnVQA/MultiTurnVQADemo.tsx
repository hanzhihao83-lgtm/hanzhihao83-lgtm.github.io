"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./MultiTurnVQAProject.module.css";

const dialogueTurns = [
  {
    question: "桌面上有什么物品？",
    answer: "桌面上有一个红色杯子和一本黄色书。",
    status: "TURN 01 / OBJECT GROUNDING",
    fact: "F01 / 桌面存在",
    node: "F01 / TABLE SURFACE",
    relation: "IMAGE → TABLE → OBJECT SET",
    dependency: "NONE / IMAGE ONLY",
    reasoning: "对象识别",
    verification: "CONSISTENT / 桌面、杯子与书本均可在画面中定位。",
  },
  {
    question: "它是什么颜色的？",
    answer: "杯子是红色的。",
    status: "TURN 02 / REFERENCE RESOLUTION",
    fact: "F02 / 红色杯子位于桌面",
    node: "F02 / RED MUG",
    relation: "它 = Q1 中的杯子",
    dependency: "Q1 / OBJECT SET",
    reasoning: "指代消解",
    verification: "CONSISTENT / 指代唯一，颜色与 F02 保持一致。",
  },
  {
    question: "杯子旁边的物品是什么颜色？",
    answer: "杯子旁边的书是黄色的。",
    status: "TURN 03 / ATTRIBUTE TRACKING",
    fact: "F03 / 黄色书本位于杯子旁边",
    node: "F03 / YELLOW BOOK",
    relation: "BOOK beside MUG",
    dependency: "Q2 / RED MUG",
    reasoning: "属性追踪",
    verification: "CONSISTENT / 书本颜色与相邻关系均未漂移。",
  },
  {
    question: "书在窗户的什么位置？",
    answer: "书位于窗户的前方偏下位置。",
    status: "TURN 04 / SPATIAL REASONING",
    fact: "R01 / 书本位于窗户前方偏下",
    node: "R01 / SPATIAL",
    relation: "BOOK → front-lower of WINDOW",
    dependency: "Q3 / YELLOW BOOK",
    reasoning: "空间关系",
    verification: "CONSISTENT / 参照物明确，关系可由图像复核。",
  },
] as const;

export function MultiTurnVQADemo() {
  const [activeTurn, setActiveTurn] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const turnListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = window.setTimeout(() => {
      setActiveTurn((current) => (current + 1) % dialogueTurns.length);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [activeTurn, paused, reducedMotion, restartKey]);

  useEffect(() => {
    const list = turnListRef.current;
    const button = list?.querySelector<HTMLElement>(`[data-demo-turn="${activeTurn}"]`);
    if (!list || !button || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: button.offsetLeft - list.offsetLeft, behavior: reducedMotion ? "auto" : "smooth" });
  }, [activeTurn, reducedMotion]);

  const selectTurn = (index: number) => {
    setActiveTurn(index);
    setRestartKey((key) => key + 1);
  };

  const active = dialogueTurns[activeTurn];

  return (
    <section
      aria-label="多轮视觉问答演示控制台"
      className={styles.demoConsole}
      data-turn={activeTurn + 1}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={styles.consoleHeader}>
        <span>DIALOGUE GRAPH / DEMO SAMPLE</span>
        <span className={styles.consoleStatus}><i aria-hidden="true" />{active.status}</span>
      </div>

      <div className={styles.consoleMain}>
        <div className={styles.sceneColumn}>
          <div
            aria-label="演示图像：窗边的木桌上有红色杯子、黄色书本和绿色植物"
            className={styles.demoScene}
            role="img"
          >
            <span className={styles.sampleBadge}>DEMO SAMPLE</span>
            <div className={styles.windowShape}><i aria-hidden="true" /></div>
            <div className={styles.tableShape} aria-hidden="true" />
            <div className={styles.mugShape} aria-hidden="true" />
            <div className={styles.bookShape} aria-hidden="true" />
            <div className={styles.plantShape} aria-hidden="true"><i /><i /><i /></div>
            <div className={`${styles.evidenceBox} ${styles.evidencePrimary}`} aria-hidden="true">
              <span>{active.fact}</span>
            </div>
            <div className={styles.evidenceSecondary} aria-hidden="true" />
          </div>
          <div className={styles.sceneReadout} aria-live="polite">
            <span>VISUAL EVIDENCE</span>
            <strong>{active.fact}</strong>
            <small>{active.relation}</small>
          </div>
        </div>

        <div className={styles.dialogueColumn}>
          <div className={styles.turnList} aria-label="选择对话轮次" ref={turnListRef}>
            {dialogueTurns.map((turn, index) => (
              <button
                aria-label={`切换到第 ${index + 1} 轮：${turn.question}`}
                aria-pressed={activeTurn === index}
                className={styles.turnButton}
                data-demo-turn={index}
                key={turn.status}
                onClick={() => selectTurn(index)}
                type="button"
              >
                <span>Q{index + 1}</span>
                <span>{turn.question}</span>
                <i aria-hidden="true">0{index + 1}</i>
              </button>
            ))}
          </div>

          <div className={styles.answerPanel} aria-live="polite" key={active.status}>
            <span>ACTIVE ANSWER / A{activeTurn + 1}</span>
            <strong>{active.answer}</strong>
            <p>{active.verification}</p>
            <dl className={styles.turnMetadata}>
              <div><dt>DEPENDENCY</dt><dd>{active.dependency}</dd></div>
              <div><dt>FACT NODE</dt><dd>{active.fact}</dd></div>
              <div><dt>REASONING</dt><dd>{active.reasoning}</dd></div>
              <div><dt>CONSISTENCY</dt><dd><i aria-hidden="true" /> PASS / DEMO</dd></div>
            </dl>
          </div>
        </div>
      </div>

      <div className={styles.factChain} aria-label="事实节点链">
        {dialogueTurns.map((turn, index) => (
          <button
            aria-label={`查看事实节点 ${turn.node}`}
            aria-pressed={activeTurn === index}
            key={turn.node}
            onClick={() => selectTurn(index)}
            type="button"
          >
            <span>0{index + 1}</span>
            <strong>{turn.node}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
