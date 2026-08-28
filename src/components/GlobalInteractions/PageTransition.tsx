"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import styles from "./PageTransition.module.css";

type TransitionPhase =
  | "idle"
  | "press"
  | "closing"
  | "loading"
  | "revealing"
  | "reduced-cover"
  | "reduced-reveal";

interface ProjectTransitionData {
  index: string;
  title: string;
  accent: string;
  href: string;
  pathname: string;
}

const subscribeToReducedMotion = (onStoreChange: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
};

const getReducedMotionSnapshot = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getReducedMotionServerSnapshot = () => false;

function normalizePathname(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

function formatProgress(value: number) {
  return String(Math.min(100, Math.max(0, value))).padStart(3, "0");
}

export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [project, setProject] = useState<ProjectTransitionData | null>(null);
  const [progress, setProgress] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const activeRef = useRef(false);
  const prefersReducedMotionRef = useRef(prefersReducedMotion);
  const reducedTransitionRef = useRef(false);
  const expectedPathRef = useRef("");
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null);
  const timersRef = useRef<Set<number>>(new Set());
  const progressFrameRef = useRef(0);
  const previousOverflowRef = useRef({ body: "", html: "" });
  const prefetchedRoutesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    prefersReducedMotionRef.current = prefersReducedMotion;
  }, [prefersReducedMotion]);

  const clearScheduledWork = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current.clear();
    window.cancelAnimationFrame(progressFrameRef.current);
    progressFrameRef.current = 0;
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timersRef.current.delete(timer);
      callback();
    }, delay);
    timersRef.current.add(timer);
    return timer;
  }, []);

  const lockScroll = useCallback(() => {
    previousOverflowRef.current = {
      body: document.body.style.overflow,
      html: document.documentElement.style.overflow,
    };
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }, []);

  const restoreDocument = useCallback(() => {
    document.body.style.overflow = previousOverflowRef.current.body;
    document.documentElement.style.overflow = previousOverflowRef.current.html;
    document.getElementById("main-content")?.removeAttribute("data-project-reveal");
    activeLinkRef.current?.removeAttribute("data-transition-state");
    activeLinkRef.current = null;
  }, []);

  const resetTransition = useCallback(() => {
    clearScheduledWork();
    restoreDocument();
    activeRef.current = false;
    expectedPathRef.current = "";
    reducedTransitionRef.current = false;
    setPhase("idle");
    setProject(null);
    setProgress(0);
    setAnnouncement("");
  }, [clearScheduledWork, restoreDocument]);

  const startProgress = useCallback(() => {
    window.cancelAnimationFrame(progressFrameRef.current);
    const startedAt = performance.now();
    const duration = 550;

    const update = (now: number) => {
      const elapsed = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - (1 - elapsed) ** 3;
      setProgress(Math.round(eased * 100));
      if (elapsed < 1) progressFrameRef.current = window.requestAnimationFrame(update);
      else progressFrameRef.current = 0;
    };

    setProgress(0);
    progressFrameRef.current = window.requestAnimationFrame(update);
  }, []);

  useEffect(() => {
    const expectedPath = expectedPathRef.current;
    if (!activeRef.current || !expectedPath) return;
    if (normalizePathname(pathname) !== expectedPath) return;

    window.scrollTo(0, 0);
    const main = document.getElementById("main-content");
    const reduced = reducedTransitionRef.current;
    main?.setAttribute("data-project-reveal", reduced ? "reduced" : "full");
    setPhase(reduced ? "reduced-reveal" : "revealing");
    schedule(resetTransition, reduced ? 75 : 500);
  }, [pathname, resetTransition, schedule]);

  useEffect(() => {
    const prefetchProject = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null;
      const anchor = element?.closest<HTMLAnchorElement>("a[data-project-transition]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || prefetchedRoutesRef.current.has(href)) return;
      prefetchedRoutesRef.current.add(href);
      router.prefetch(href);
    };

    const startProjectTransition = (event: MouseEvent) => {
      const element = event.target instanceof Element ? event.target : null;
      const anchor = element?.closest<HTMLAnchorElement>("a[data-project-transition]");
      if (!anchor) return;
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) return;

      event.preventDefault();
      event.stopPropagation();
      if (activeRef.current) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const index = anchor.dataset.projectIndex;
      const title = anchor.dataset.projectTitle;
      const accent = anchor.dataset.projectAccent;
      if (!index || !title || !accent) return;

      const href = `${url.pathname}${url.search}${url.hash}`;
      const transitionData: ProjectTransitionData = {
        index,
        title,
        accent,
        href,
        pathname: normalizePathname(url.pathname),
      };

      activeRef.current = true;
      const reduced = prefersReducedMotionRef.current;
      reducedTransitionRef.current = reduced;
      expectedPathRef.current = transitionData.pathname;
      activeLinkRef.current = anchor;
      anchor.setAttribute("data-transition-state", "pressed");
      setProject(transitionData);
      setProgress(0);
      setAnnouncement(`正在打开${title}项目`);
      lockScroll();
      router.prefetch(href);

      if (reduced) {
        setPhase("reduced-cover");
        schedule(() => router.push(href), 75);
      } else {
        setPhase("press");
        schedule(() => setPhase("closing"), 120);
        schedule(() => {
          setPhase("loading");
          startProgress();
        }, 500);
        schedule(() => router.push(href), 1050);
      }

      schedule(() => {
        if (activeRef.current) resetTransition();
      }, 5000);
    };

    const resetOnHistoryNavigation = () => resetTransition();
    const prefetchOnPointer = (event: PointerEvent) => prefetchProject(event.target);
    const prefetchOnFocus = (event: FocusEvent) => prefetchProject(event.target);

    document.addEventListener("click", startProjectTransition, true);
    document.addEventListener("pointerover", prefetchOnPointer, { passive: true });
    document.addEventListener("focusin", prefetchOnFocus);
    window.addEventListener("pageshow", resetOnHistoryNavigation);
    window.addEventListener("popstate", resetOnHistoryNavigation);

    return () => {
      document.removeEventListener("click", startProjectTransition, true);
      document.removeEventListener("pointerover", prefetchOnPointer);
      document.removeEventListener("focusin", prefetchOnFocus);
      window.removeEventListener("pageshow", resetOnHistoryNavigation);
      window.removeEventListener("popstate", resetOnHistoryNavigation);
      clearScheduledWork();
      restoreDocument();
    };
  }, [clearScheduledWork, lockScroll, resetTransition, restoreDocument, router, schedule, startProgress]);

  const active = phase !== "idle";
  const transitionStyle = {
    "--project-transition-accent": project?.accent ?? "#b9ff43",
    "--project-transition-progress": `${progress / 100}`,
  } as CSSProperties;

  return (
    <>
      <div
        aria-hidden="true"
        className={styles.transition}
        data-project-active={active ? "true" : undefined}
        data-project-phase={phase}
        id="page-transition"
        style={transitionStyle}
      >
        <div className={styles.genericLayer}>
          <i className={styles.reticle}><b /><b /></i>
          <span>OPENING ARCHIVE</span>
          <em className={styles.genericProgress} />
        </div>

        <i className={styles.topCurtain} />
        <i className={styles.bottomCurtain} />
        <i className={styles.reducedLayer} />

        {project ? (
          <div className={styles.projectInfo}>
            <div className={styles.progressRow}>
              <span>OPENING CASE FILE / {project.index}</span>
              <i><b /></i>
              <strong>{formatProgress(progress)}</strong>
            </div>
            <p>{project.title}</p>
          </div>
        ) : null}
      </div>
      <p aria-live="polite" className={styles.srOnly}>{announcement}</p>
    </>
  );
}
