"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";

import styles from "./HomePage.module.css";

const collageNotes = [
  {
    alt: "暖色室内窗边的人物照片",
    detail: "暖调观察",
    dimension: "色调",
    href: "/visual-notes/#dimension-1",
    image: "/images/visual-notes/warm-balance.jpg",
  },
  {
    alt: "阴天海边候车亭与人物的负空间照片",
    detail: "负空间",
    dimension: "构图",
    href: "/visual-notes/#dimension-3",
    image: "/images/visual-notes/negative-space.jpg",
  },
  {
    alt: "由照片与色卡组成的编辑风格情绪板",
    detail: "编辑秩序",
    dimension: "风格",
    href: "/visual-notes/#dimension-7",
    image: "/images/visual-notes/editorial.jpg",
  },
] as const;

const AUTO_ADVANCE_MS = 2600;

export function VisualNotesEntranceCollage() {
  const collageRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(query.matches);

    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const collage = collageRef.current;
    if (!collage) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.3 },
    );

    observer.observe(collage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isPaused || !isInView || prefersReducedMotion) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % collageNotes.length);
    }, AUTO_ADVANCE_MS);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isInView, isPaused, prefersReducedMotion]);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || event.pointerType === "touch") return;
    const collage = collageRef.current;
    if (!collage) return;

    const bounds = collage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    collage.style.setProperty("--note-x-1", `${x * -12}px`);
    collage.style.setProperty("--note-y-1", `${y * -8}px`);
    collage.style.setProperty("--note-x-2", `${x * 9}px`);
    collage.style.setProperty("--note-y-2", `${y * 6}px`);
    collage.style.setProperty("--note-x-3", `${x * -5}px`);
    collage.style.setProperty("--note-y-3", `${y * 10}px`);
    collage.style.setProperty("--note-cursor-x", `${(x + 0.5) * 100}%`);
    collage.style.setProperty("--note-cursor-y", `${(y + 0.5) * 100}%`);
  };

  const resetPointer = () => {
    const collage = collageRef.current;
    if (!collage) return;

    for (const property of [
      "--note-x-1",
      "--note-y-1",
      "--note-x-2",
      "--note-y-2",
      "--note-x-3",
      "--note-y-3",
    ]) {
      collage.style.setProperty(property, "0px");
    }
    collage.style.setProperty("--note-cursor-x", "50%");
    collage.style.setProperty("--note-cursor-y", "50%");
    setIsPaused(false);
  };

  const activeNote = collageNotes[activeIndex];

  return (
    <div
      className={styles.collage}
      data-active={activeIndex + 1}
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={resetPointer}
      onPointerMove={handlePointerMove}
      ref={collageRef}
    >
      <div className={styles.collageHud} aria-hidden="true">
        <span>OBSERVATION MODE</span>
        <i>LIVE / 03</i>
      </div>

      {collageNotes.map((note, index) => (
        <button
          aria-label={`预览${note.dimension}笔记：${note.detail}`}
          aria-pressed={activeIndex === index}
          className={styles.collageCard}
          data-active={activeIndex === index}
          key={note.dimension}
          onPointerEnter={() => setActiveIndex(index)}
          onClick={() => {
            setActiveIndex(index);
            setIsPaused(true);
          }}
          onFocus={() => {
            setActiveIndex(index);
            setIsPaused(true);
          }}
          type="button"
        >
          <Image
            alt={note.alt}
            fill
            sizes="(max-width: 680px) 72vw, (max-width: 980px) 52vw, 32vw"
            src={note.image}
          />
          <span>{String(index + 1).padStart(2, "0")} / {note.dimension}</span>
        </button>
      ))}

      <span className={styles.collageCrosshair} aria-hidden="true"><i /></span>
      <div aria-atomic="true" aria-live={isPaused ? "polite" : "off"} className={styles.collageMeta}>
        <span>{String(activeIndex + 1).padStart(2, "0")} / 03</span>
        <strong>{activeNote.dimension}</strong>
        <small>{activeNote.detail}</small>
        <Link data-transition href={activeNote.href}>查看该笔记 ↗</Link>
      </div>
      <div className={styles.collageRail} aria-hidden="true">
        {collageNotes.map((note, index) => <i data-active={activeIndex === index} key={note.dimension} />)}
      </div>
    </div>
  );
}
