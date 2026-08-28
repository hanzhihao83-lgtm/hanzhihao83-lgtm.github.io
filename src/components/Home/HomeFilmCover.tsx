"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useRef, useState } from "react";

import { moonlitDuel } from "@/components/MovingImage/moonlitDuel";

import styles from "./HomeFilmCover.module.css";

const wavePattern = [42, 70, 52, 88, 58, 76, 46, 82, 60, 92, 50, 72];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export function HomeFilmCover() {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const shouldPlayRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number>(moonlitDuel.duration);
  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  useEffect(() => {
    const frame = frameRef.current;
    const video = videoRef.current;
    if (!frame || !video) return;

    let isIntersecting = false;

    const startPlayback = () => {
      void video.play().then(() => setFailed(false)).catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFailed(true);
      });
    };

    const syncPlayback = () => {
      shouldPlayRef.current = isIntersecting && !document.hidden;
      if (shouldPlayRef.current) startPlayback();
      else video.pause();
    };

    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting && entry.intersectionRatio >= 0.35;
      syncPlayback();
    }, { threshold: [0, 0.35, 0.7] });

    observer.observe(frame);
    document.addEventListener("visibilitychange", syncPlayback);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, []);

  return (
    <div
      className={styles.frame}
      data-film-failed={failed ? "true" : undefined}
      ref={frameRef}
      style={{ "--film-progress": progress } as CSSProperties}
    >
      <Image
        alt=""
        className={styles.poster}
        fill
        sizes="(max-width: 980px) calc(100vw - 3rem), 55vw"
        src={moonlitDuel.poster}
      />
      <video
        aria-hidden="true"
        autoPlay
        className={styles.video}
        data-ready={ready && !failed ? "true" : undefined}
        loop
        muted
        onCanPlay={(event) => {
          setReady(true);
          if (shouldPlayRef.current) {
            void event.currentTarget.play().then(() => setFailed(false)).catch(() => setFailed(true));
          }
        }}
        onDurationChange={(event) => setDuration(event.currentTarget.duration || moonlitDuel.duration)}
        onError={() => setFailed(true)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || moonlitDuel.duration)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onPlaying={() => {
          if (!shouldPlayRef.current) {
            videoRef.current?.pause();
            return;
          }
          setFailed(false);
          setPlaying(true);
          setReady(true);
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        playsInline
        poster={moonlitDuel.poster}
        preload="metadata"
        ref={videoRef}
        src={moonlitDuel.source}
        tabIndex={-1}
      />

      <div aria-hidden="true" className={styles.scanlines} />
      <div aria-hidden="true" className={styles.vignette} />

      <div aria-hidden="true" className={styles.topMeta}>
        <span className={styles.recording}><i /> REC</span>
        <span>LIBTV × 即梦&nbsp;&nbsp;/&nbsp;&nbsp;FILM / 001</span>
      </div>

      <div aria-hidden="true" className={styles.playback}>
        <div className={styles.playbackTitle}>
          <span>NOW SCREENING</span>
          <strong>月下双刃</strong>
        </div>
        <div className={styles.statusRow}>
          <div className={styles.wave} data-playing={playing ? "true" : undefined}>
            {wavePattern.map((height, index) => (
              <i
                key={index}
                style={{ "--wave-height": `${height}%`, "--wave-delay": `${index * -54}ms` } as CSSProperties}
              />
            ))}
          </div>
          <div className={styles.progress}><i /></div>
          <time>{formatTime(currentTime)} / {formatTime(duration)}</time>
        </div>
        <span className={styles.playState}>{playing ? "PLAYING / MUTED" : "READY / MUTED"}</span>
      </div>
    </div>
  );
}
