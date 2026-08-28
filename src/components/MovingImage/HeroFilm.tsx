"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useRef, useState } from "react";

import { moonlitDuel } from "./moonlitDuel";
import styles from "./HeroFilm.module.css";

const wavePattern = [32, 58, 44, 76, 52, 88, 38, 68, 48, 82, 56, 72, 42, 64, 36, 78, 50, 66];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export function HeroFilm() {
  const coverRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const shouldPlayRef = useRef(true);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number>(moonlitDuel.duration);
  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;
  const [inViewport, setInViewport] = useState(true);
  const waveActive = playing && pageVisible && inViewport;

  useEffect(() => {
    const video = videoRef.current;
    const cover = coverRef.current;
    if (!video || !cover) return;

    const startPlayback = () => {
      void video.play().then(() => setFailed(false)).catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFailed(true);
      });
    };

    const handleVisibility = () => {
      const visible = !document.hidden;
      setPageVisible(visible);
      shouldPlayRef.current = visible && inViewportState;
      if (shouldPlayRef.current) startPlayback();
      else video.pause();
    };

    let inViewportState = true;
    const observer = new IntersectionObserver(([entry]) => {
      inViewportState = entry.isIntersecting && entry.intersectionRatio >= 0.2;
      setInViewport(inViewportState);
      shouldPlayRef.current = inViewportState && !document.hidden;
      if (shouldPlayRef.current) startPlayback();
      else video.pause();
    }, { threshold: [0, 0.2, 0.6] });

    observer.observe(cover);
    document.addEventListener("visibilitychange", handleVisibility);
    const animationFrame = window.requestAnimationFrame(handleVisibility);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      video.pause();
    };
  }, []);

  return (
    <div className={styles.cover} data-hero-film data-in-viewport={inViewport ? "true" : undefined} data-video-failed={failed ? "true" : undefined} ref={coverRef} style={{ "--cover-progress": progress } as CSSProperties}>
      <div className={styles.frame}>
        <Image
          alt="月下双刃中两名剑客在月夜持刃对峙"
          className={styles.poster}
          fill
          priority
          sizes="(max-width: 1020px) 100vw, 64vw"
          src={moonlitDuel.poster}
        />
        <video
          aria-label="月下双刃漫剧封面视频"
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
        />

        <div aria-hidden="true" className={styles.scanlines} />
        <div aria-hidden="true" className={styles.vignette} />

        <div className={styles.topMeta}>
          <span className={styles.rec}><i aria-hidden="true" /> REC</span>
          <span>LIBTV × 即梦&nbsp;&nbsp; / &nbsp;&nbsp;FILM / 001</span>
        </div>

        <div className={styles.playbackInfo}>
          <div className={styles.statusRow}>
            <div aria-hidden="true" className={styles.wave} data-hero-wave data-playing={waveActive ? "true" : undefined}>
              {wavePattern.map((height, index) => (
                <i key={index} style={{ "--wave-height": `${height}%`, "--wave-delay": `${index * -48}ms` } as CSSProperties} />
              ))}
            </div>
            <div className={styles.progress} data-hero-progress><i /></div>
            <div className={styles.timecode}><time>{formatTime(currentTime)}</time><span>/</span><time>{formatTime(duration)}</time></div>
          </div>
          <span className={styles.playState}>{waveActive ? "PLAYING / MUTED" : "PAUSED / MUTED"}</span>
        </div>
      </div>

      <dl className={styles.filmInfo}>
        <div><dt>TITLE</dt><dd>月下双刃</dd></div>
        <div><dt>FORMAT</dt><dd>1920 × 1080</dd></div>
        <div><dt>DURATION</dt><dd>01:00</dd></div>
        <div><dt>TYPE</dt><dd>AI 漫剧</dd></div>
      </dl>
    </div>
  );
}
