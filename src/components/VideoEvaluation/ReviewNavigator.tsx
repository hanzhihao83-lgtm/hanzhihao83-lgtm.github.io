"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./ReviewNavigator.module.css";

export interface ReviewNavigatorStep {
  anchor: string;
  color: string;
  context: string;
  description: string;
  meta: string;
  title: string;
}

interface ReviewNavigatorProps {
  steps: ReviewNavigatorStep[];
}

const CLICK_LOCK_DURATION = 1400;
const TARGET_OFFSET = 112;

function getTarget(anchor: string) {
  return document.getElementById(anchor.replace(/^#/, ""));
}

export function ReviewNavigator({ steps }: ReviewNavigatorProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const clickLockedRef = useRef(false);
  const lockTimerRef = useRef<number | null>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const highlightedTargetRef = useRef<HTMLElement | null>(null);

  const selectStep = useCallback((index: number) => {
    activeIndexRef.current = index;
    setActiveIndex(index);
  }, []);

  const clearHighlight = useCallback(() => {
    if (highlightTimerRef.current !== null) {
      window.clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }
    highlightedTargetRef.current?.removeAttribute("data-review-context-highlight");
    highlightedTargetRef.current = null;
  }, []);

  const navigateToStep = useCallback((index: number) => {
    const step = steps[index];
    const target = step ? getTarget(step.anchor) : null;
    if (!step || !target) return;

    selectStep(index);
    clickLockedRef.current = true;
    if (lockTimerRef.current !== null) window.clearTimeout(lockTimerRef.current);
    lockTimerRef.current = window.setTimeout(() => {
      clickLockedRef.current = false;
      lockTimerRef.current = null;
    }, CLICK_LOCK_DURATION);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - TARGET_OFFSET;
    window.scrollTo({ behavior: reducedMotion ? "auto" : "smooth", top: Math.max(0, targetTop) });

    clearHighlight();
    if (!reducedMotion) {
      target.setAttribute("data-review-context-highlight", "true");
      highlightedTargetRef.current = target;
      highlightTimerRef.current = window.setTimeout(clearHighlight, 620);
    }
  }, [clearHighlight, selectStep, steps]);

  useEffect(() => {
    const targets = steps.flatMap((step, index) => {
      const element = getTarget(step.anchor);
      return element ? [{ element, index }] : [];
    });
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      if (clickLockedRef.current) return;

      const visibleIndices = entries
        .filter((entry) => entry.isIntersecting)
        .flatMap((entry) => {
          const match = targets.find(({ element }) => element === entry.target);
          return match ? [match.index] : [];
        });

      if (!visibleIndices.length) return;
      if (visibleIndices.includes(activeIndexRef.current)) return;
      selectStep(Math.min(...visibleIndices));
    }, {
      rootMargin: "-35% 0px -50% 0px",
      threshold: [0, 0.01],
    });

    targets.forEach(({ element }) => observer.observe(element));
    return () => observer.disconnect();
  }, [selectStep, steps]);

  useEffect(() => () => {
    if (lockTimerRef.current !== null) window.clearTimeout(lockTimerRef.current);
    clearHighlight();
  }, [clearHighlight]);

  const activeStep = steps[activeIndex] ?? steps[0];
  if (!activeStep) return null;

  return (
    <section
      aria-label="与网页章节联动的六步评测导航"
      className={styles.navigator}
      style={{ "--review-active": activeStep.color } as CSSProperties}
    >
      <header className={styles.header}>
        <span>REVIEW NAVIGATOR / 06 STEPS</span>
        <span className={styles.syncStatus}><i aria-hidden="true" />SYNCED TO PAGE CONTEXT</span>
      </header>

      <button
        aria-label="完成第六步验证闭环并返回原始提示词与评测协议"
        className={styles.verifyLoop}
        onClick={() => navigateToStep(0)}
        type="button"
      >
        06 → <strong>01</strong> / VERIFY LOOP
      </button>

      <ol className={styles.track}>
        {steps.map((step, index) => {
          const active = index === activeIndex;
          const completed = index < activeIndex;
          const stepNumber = String(index + 1).padStart(2, "0");
          return (
            <li
              data-completed={completed || undefined}
              key={step.anchor}
              style={{ "--review-color": step.color } as CSSProperties}
            >
              <button
                aria-current={active ? "step" : undefined}
                aria-label={`${stepNumber} ${step.title}，打开网页区域 ${step.anchor}`}
                className={styles.step}
                data-active={active || undefined}
                onClick={() => navigateToStep(index)}
                type="button"
              >
                <i aria-hidden="true" className={styles.node} />
                <span className={styles.number}>{stepNumber}</span>
                <span className={styles.anchor}>{step.anchor}</span>
                <strong>{step.title}</strong>
                <span className={styles.description}>{step.description}</span>
                <span aria-hidden="true" className={styles.open}>OPEN SECTION ↓</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div aria-live="polite" aria-atomic="true" className={styles.contextBar}>
        <div>
          <span>CURRENT CONTEXT</span>
          <strong>{activeStep.context}</strong>
        </div>
        <div>
          <span>LINKED ANCHOR</span>
          <strong className={styles.contextAnchor}>{activeStep.anchor}</strong>
        </div>
        <div>
          <span>CASE / SCORE / WEIGHT</span>
          <strong>{activeStep.meta}</strong>
        </div>
        <button aria-label={`查看当前网页区域：${activeStep.context}`} onClick={() => navigateToStep(activeIndex)} type="button">
          VIEW CONTEXT ↓
        </button>
      </div>
    </section>
  );
}
