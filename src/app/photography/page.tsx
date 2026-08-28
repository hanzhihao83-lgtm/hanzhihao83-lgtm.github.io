import type { Metadata } from "next";
import Image from "next/image";

import { PhotographyGallery } from "@/components/PhotographyGallery/PhotographyGallery";

import styles from "./page.module.css";

export const metadata: Metadata = { title: "摄影作品", description: "记录城市、人物、建筑、夜景与日常的个人摄影档案。" };

export default function PhotographyPage() {
  return (
    <article className={styles.page} data-page-theme="photo">
      <header className={styles.hero}>
        <div className={styles.heroMeta}><span>PHOTOGRAPHY / VISUAL JOURNAL</span><span>05 FRAMES · 2026</span></div>
        <div className={styles.heroCopy}>
          <p>光线不会停留，<br />照片替它保存片刻。</p>
          <h1><span>摄影</span><span>作品</span></h1>
        </div>
        <figure className={styles.heroImage}>
          <Image alt="雨后城市高架下的行人" fill priority sizes="(max-width: 760px) 100vw, 62vw" src="/images/photography/generated/city-rain-01.png" />
          <figcaption><span>FEATURED FRAME / 01</span><span>雨线以外 · 都市街区</span></figcaption>
        </figure>
        <div className={styles.heroFooter}><span>SCROLL TO VIEW</span><p>记录城市、人物与空间之间，那些只出现一次的距离。</p></div>
      </header>
      <PhotographyGallery />
      <section className={styles.statement}><span>PHOTOGRAPHER&apos;S NOTE</span><blockquote>“我更关心画面如何保存一次观看：光线落在哪里，人与空间保持怎样的距离，以及按下快门前后的那一小段时间。”</blockquote><p>五个片段不是完整的旅行记录，而是一次关于日常、城市与时间的持续观察。</p></section>
    </article>
  );
}
