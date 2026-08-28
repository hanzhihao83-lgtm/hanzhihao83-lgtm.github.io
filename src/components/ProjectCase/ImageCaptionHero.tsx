"use client";

import Image from "next/image";
import {
  type CSSProperties,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

import styles from "./ImageCaptionHero.module.css";

interface HeroAnchor {
  label: string;
  x: number;
  y: number;
}

interface HeroCase {
  id: string;
  title: string;
  image: string;
  task: string;
  subject: string;
  detail: string;
  relation: string;
  style: string;
  caption: string;
  anchors: HeroAnchor[];
}

const heroCases: HeroCase[] = [
  {
    id: "IC-01",
    title: "雨后车站",
    image: "/images/projects/project-03/caption-station-rain.jpg",
    task: "SCENE / RELATION",
    subject: "撑伞男子 · 通勤列车",
    detail: "透明雨伞 · 黑色背包",
    relation: "列车经过男子前方",
    style: "蓝调时刻 · 雨后反射",
    caption: "雨后的站台上，撑伞男子注视着从面前经过的银色列车。",
    anchors: [
      { label: "SUBJECT", x: 53, y: 42 },
      { label: "TRAIN", x: 73, y: 49 },
      { label: "BAG", x: 61, y: 68 },
    ],
  },
  {
    id: "IC-02",
    title: "桌面静物",
    image: "/images/projects/project-03/caption-desk-still-life.jpg",
    task: "OBJECT / ATTRIBUTE",
    subject: "陶瓷杯 · 书本 · 相机",
    detail: "红色 · 黄色 · 黑色",
    relation: "杯子位于书本左侧",
    style: "夕阳侧光 · 暖色静物",
    caption: "夕阳照亮桌面，红色陶瓷杯位于黄色书本左侧。",
    anchors: [
      { label: "RED MUG", x: 29, y: 61 },
      { label: "BOOK", x: 69, y: 72 },
      { label: "CAMERA", x: 46, y: 50 },
    ],
  },
  {
    id: "IC-03",
    title: "街头市场",
    image: "/images/projects/project-03/caption-market-relations.jpg",
    task: "ACTION / MULTI-SUBJECT",
    subject: "摊主 · 两位顾客",
    detail: "纸袋 · 帆布包 · 橙子",
    relation: "摊主向顾客递交纸袋",
    style: "街头纪实 · 自然光",
    caption: "市场摊主把纸袋递给顾客，另一位顾客正在右侧挑选橙子。",
    anchors: [
      { label: "HANDOVER", x: 47, y: 31 },
      { label: "CUSTOMER", x: 60, y: 47 },
      { label: "ORANGES", x: 78, y: 47 },
    ],
  },
  {
    id: "IC-04",
    title: "玻璃后的阅读者",
    image: "/images/projects/project-03/caption-cafe-reflection.jpg",
    task: "REFLECTION / OCCLUSION",
    subject: "阅读女性 · 公交车倒影",
    detail: "蓝色杯子 · 米色围巾",
    relation: "室外倒影叠加于人物前方",
    style: "冷暖交叠 · 玻璃反射",
    caption: "女性在咖啡馆窗边阅读，红色公交车的倒影掠过玻璃。",
    anchors: [
      { label: "READER", x: 73, y: 48 },
      { label: "REFLECTION", x: 25, y: 45 },
      { label: "CUP", x: 51, y: 66 },
    ],
  },
];

const subscribeToReducedMotion = (onStoreChange: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
};

const getReducedMotionSnapshot = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getReducedMotionServerSnapshot = () => false;

function anchorStyle(anchor: HeroAnchor) {
  return {
    "--hero-anchor-x": `${anchor.x}%`,
    "--hero-anchor-y": `${anchor.y}%`,
  } as CSSProperties;
}

export function ImageCaptionHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const activeCase = heroCases[activeIndex];

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroCases.length);
    }, 4800);

    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion]);

  return (
    <section
      aria-label="结构化图片描述动态演示"
      className={styles.console}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
      }}
      onFocus={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={styles.topbar}>
        <span>CAPTION ENGINE / 04</span>
        <p><i aria-hidden="true" />{isPaused ? "INSPECT" : "AUTO SCAN"}</p>
        <strong>{activeCase.id}</strong>
      </div>

      <div className={styles.stage}>
        {heroCases.map((item, index) => (
          <div
            aria-hidden={index !== activeIndex}
            className={styles.frame}
            data-active={index === activeIndex ? "true" : "false"}
            key={item.id}
          >
            <Image
              alt={index === activeIndex ? `${item.title}：${item.caption}` : ""}
              fill
              loading={index === 0 ? undefined : "eager"}
              preload={index === 0}
              sizes="(max-width: 850px) calc(100vw - 2.2rem), 58vw"
              src={item.image}
            />
          </div>
        ))}

        <div aria-hidden="true" className={styles.grid} />
        <div aria-hidden="true" className={styles.vignette} />
        <div aria-hidden="true" className={styles.cornerMarks} />

        <div aria-hidden="true" className={styles.analysisLayer} key={activeCase.id}>
          <span className={styles.scanLine} />
          {activeCase.anchors.map((anchor, index) => (
            <span
              className={styles.anchor}
              key={anchor.label}
              style={{ ...anchorStyle(anchor), "--anchor-delay": `${index * 90}ms` } as CSSProperties}
            >
              <i />
              <b>{anchor.label}</b>
            </span>
          ))}
        </div>

        <div className={styles.caseLabel} key={`${activeCase.id}-label`}>
          <span>{activeCase.task}</span>
          <strong>{activeCase.title}</strong>
        </div>

        <div aria-live="polite" className={styles.fieldRail} key={`${activeCase.id}-fields`}>
          <div><span>SUBJECT / 01</span><p>{activeCase.subject}</p></div>
          <div><span>DETAIL / 02</span><p>{activeCase.detail}</p></div>
          <div><span>RELATION / 03</span><p>{activeCase.relation}</p></div>
          <div className={styles.captionField}><span>CAPTION STRUCTURE</span><p>{activeCase.caption}</p></div>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.caseNav} aria-label="选择图片案例">
          {heroCases.map((item, index) => (
            <button
              aria-label={`显示 ${item.id} ${item.title}`}
              aria-pressed={index === activeIndex}
              key={item.id}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <i />
            </button>
          ))}
        </div>
        <div className={styles.progress} key={`${activeCase.id}-progress`}>
          <i />
        </div>
        <p>{activeCase.style}</p>
      </footer>
    </section>
  );
}
