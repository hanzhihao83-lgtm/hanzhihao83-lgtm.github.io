"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { moonlitChapters } from "./moonlitDuel";
import styles from "./FrameArchive.module.css";

export function FrameArchive() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const open = activeIndex !== null;

  const showFrame = (index: number) => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setActiveIndex(index);
  };

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => current === null ? null : (current - 1 + moonlitChapters.length) % moonlitChapters.length);
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) => current === null ? null : (current + 1) % moonlitChapters.length);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [open]);

  const activeFrame = activeIndex === null ? null : moonlitChapters[activeIndex];

  return (
    <section className={styles.archive} aria-labelledby="frame-archive-heading">
      <header className={styles.header}>
        <div><span>FRAME ARCHIVE / 04</span><h2 id="frame-archive-heading">关键帧档案</h2></div>
        <p>从原片中抽取的四个叙事节点。点击画面进入大图，使用方向键继续浏览。</p>
      </header>

      <div className={styles.grid}>
        {moonlitChapters.map((frame, index) => (
          <button aria-label={`查看大图：${frame.title}`} className={styles.frame} key={frame.index} onClick={() => showFrame(index)} type="button">
            <span className={styles.image}><Image alt={frame.alt} fill loading="lazy" sizes="(max-width: 680px) 100vw, 58vw" src={frame.image} /></span>
            <span className={styles.caption}><i>{frame.index}</i><strong>{frame.title}</strong><time>{frame.timeLabel}</time></span>
          </button>
        ))}
      </div>

      {activeFrame && activeIndex !== null ? (
        <div className={styles.lightbox}>
          <button aria-label="关闭大图" className={styles.backdrop} onClick={() => setActiveIndex(null)} type="button" />
          <div aria-label={`${activeFrame.title}大图`} aria-modal="true" className={styles.dialog} role="dialog">
            <header><span>FRAME / {activeFrame.index}</span><strong>{activeFrame.title}</strong><time>{activeFrame.timeLabel}</time></header>
            <div className={styles.fullImage}><Image alt={activeFrame.alt} fill priority sizes="100vw" src={activeFrame.image} /></div>
            <div className={styles.dialogControls}>
              <button aria-label="上一张" onClick={() => setActiveIndex((activeIndex - 1 + moonlitChapters.length) % moonlitChapters.length)} type="button">← 上一张</button>
              <span>{String(activeIndex + 1).padStart(2, "0")} / 04</span>
              <button aria-label="下一张" onClick={() => setActiveIndex((activeIndex + 1) % moonlitChapters.length)} type="button">下一张 →</button>
            </div>
            <button aria-label="关闭大图" className={styles.close} onClick={() => setActiveIndex(null)} ref={closeButtonRef} type="button">×</button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
