"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

import type {
  AssistantKnowledge,
  AssistantReply,
} from "./assistantKnowledge";
import styles from "./SiteAssistant.module.css";

type PanelPhase = "closed" | "connecting" | "ready" | "closing";

interface Message {
  id: number;
  sender: "assistant" | "user";
  text: string;
  href?: string;
  linkLabel?: string;
}

const PANEL_STORAGE_KEY = "hz-assistant-panel-open";
const WELCOME_STORAGE_KEY = "hz-assistant-welcome-shown";
const INITIALIZATION_LINES = [
  "> CONNECTING TO HZ PORTFOLIO …",
  "> LOADING PROJECT INDEX …",
  "> ASSISTANT READY",
] as const;

const subscribeToHydration = () => () => undefined;
const subscribeToReducedMotion = (onStoreChange: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
};
const getReducedMotionSnapshot = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getReducedMotionServerSnapshot = () => false;

function normalizeQuery(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function findReply(knowledge: AssistantKnowledge, input: string): AssistantReply {
  const query = normalizeQuery(input);
  const match = knowledge.answers.find((answer) =>
    answer.keywords.some((keyword) => query.includes(normalizeQuery(keyword))),
  );

  return match
    ? { text: match.text, href: match.href, linkLabel: match.linkLabel }
    : { text: knowledge.fallback };
}

export function SiteAssistantClient({ knowledge }: { knowledge: AssistantKnowledge }) {
  const router = useRouter();
  const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const [panelPhase, setPanelPhase] = useState<PanelPhase>("closed");
  const [initializationLineCount, setInitializationLineCount] = useState(0);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [waveIteration, setWaveIteration] = useState(0);
  const [draft, setDraft] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "assistant", text: knowledge.welcome },
  ]);
  const messageId = useRef(1);
  const characterButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const waveTimer = useRef<number | null>(null);
  const initializationTimers = useRef<Set<number>>(new Set());
  const replyTimers = useRef<Set<number>>(new Set());

  const scheduleReply = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      replyTimers.current.delete(timer);
      callback();
    }, delay);
    replyTimers.current.add(timer);
    return timer;
  }, []);

  const scheduleInitialization = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      initializationTimers.current.delete(timer);
      callback();
    }, delay);
    initializationTimers.current.add(timer);
    return timer;
  }, []);

  const clearInitialization = useCallback(() => {
    initializationTimers.current.forEach((timer) => window.clearTimeout(timer));
    initializationTimers.current.clear();
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const canShowWelcome = window.matchMedia("(min-width: 761px)").matches;
      try {
        if (window.sessionStorage.getItem(PANEL_STORAGE_KEY) === "true") {
          setInitializationLineCount(INITIALIZATION_LINES.length);
          setPanelPhase("ready");
        }
        if (window.sessionStorage.getItem(WELCOME_STORAGE_KEY) !== "true") {
          window.sessionStorage.setItem(WELCOME_STORAGE_KEY, "true");
          setWelcomeVisible(canShowWelcome);
        }
      } catch {
        setWelcomeVisible(canShowWelcome);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const closePanel = useCallback(() => {
    if (openTimer.current !== null) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    clearInitialization();
    try {
      window.sessionStorage.setItem(PANEL_STORAGE_KEY, "false");
    } catch {
      // The assistant remains usable when storage is unavailable.
    }

    if (prefersReducedMotion) {
      setPanelPhase("closed");
      characterButtonRef.current?.focus({ preventScroll: true });
      return;
    }

    setPanelPhase("closing");
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setPanelPhase("closed");
      closeTimer.current = null;
      characterButtonRef.current?.focus({ preventScroll: true });
    }, 220);
  }, [clearInitialization, prefersReducedMotion]);

  useEffect(() => {
    if (panelPhase === "closed") return;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [closePanel, panelPhase]);

  useEffect(() => {
    if (panelPhase !== "ready") return;
    if (!window.matchMedia("(min-width: 761px) and (hover: hover)").matches) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [panelPhase]);

  useEffect(() => {
    const conversation = conversationRef.current;
    if (!conversation) return;
    conversation.scrollTo({
      top: conversation.scrollHeight,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [messages, isReplying, panelPhase, prefersReducedMotion]);

  useEffect(() => {
    const activeInitializationTimers = initializationTimers.current;
    const activeReplyTimers = replyTimers.current;
    return () => {
      if (openTimer.current !== null) window.clearTimeout(openTimer.current);
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
      if (waveTimer.current !== null) window.clearTimeout(waveTimer.current);
      activeInitializationTimers.forEach((timer) => window.clearTimeout(timer));
      activeInitializationTimers.clear();
      activeReplyTimers.forEach((timer) => window.clearTimeout(timer));
      activeReplyTimers.clear();
    };
  }, []);

  const dismissWelcome = () => setWelcomeVisible(false);

  const startWave = () => {
    if (waveTimer.current !== null) window.clearTimeout(waveTimer.current);
    setWaveIteration((iteration) => iteration + 1);
    setIsWaving(true);
    waveTimer.current = window.setTimeout(() => {
      setIsWaving(false);
      waveTimer.current = null;
    }, prefersReducedMotion ? 180 : 1150);
  };

  const beginInitialization = () => {
    clearInitialization();
    setPanelPhase("connecting");
    setInitializationLineCount(prefersReducedMotion ? INITIALIZATION_LINES.length : 0);
    try {
      window.sessionStorage.setItem(PANEL_STORAGE_KEY, "true");
    } catch {
      // The open panel still works without storage.
    }

    if (prefersReducedMotion) {
      setPanelPhase("ready");
      return;
    }

    [80, 240, 420].forEach((delay, index) => {
      scheduleInitialization(() => setInitializationLineCount(index + 1), delay);
    });
    scheduleInitialization(() => setPanelPhase("ready"), 620);
  };

  const openAssistant = () => {
    startWave();
    if (panelPhase === "connecting" || panelPhase === "ready") return;
    dismissWelcome();
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (openTimer.current !== null) return;
    openTimer.current = window.setTimeout(() => {
      beginInitialization();
      openTimer.current = null;
    }, prefersReducedMotion ? 0 : 350);
  };

  const navigate = (reply: Pick<AssistantReply, "href">) => {
    const href = reply.href;
    if (!href) return;
    const hash = href.startsWith("/#") ? href.slice(1) : "";

    if (window.location.pathname === "/" && hash) {
      document.querySelector(hash)?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    } else {
      router.push(href);
    }
  };

  const sendQuestion = (input: string) => {
    const question = input.trim();
    if (!question || isReplying || panelPhase !== "ready") return;

    messageId.current += 1;
    setMessages((current) => [
      ...current,
      { id: messageId.current, sender: "user", text: question },
    ]);
    setDraft("");
    setIsReplying(true);

    scheduleReply(() => {
      const reply = findReply(knowledge, question);
      messageId.current += 1;
      setMessages((current) => [
        ...current,
        { id: messageId.current, sender: "assistant", ...reply },
      ]);
      setIsReplying(false);
    }, prefersReducedMotion ? 0 : 220);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendQuestion(draft);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  const startBrowsing = () => {
    dismissWelcome();
    navigate({ href: "/#projects" });
  };

  const panelVisible = panelPhase !== "closed";
  const isReady = panelPhase === "ready";
  const statusLabel = isReady ? "READY" : "CONNECTING";

  const portalContent = (
    <div className={styles.portalLayer}>
      {welcomeVisible && !panelVisible ? (
        <aside aria-label="作品集欢迎提示" className={styles.welcomeCard}>
          <button
            aria-label="关闭欢迎提示"
            className={styles.welcomeClose}
            onClick={dismissWelcome}
            type="button"
          >
            ×
          </button>
          <span>WELCOME</span>
          <h2>欢迎来到韩志浩的作品集</h2>
          <p>页面中的项目都可以点击查看完整内容。</p>
          <p>如果你不知道从哪里开始，可以点击右下角的小浩，它会带你快速了解作品集。</p>
          <button className={styles.welcomeAction} onClick={startBrowsing} type="button">
            开始浏览 <i aria-hidden="true">→</i>
          </button>
        </aside>
      ) : null}

      {panelVisible ? (
        <aside
          aria-label="韩志浩的站内助手"
          aria-busy={!isReady}
          className={styles.panel}
          data-phase={panelPhase}
          role="dialog"
        >
          <header className={styles.panelHeader}>
            <div className={styles.panelIdentity}>
              <span>HZ ARCHIVE · ASSISTANT V1.0</span>
              <div>
                <h2>站内助手</h2>
                <p aria-live="polite" data-ready={isReady ? "true" : "false"}>
                  <i aria-hidden="true" />
                  {statusLabel}
                </p>
              </div>
            </div>
            <div className={styles.panelControls}>
              <button
                aria-label="让小浩挥手"
                className={styles.waveButton}
                onClick={startWave}
                type="button"
              >
                {isWaving ? "HELLO!" : "WAVE"}
              </button>
              <button
                aria-label="关闭韩志浩的站内助手"
                className={styles.closeButton}
                onClick={closePanel}
                type="button"
              >
                ×
              </button>
            </div>
          </header>

          <div className={styles.panelMain}>
            <div aria-live="polite" className={styles.initialization}>
              {INITIALIZATION_LINES.slice(0, initializationLineCount).map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            {isReady ? (
              <>
                <div aria-label="快捷问题" className={styles.quickQuestions}>
                  {knowledge.quickQuestions.map((item) => (
                    <button
                      disabled={isReplying}
                      key={item.id}
                      onClick={() => sendQuestion(item.question)}
                      type="button"
                    >
                      {item.label}
                      <span aria-hidden="true">↗</span>
                    </button>
                  ))}
                </div>

                <div
                  aria-live="polite"
                  aria-relevant="additions"
                  className={styles.conversation}
                  ref={conversationRef}
                >
                  {messages.map((message) => (
                    <div className={styles.message} data-sender={message.sender} key={message.id}>
                      <p>{message.text}</p>
                      {message.href ? (
                        <button onClick={() => navigate(message)} type="button">
                          {message.linkLabel ?? "查看项目 →"}
                        </button>
                      ) : null}
                    </div>
                  ))}
                  {isReplying ? (
                    <p className={styles.replying} role="status">正在查找站内内容…</p>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>

          <form className={styles.composer} data-ready={isReady ? "true" : "false"} onSubmit={handleSubmit}>
            <label className={styles.srOnly} htmlFor="hz-assistant-input">
              输入你想了解的作品集问题
            </label>
            <textarea
              disabled={!isReady}
              id="hz-assistant-input"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={isReady ? "你想了解哪个项目？" : "正在连接作品集…"}
              ref={inputRef}
              rows={1}
              value={draft}
            />
            <button disabled={!isReady || !draft.trim() || isReplying} type="submit">
              发送
            </button>
          </form>
        </aside>
      ) : null}
    </div>
  );

  return (
    <>
      <div className={styles.characterRoot}>
        <button
          aria-expanded={panelVisible}
          aria-label="打开韩志浩的站内助手"
          className={styles.characterButton}
          onClick={openAssistant}
          ref={characterButtonRef}
          type="button"
        >
          <span aria-hidden="true" className={styles.characterShadow} />
          <span
            className={styles.characterFigure}
            data-wave-parity={waveIteration % 2}
            data-waving={isWaving ? "true" : "false"}
          >
            <Image
              alt="韩志浩作品集的Q版男性导览助手小浩，抱着平板并抬手挥手"
              className={styles.characterImage}
              draggable={false}
              fetchPriority="high"
              height={240}
              loading="eager"
              sizes="(max-width: 760px) 48px, 107px"
              src="/assistant/han-zhihao-chibi.webp"
              width={160}
            />
            <span aria-hidden="true" className={styles.blinkLayer}><i /><i /></span>
            {isWaving && !prefersReducedMotion ? (
              <span className={styles.motionLayers} key={"wave-" + waveIteration}>
                <span className={styles.headLayer}>
                  <Image
                    alt=""
                    className={styles.characterImage}
                    draggable={false}
                    height={240}
                    sizes="(max-width: 760px) 48px, 107px"
                    src="/assistant/han-zhihao-chibi.webp"
                    width={160}
                  />
                </span>
                <span className={styles.armLayer}>
                  <Image
                    alt=""
                    className={styles.characterImage}
                    draggable={false}
                    height={240}
                    sizes="(max-width: 760px) 48px, 107px"
                    src="/assistant/han-zhihao-chibi.webp"
                    width={160}
                  />
                </span>
              </span>
            ) : null}
          </span>
        </button>
      </div>
      {hydrated ? createPortal(portalContent, document.body) : null}
    </>
  );
}
