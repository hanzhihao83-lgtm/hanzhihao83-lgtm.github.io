"use client";

import Image from "next/image";
import { useState } from "react";

import type { VisualComparison } from "@/types/content";

import styles from "./VisualNotesArchive.module.css";

interface VisualComparisonLabProps {
  dimension: string;
  question: string;
  comparisons: VisualComparison[];
}

export function VisualComparisonLab({ dimension, question, comparisons }: VisualComparisonLabProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section className={styles.comparisonLab} aria-label={`${dimension}视觉对比`}>
      <header className={styles.comparisonHead}>
        <div><span>COMPARE / 03</span><i>点击照片查看答案</i></div>
        <h4>{question}</h4>
      </header>

      <div className={styles.comparisonGrid}>
        {comparisons.map((comparison, index) => {
          const isActive = activeId === comparison.id;
          return (
            <button
              aria-pressed={isActive}
              className={styles.comparisonCard}
              data-active={isActive || undefined}
              key={comparison.id}
              onClick={() => setActiveId((current) => current === comparison.id ? null : comparison.id)}
              type="button"
            >
              <span className={styles.sampleIndex}>SAMPLE {String.fromCharCode(65 + index)}</span>
              <span className={styles.comparisonImage}>
                <Image alt={comparison.alt} fill sizes="(max-width: 800px) 78vw, 25vw" src={comparison.image} />
              </span>
              <span className={styles.comparisonAnswer} aria-live="polite">
                <i>{isActive ? "ANSWER / REVEALED" : "ANSWER / HIDDEN"}</i>
                <strong>{isActive ? comparison.label : "点击观察"}</strong>
                <small>{isActive ? comparison.observation : "先看主体、空间、光线和画面关系。"}</small>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
