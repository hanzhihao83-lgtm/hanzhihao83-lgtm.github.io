"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { profile, profileFallbacks, resolveProfileValue } from "@/data/profile";

import styles from "./SiteHeader.module.css";

type NavigationKey = "projects" | "visual-notes" | "photography" | "moving-image";

const navigation = [
  { key: "projects", index: "01", label: "项目", href: "/#projects" },
  { key: "visual-notes", index: "02", label: "视觉笔记", href: "/visual-notes/" },
  { key: "photography", index: "03", label: "摄影", href: "/photography/" },
  { key: "moving-image", index: "04", label: "视频", href: "/moving-image/" },
] as const satisfies ReadonlyArray<{
  key: NavigationKey;
  index: string;
  label: string;
  href: string;
}>; 

const contactInfo = {
  name: "韩志浩",
  email: "893947041@qq.com",
  phone: "13020062121",
  phoneDisplay: "130 2006 2121",
  role: "AI 视觉设计 / 数字产品体验",
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

interface NavigationFeedback {
  id: number;
  key: NavigationKey;
  x: number;
  y: number;
}

interface PendingNavigation {
  key: NavigationKey;
  pathname: string;
}

function getActiveNavigation(pathname: string): NavigationKey | null {
  if (pathname === "/" || pathname.startsWith("/projects/")) return "projects";
  if (pathname.startsWith("/visual-notes")) return "visual-notes";
  if (pathname.startsWith("/photography")) return "photography";
  if (pathname.startsWith("/moving-image")) return "moving-image";
  return null;
}

export function SiteHeader() {
  const pathname = usePathname();
  const initials = resolveProfileValue(profile.initials, profileFallbacks.initials);
  const activeNavigation = getActiveNavigation(pathname);
  const isHome = pathname === "/";
  const isProject = pathname.startsWith("/projects/");
  const returnLink = isHome
    ? null
    : isProject
      ? { href: "/#projects", label: "返回项目" }
      : { href: "/", label: "返回首页" };
  const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation | null>(null);
  const [feedback, setFeedback] = useState<NavigationFeedback | null>(null);
  const navigationLockRef = useRef(false);
  const feedbackIdRef = useRef(0);
  const feedbackTimerRef = useRef<number | null>(null);
  const lockTimerRef = useRef<number | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const dialogFocusFrameRef = useRef<number | null>(null);
  const returnFocusTimerRef = useRef<number | null>(null);
  const contactButtonRef = useRef<HTMLButtonElement>(null);
  const contactDialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const contactOpenRef = useRef(false);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isEmailCopied, setIsEmailCopied] = useState(false);

  const clearTimer = useCallback((timerRef: { current: number | null }) => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => () => {
    clearTimer(feedbackTimerRef);
    clearTimer(lockTimerRef);
    clearTimer(copyTimerRef);
    clearTimer(returnFocusTimerRef);
    if (dialogFocusFrameRef.current !== null) window.cancelAnimationFrame(dialogFocusFrameRef.current);
  }, [clearTimer]);

  const closeContact = useCallback(() => {
    if (!contactOpenRef.current) return;
    contactOpenRef.current = false;
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    delete document.body.dataset.contactOpen;
    setIsContactOpen(false);
    setIsEmailCopied(false);
    clearTimer(copyTimerRef);

    clearTimer(returnFocusTimerRef);
    returnFocusTimerRef.current = window.setTimeout(() => {
      contactButtonRef.current?.focus({ preventScroll: true });
      previousFocusRef.current = null;
      returnFocusTimerRef.current = null;
    }, 0);
  }, [clearTimer]);

  const openContact = useCallback(() => {
    if (contactOpenRef.current) return;
    contactOpenRef.current = true;
    const activeElement = document.activeElement;
    previousFocusRef.current = activeElement instanceof HTMLElement && activeElement !== document.body
      ? activeElement
      : contactButtonRef.current;
    setIsEmailCopied(false);
    setIsContactOpen(true);
  }, []);

  useEffect(() => {
    if (!isContactOpen) return;

    const dialog = contactDialogRef.current;
    const body = document.body;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    body.dataset.contactOpen = "true";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    dialogFocusFrameRef.current = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
      dialogFocusFrameRef.current = null;
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeContact();
        return;
      }

      if (event.key !== "Tab" || !dialog) return;
      const focusableElements = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
        .filter((element) => element.getClientRects().length > 0);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (!dialog.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
      } else if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (dialogFocusFrameRef.current !== null) {
        window.cancelAnimationFrame(dialogFocusFrameRef.current);
        dialogFocusFrameRef.current = null;
      }
      body.style.overflow = "";
      body.style.paddingRight = "";
      delete body.dataset.contactOpen;
    };
  }, [closeContact, isContactOpen]);

  const copyEmail = useCallback(async () => {
    let copied = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(contactInfo.email);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied) {
      const textarea = document.createElement("textarea");
      textarea.value = contactInfo.email;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.width = "1px";
      textarea.style.height = "1px";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus({ preventScroll: true });
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      copied = document.execCommand("copy");
      textarea.remove();
      contactDialogRef.current?.querySelector<HTMLButtonElement>("[data-copy-email]")?.focus({ preventScroll: true });
    }

    if (!copied) return;
    setIsEmailCopied(true);
    clearTimer(copyTimerRef);
    copyTimerRef.current = window.setTimeout(() => {
      setIsEmailCopied(false);
      copyTimerRef.current = null;
    }, 2000);
  }, [clearTimer]);

  const lockNavigation = useCallback((event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
    ) return false;

    if (navigationLockRef.current) {
      event.preventDefault();
      return true;
    }

    navigationLockRef.current = true;
    clearTimer(lockTimerRef);
    lockTimerRef.current = window.setTimeout(() => {
      navigationLockRef.current = false;
      lockTimerRef.current = null;
    }, 900);
    return false;
  }, [clearTimer]);

  const handleNavigationClick = useCallback((
    event: ReactMouseEvent<HTMLAnchorElement>,
    key: NavigationKey,
  ) => {
    if (lockNavigation(event)) return;
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
    ) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const keyboardActivation = event.detail === 0;
    const x = keyboardActivation ? bounds.width / 2 : event.clientX - bounds.left;
    const y = keyboardActivation ? bounds.height / 2 : event.clientY - bounds.top;

    feedbackIdRef.current += 1;
    setPendingNavigation({ key, pathname });
    setFeedback({ id: feedbackIdRef.current, key, x, y });
    clearTimer(feedbackTimerRef);
    feedbackTimerRef.current = window.setTimeout(() => {
      setFeedback(null);
      setPendingNavigation(null);
      feedbackTimerRef.current = null;
    }, 540);
  }, [clearTimer, lockNavigation, pathname]);

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <div className={styles.leftSlot} data-has-return={returnLink ? "true" : undefined}>
          <Link
            aria-hidden={returnLink ? undefined : "true"}
            aria-label={returnLink?.label}
            className={styles.returnButton}
            data-transition
            data-visible={returnLink ? "true" : undefined}
            href={returnLink?.href ?? "/"}
            onClick={lockNavigation}
            prefetch={false}
            tabIndex={returnLink ? undefined : -1}
          >
            <span aria-hidden="true" className={styles.returnArrow}>←</span>
            <span className={styles.returnLabel}>{returnLink?.label}</span>
            <span className={styles.returnLabelMobile}>返回</span>
          </Link>
          <Link
            aria-label={`${initials}，返回首页`}
            className={styles.brand}
            data-transition
            href="/"
            prefetch={false}
          >
            <span>{initials}</span><i aria-hidden="true" />
          </Link>
        </div>

        <nav className={styles.primaryNav} aria-label="主导航">
          {navigation.map((item) => {
            const isCurrent = activeNavigation === item.key;
            const isSelected = isCurrent
              || (pendingNavigation?.pathname === pathname && pendingNavigation.key === item.key);
            const itemFeedback = feedback?.key === item.key ? feedback : null;
            const linkStyle = itemFeedback
              ? {
                  "--nav-ring-x": `${itemFeedback.x}px`,
                  "--nav-ring-y": `${itemFeedback.y}px`,
                } as CSSProperties
              : undefined;

            return (
              <Link
                aria-current={isCurrent ? "page" : undefined}
                className={styles.navLink}
                data-feedback={itemFeedback ? "true" : undefined}
                data-selected={isSelected ? "true" : undefined}
                data-transition
                href={item.href}
                key={item.href}
                onClick={(event) => handleNavigationClick(event, item.key)}
                prefetch={false}
                style={linkStyle}
              >
                <span className={styles.navIndex}>{item.index}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {itemFeedback ? <i aria-hidden="true" className={styles.clickRing} key={itemFeedback.id} /> : null}
              </Link>
            );
          })}
        </nav>

        <button
          aria-controls="contact-dialog"
          aria-expanded={isContactOpen}
          aria-label="联系我"
          className={styles.contactButton}
          data-contact-toggle
          id="contact-toggle"
          onClick={openContact}
          ref={contactButtonRef}
          type="button"
        >
          <span>联系我</span><i aria-hidden="true">↘</i>
        </button>
      </div>

      <div
        aria-hidden={isContactOpen ? undefined : true}
        className={styles.contactLayer}
        data-contact-layer
        data-open={isContactOpen ? "true" : undefined}
      >
        <button
          aria-label="关闭联系面板"
          className={styles.backdrop}
          data-contact-close
          onClick={closeContact}
          tabIndex={-1}
          type="button"
        />
        <section
          aria-labelledby="contact-dialog-title"
          aria-modal="true"
          className={styles.contactCard}
          id="contact-dialog"
          ref={contactDialogRef}
          role="dialog"
        >
          <button
            aria-label="关闭联系面板"
            className={styles.close}
            data-contact-close
            id="contact-close"
            onClick={closeContact}
            ref={closeButtonRef}
            type="button"
          >×</button>

          <div aria-hidden="true" className={styles.idCard}>
            <span className={styles.idNumber}>ID / 01</span>
            <i className={styles.availabilityDot} />
            <strong>HZ</strong>
            <div><span>HAN</span><span>2026</span></div>
          </div>

          <div className={styles.identity}>
            <span>IDENTITY CARD / AVAILABLE</span>
            <h2 id="contact-dialog-title">{contactInfo.name}</h2>
            <p>{contactInfo.role}</p>
            <dl className={styles.contactDetails}>
              <div><dt>EMAIL</dt><dd>{contactInfo.email}</dd></div>
              <div><dt>MOBILE</dt><dd>{contactInfo.phoneDisplay}</dd></div>
            </dl>
          </div>

          <div className={styles.contactActions}>
            <a href={`mailto:${contactInfo.email}`}>发送邮件 <span aria-hidden="true">↗</span></a>
            <a href={`tel:${contactInfo.phone}`}>拨打电话 <span aria-hidden="true">↗</span></a>
            <button data-copy-email onClick={copyEmail} type="button">
              <span aria-live="polite">{isEmailCopied ? "邮箱已复制 / COPIED" : "复制邮箱"}</span>
            </button>
          </div>
        </section>
      </div>
    </header>
  );
}
