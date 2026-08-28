"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { EvaluationDimension } from "@/types/evaluation";

import styles from "./EvaluationConclusion.module.css";

export interface EvaluationConclusionDimension {
  caseId: string;
  color: string;
  id: EvaluationDimension["id"];
  name: string;
  observation: string;
  score: number;
  weight: number;
}

interface EvaluationConclusionProps {
  className?: string;
  dimensions: EvaluationConclusionDimension[];
  overallScore: number;
  percentage: number;
  rating: string;
  sampleSizePerDimension: number;
}

const SCAN_INTERVAL = 2600;

const strengths: Array<{ dimension: EvaluationDimension["id"]; text: string }> = [
  { dimension: "instruction-following", text: "中文台词、主体与关键场景指令基本落实" },
  { dimension: "motion-quality", text: "人物主体运动连续，主要动作可辨识" },
  { dimension: "visual-quality", text: "整体构图、色彩氛围与光影表现稳定" },
  { dimension: "audio-visual-sync", text: "主要环境声与画面事件基本对应" },
];

const issues: Array<{ dimension: EvaluationDimension["id"]; text: string }> = [
  { dimension: "motion-quality", text: "复杂动作在短时长内衔接略显压缩" },
  { dimension: "visual-quality", text: "近景与关键材质细节覆盖有限" },
  { dimension: "temporal-consistency", text: "透明雨伞结构出现漂移，是最明显短板" },
  { dimension: "audio-visual-sync", text: "局部声音事件的时间线与空间方向存在偏差" },
];

function dimensionCode(caseId: string) {
  return caseId.split("-")[0];
}

export function EvaluationConclusion({
  className,
  dimensions,
  overallScore,
  percentage,
  rating,
  sampleSizePerDimension,
}: EvaluationConclusionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cycleVersion, setCycleVersion] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isPointerInside, setIsPointerInside] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const activeDimension = dimensions[activeIndex] ?? dimensions[0];
  const videoCount = dimensions.length * sampleSizePerDimension;
  const dimensionLookup = useMemo(
    () => new Map(dimensions.map((dimension) => [dimension.id, dimension])),
    [dimensions],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), {
      rootMargin: "-12% 0px -18% 0px",
      threshold: 0.08,
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      setIsReducedMotion(motionQuery.matches);
      if (motionQuery.matches) setActiveIndex(0);
    };
    updateMotionPreference();
    motionQuery.addEventListener("change", updateMotionPreference);
    return () => motionQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (!dimensions.length || !isInView || isPointerInside || isReducedMotion) return;
    const timer = window.setTimeout(
      () => setActiveIndex((current) => (current + 1) % dimensions.length),
      SCAN_INTERVAL,
    );
    return () => window.clearTimeout(timer);
  }, [activeIndex, cycleVersion, dimensions.length, isInView, isPointerInside, isReducedMotion]);

  if (!activeDimension) return null;

  return (
    <section
      aria-labelledby="conclusion-title"
      className={[className, styles.root].filter(Boolean).join(" ")}
      id="conclusion"
      onMouseEnter={() => setIsPointerInside(true)}
      onMouseLeave={() => setIsPointerInside(false)}
      ref={sectionRef}
      style={{ "--conclusion-accent": activeDimension.color } as CSSProperties}
    >
      <header className={styles.heading}>
        <span>07 / EVALUATION CONCLUSION</span>
        <h2 id="conclusion-title"><span>结论来自案例，</span><span>不越过样本边界。</span></h2>
        <p>结论来自五个代表案例，仅展示评测方法和当前样本表现，不构成正式产品排名。</p>
      </header>

      <div className={styles.verdict}>
        <div className={styles.scoreBlock}>
          <span>OVERALL / WEIGHTED</span>
          <div className={styles.scoreValue}>
            <strong>{overallScore.toFixed(2)}</strong><i>/ 5</i><em>{percentage}%</em>
          </div>
          <p><i aria-hidden="true" />STATUS <strong>{rating}</strong></p>
        </div>
        <div className={styles.verdictCopy}>
          <div>
            <span>OBSERVED VERDICT</span>
            <h3>整体达到<span>基本可用</span>，<br />主要风险集中在时序一致性。</h3>
          </div>
          <p>样本边界：每个维度 {sampleSizePerDimension} 条代表案例，共 {videoCount} 条视频。结果仅说明当前案例表现。</p>
          <i aria-hidden="true" className={styles.reticle}><span /></i>
        </div>
      </div>

      <div className={styles.findings}>
        <article>
          <header><h3>主要优势</h3><span>OBSERVED / STRENGTHS · 04</span></header>
          <ol>
            {strengths.map((item, index) => {
              const dimension = dimensionLookup.get(item.dimension);
              return (
                <li data-active={item.dimension === activeDimension.id || undefined} key={item.text}>
                  <i>{String(index + 1).padStart(2, "0")}</i>
                  <span>{item.text}</span>
                  <em>{dimension ? `${dimensionCode(dimension.caseId)} / ${dimension.score.toFixed(1)}` : "—"}</em>
                </li>
              );
            })}
          </ol>
        </article>
        <article>
          <header><h3>主要问题</h3><span>OBSERVED / ISSUES · 04</span></header>
          <ol>
            {issues.map((item, index) => {
              const dimension = dimensionLookup.get(item.dimension);
              return (
                <li data-active={item.dimension === activeDimension.id || undefined} key={item.text}>
                  <i>{String(index + 1).padStart(2, "0")}</i>
                  <span>{item.text}</span>
                  <em>{dimension?.caseId ?? "—"}</em>
                </li>
              );
            })}
          </ol>
        </article>
      </div>

      <div className={styles.scanner}>
        <div aria-label="选择评测维度查看结论依据" className={styles.dimensions} role="group">
          {dimensions.map((dimension, index) => {
            const selected = index === activeIndex;
            return (
              <button
                aria-label={`查看${dimension.name}结论，评分 ${dimension.score.toFixed(1)}，权重 ${Math.round(dimension.weight * 100)}%，案例 ${dimension.caseId}`}
                aria-pressed={selected}
                key={dimension.id}
                onClick={() => {
                  setActiveIndex(index);
                  setCycleVersion((current) => current + 1);
                }}
                style={{
                  "--dimension-color": dimension.color,
                  "--dimension-progress": `${(dimension.score / 5) * 100}%`,
                } as CSSProperties}
                type="button"
              >
                <i aria-hidden="true" />
                <span>{dimension.name}</span>
                <strong>{dimension.score.toFixed(1)}</strong>
                <em>{Math.round(dimension.weight * 100)}%</em>
                <small>{dimension.caseId}</small>
              </button>
            );
          })}
        </div>
        <div aria-atomic="true" aria-live="polite" className={styles.liveStatus}>
          <strong>SCAN / {activeDimension.caseId} · {activeDimension.name}</strong>
          <span>{activeDimension.observation}</span>
        </div>
      </div>
    </section>
  );
}
