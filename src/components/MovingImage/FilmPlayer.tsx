"use client";

import Image from "next/image";
import {
  type CSSProperties,
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { moonlitChapters, moonlitDuel } from "./moonlitDuel";
import { WORKFLOW_SEEK_EVENT, type WorkflowSeekDetail } from "./workflowData";
import styles from "./FilmPlayer.module.css";

type PlayerStatus = "idle" | "loading" | "ready" | "playing" | "paused" | "ended" | "error";

const wavePattern = [18, 34, 58, 42, 72, 48, 84, 38, 64, 52, 78, 30, 68, 88, 44, 74, 54, 82, 36, 62, 46, 76, 40, 66];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function getActiveChapter(time: number) {
  let active = 0;
  moonlitChapters.forEach((chapter, index) => {
    if (time >= chapter.time) active = index;
  });
  return active;
}

export function FilmPlayer() {
  const screenRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadPromiseRef = useRef<Promise<void> | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number>(moonlitDuel.duration);
  const [activeChapter, setActiveChapter] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.82);
  const [fullscreen, setFullscreen] = useState(false);
  const playing = status === "playing";
  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  const ensureMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return Promise.reject(new Error("播放器尚未准备好"));
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) return Promise.resolve();
    if (loadPromiseRef.current) return loadPromiseRef.current;

    setStatus("loading");
    loadPromiseRef.current = new Promise<void>((resolve, reject) => {
      const handleLoaded = () => {
        cleanup();
        setDuration(Number.isFinite(video.duration) ? video.duration : moonlitDuel.duration);
        setStatus("ready");
        resolve();
      };
      const handleError = () => {
        cleanup();
        loadPromiseRef.current = null;
        setStatus("error");
        reject(new Error("视频资源加载失败"));
      };
      const cleanup = () => {
        video.removeEventListener("loadedmetadata", handleLoaded);
        video.removeEventListener("error", handleError);
      };

      video.addEventListener("loadedmetadata", handleLoaded, { once: true });
      video.addEventListener("error", handleError, { once: true });
      video.src = moonlitDuel.source;
      video.volume = 0.82;
      video.load();
    });

    return loadPromiseRef.current;
  }, []);

  const togglePlayback = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      video.pause();
      return;
    }

    try {
      await ensureMetadata();
      await video.play();
    } catch {
      setStatus("error");
    }
  }, [ensureMetadata]);

  const seekTo = useCallback(async (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    try {
      await ensureMetadata();
      const nextTime = Math.min(Math.max(time, 0), video.duration || moonlitDuel.duration);
      video.currentTime = nextTime;
      setCurrentTime(nextTime);
      setActiveChapter(getActiveChapter(nextTime));
    } catch {
      setStatus("error");
    }
  }, [ensureMetadata]);

  const handleProgress = (event: ChangeEvent<HTMLInputElement>) => {
    void seekTo(Number(event.target.value));
  };

  const handleVolume = (event: ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    setMuted(nextVolume === 0);
    if (video) {
      video.volume = nextVolume;
      video.muted = nextVolume === 0;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    const nextMuted = !muted;
    setMuted(nextMuted);
    if (video) video.muted = nextMuted;
  };

  const replay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      await ensureMetadata();
      video.currentTime = 0;
      setCurrentTime(0);
      setActiveChapter(0);
      await video.play();
    } catch {
      setStatus("error");
    }
  }, [ensureMetadata]);

  const retry = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.removeAttribute("src");
    video.load();
    loadPromiseRef.current = null;
    setCurrentTime(0);
    setStatus("idle");
    await togglePlayback();
  }, [togglePlayback]);

  const toggleFullscreen = async () => {
    const screen = screenRef.current;
    const video = videoRef.current;
    if (!screen || !video) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (screen.requestFullscreen) {
        await screen.requestFullscreen();
      } else {
        const iosVideo = video as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
        iosVideo.webkitEnterFullscreen?.();
      }
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    const handleFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => document.removeEventListener("fullscreenchange", handleFullscreen);
  }, []);

  useEffect(() => {
    const handleWorkflowSeek = (event: Event) => {
      const { time } = (event as CustomEvent<WorkflowSeekDetail>).detail;
      void seekTo(time);
    };
    window.addEventListener(WORKFLOW_SEEK_EVENT, handleWorkflowSeek);
    return () => window.removeEventListener(WORKFLOW_SEEK_EVENT, handleWorkflowSeek);
  }, [seekTo]);

  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (!video) return;
      video.pause();
      video.removeAttribute("src");
      video.load();
      loadPromiseRef.current = null;
    };
  }, []);

  const playerStyle = { "--film-progress": progress } as CSSProperties;

  return (
    <div className={styles.player} id="moonlit-player" style={playerStyle}>
      <div className={styles.screen} data-muted={muted ? "true" : undefined} data-playing={playing ? "true" : undefined} ref={screenRef}>
        <div className={styles.mediaViewport}>
          <video
            aria-label="月下双刃漫剧视频"
            onCanPlay={() => setStatus((current) => current === "loading" ? "ready" : current)}
            onEnded={() => setStatus("ended")}
            onError={() => setStatus("error")}
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || moonlitDuel.duration)}
            onPause={() => setStatus((current) => current === "ended" ? current : "paused")}
            onPlay={() => setStatus("playing")}
            onPlaying={() => setStatus("playing")}
            onTimeUpdate={(event) => {
              const time = event.currentTarget.currentTime;
              setCurrentTime(time);
              setActiveChapter(getActiveChapter(time));
            }}
            onVolumeChange={(event) => {
              setMuted(event.currentTarget.muted || event.currentTarget.volume === 0);
              setVolume(event.currentTarget.volume);
            }}
            onWaiting={() => setStatus("loading")}
            playsInline
            poster={moonlitDuel.poster}
            preload="metadata"
            ref={videoRef}
          />

          <div aria-hidden="true" className={styles.screenFrame} />
          <div className={styles.screenMeta}><span>LIBTV × 即梦</span><span>FILM / 001</span></div>

          <button
            aria-label={playing ? "暂停《月下双刃》" : "播放《月下双刃》"}
            className={styles.centralControl}
            data-player-toggle
            onClick={togglePlayback}
            type="button"
          >
            <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
          </button>

          {status === "loading" ? <div aria-live="polite" className={styles.loading}>正在准备放映…</div> : null}
          {status === "error" ? (
            <div className={styles.error} role="alert">
              <p>视频暂时无法播放，请稍后重试。</p>
              <button onClick={() => void retry()} type="button">重新加载</button>
            </div>
          ) : null}
        </div>

        <div className={styles.controlDock}>
          <div aria-hidden="true" className={styles.waveform} data-muted={muted ? "true" : undefined} data-playing={playing ? "true" : undefined}>
            {wavePattern.map((height, index) => (
              <i
                key={`${height}-${index}`}
                style={{ "--wave-delay": `${index * -42}ms`, "--wave-height": `${height}%` } as CSSProperties}
              />
            ))}
          </div>

          <div className={styles.progressRow}>
            <time>{formatTime(currentTime)}</time>
            <input
              aria-label="播放进度"
              data-player-progress
              max={duration}
              min="0"
              onChange={handleProgress}
              step="0.01"
              style={{ "--range-progress": progress } as CSSProperties}
              type="range"
              value={currentTime}
            />
            <time>{formatTime(duration)}</time>
          </div>

          <div className={styles.buttonRow}>
            <button aria-label={playing ? "暂停" : "播放"} onClick={togglePlayback} type="button">{playing ? "暂停" : "播放"}</button>
            <button aria-label="重新播放" data-player-replay onClick={() => void replay()} type="button">重播</button>
            <div className={styles.volumeControl}>
              <button aria-label={muted ? "取消静音" : "静音"} data-player-mute onClick={toggleMute} type="button">{muted ? "静音" : "声音"}</button>
              <input aria-label="音量" max="1" min="0" onChange={handleVolume} step="0.05" type="range" value={muted ? 0 : volume} />
            </div>
            <button aria-label={fullscreen ? "退出全屏" : "进入全屏"} data-player-fullscreen onClick={() => void toggleFullscreen()} type="button">{fullscreen ? "退出全屏" : "全屏"}</button>
          </div>
        </div>
      </div>

      <section className={styles.chapters} aria-labelledby="chapter-heading">
        <header className={styles.chapterHeader}>
          <div><span>CHAPTER INDEX / 04</span><h2 id="chapter-heading">章节时间轴</h2></div>
          <p>选择一个真实画面，直接进入对应段落。</p>
        </header>
        <div className={styles.chapterRail}>
          {moonlitChapters.map((chapter, index) => (
            <button
              aria-current={activeChapter === index ? "step" : undefined}
              className={styles.chapter}
              data-active={activeChapter === index ? "true" : undefined}
              key={chapter.index}
              onClick={() => void seekTo(chapter.time)}
              type="button"
            >
              <span className={styles.chapterImage}>
                <Image alt={chapter.alt} fill loading="lazy" sizes="(max-width: 680px) 50vw, (max-width: 980px) 45vw, 22vw" src={chapter.image} />
              </span>
              <span className={styles.chapterCopy}><i>{chapter.index}</i><strong>{chapter.title}</strong><time>{chapter.timeLabel}</time></span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
