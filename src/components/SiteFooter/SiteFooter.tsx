import Link from "next/link";

import { profile, profileFallbacks, resolveProfileValue } from "@/data/profile";

import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  const name = resolveProfileValue(profile.name, profileFallbacks.name);
  const role = resolveProfileValue(profile.role, profileFallbacks.role);
  const year = resolveProfileValue(profile.year, profileFallbacks.year);
  const email = resolveProfileValue(profile.email, profileFallbacks.email);

  return (
    <footer className={styles.footer} id="footer-contact">
      <div className={styles.meta}><span>AVAILABLE FOR SELECTED WORK</span><span>{year}</span></div>
      <div className={styles.heading}><p>下一项工作，</p><h2>让判断产生价值。</h2></div>
      <div className={styles.bottom}>
        <a href={`mailto:${email}`}>联系我 <span aria-hidden="true">↗</span></a>
        <nav aria-label="页脚导航">
          <Link data-transition href="/visual-notes/" prefetch={false}>视觉笔记</Link>
          <Link data-transition href="/photography/" prefetch={false}>摄影</Link>
          <Link data-transition href="/moving-image/" prefetch={false}>视频</Link>
        </nav>
        <p>{name} · {role}<br />PORTFOLIO · {year}</p>
      </div>
    </footer>
  );
}
