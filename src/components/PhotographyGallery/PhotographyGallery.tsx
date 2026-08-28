"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { photoCategories, photographs } from "@/data/photography";
import type { Photograph } from "@/types/content";

import styles from "./PhotographyGallery.module.css";

export function PhotographyGallery() {
  const [filter, setFilter] = useState<(typeof photoCategories)[number]>("全部");
  const [activeId, setActiveId] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const pointerStartRef = useRef<number | null>(null);
  const filtered = useMemo(() => filter === "全部" ? photographs : photographs.filter((photo) => photo.category === filter), [filter]);
  const activeIndex = activeId ? photographs.findIndex((photo) => photo.id === activeId) : -1;
  const activePhoto: Photograph | null = activeIndex >= 0 ? photographs[activeIndex] : null;

  const openLightbox = (photo: Photograph) => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setActiveId(photo.id);
  };

  const closeLightbox = useCallback(() => {
    setActiveId(null);
    window.requestAnimationFrame(() => previousFocusRef.current?.focus());
  }, []);

  const move = useCallback((direction: 1 | -1) => {
    if (activeIndex < 0) return;
    const nextIndex = (activeIndex + direction + photographs.length) % photographs.length;
    setActiveId(photographs[nextIndex].id);
  }, [activeIndex]);

  useEffect(() => {
    if (!activePhoto) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "Tab") {
        const controls = document.querySelectorAll<HTMLElement>("[data-lightbox-control]");
        if (controls.length === 0) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activePhoto, closeLightbox, move]);

  useEffect(() => {
    const frames = sheetRef.current?.querySelectorAll<HTMLElement>("[data-photo-frame]");
    if (!frames?.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frames.forEach((frame) => { frame.dataset.visible = "true"; });
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.visible = "true";
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.12 });
    frames.forEach((frame) => observer.observe(frame));
    return () => observer.disconnect();
  }, [filtered]);

  const finishSwipe = (clientX: number) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (start === null || Math.abs(clientX - start) < 48) return;
    move(clientX < start ? 1 : -1);
  };

  return (
    <>
      <section className={styles.archiveHeader}>
        <div><span>01 / INDEX</span><h2>观看索引</h2></div>
        <p>选择一个分类，或沿着整组画面继续向下观看。</p>
      </section>

      <div className={styles.filters} aria-label="摄影作品筛选">
        {photoCategories.map((category) => (
          <button aria-pressed={filter === category} key={category} onClick={() => setFilter(category)} type="button">{category}<span>{String(category === "全部" ? photographs.length : photographs.filter((photo) => photo.category === category).length).padStart(2, "0")}</span></button>
        ))}
      </div>

      <div aria-live="polite" className={styles.sheet} ref={sheetRef}>
        {filtered.map((photo, index) => (
          <article className={styles.frame} data-orientation={photo.height > photo.width ? "portrait" : "landscape"} data-photo-frame key={photo.id} style={{ "--reveal-delay": `${Math.min(index, 3) * 70}ms` } as React.CSSProperties}>
            <button aria-label={`查看 ${photo.title}`} onClick={() => openLightbox(photo)} type="button">
              <Image alt={photo.alt} height={photo.height} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" src={photo.image} width={photo.width} />
              <span className={styles.viewLabel}>VIEW FRAME ↗</span>
            </button>
            <div className={styles.frameMeta}><span>{photo.index}</span><h2>{photo.title}</h2><p>{photo.category} · {photo.location} · {photo.year}</p></div>
          </article>
        ))}
      </div>

      <aside className={styles.interlude}><span>OBSERVATION / 05</span><p>光线不会停留，<br />照片替它保存片刻。</p></aside>

      <div className={styles.lightbox} data-open={activePhoto ? "true" : undefined}>
        {activePhoto ? (
          <div aria-label={`${activePhoto.title} 图片查看器`} aria-modal="true" className={styles.dialog} role="dialog">
            <div className={styles.lightboxImage} onPointerDown={(event) => { pointerStartRef.current = event.clientX; }} onPointerUp={(event) => finishSwipe(event.clientX)}><Image alt={activePhoto.alt} fill priority sizes="95vw" src={activePhoto.image} /></div>
            <div className={styles.lightboxMeta}><span>{activePhoto.index} / {String(photographs.length).padStart(2, "0")}</span><div><h2>{activePhoto.title}</h2><p>{activePhoto.description}</p></div><p>{activePhoto.category} · {activePhoto.location} · {activePhoto.year}</p></div>
            <button aria-label="上一张" className={styles.previous} data-lightbox-control onClick={() => move(-1)} type="button">←</button>
            <button aria-label="下一张" className={styles.next} data-lightbox-control onClick={() => move(1)} type="button">→</button>
            <button aria-label="关闭图片查看器" className={styles.close} data-lightbox-control onClick={closeLightbox} ref={closeRef} type="button">×</button>
          </div>
        ) : null}
      </div>
    </>
  );
}
