import type { Metadata } from "next";
import { FilmPlayer } from "@/components/MovingImage/FilmPlayer";
import { FrameArchive } from "@/components/MovingImage/FrameArchive";
import { HeroFilm } from "@/components/MovingImage/HeroFilm";
import { ProductionWorkflow } from "@/components/MovingImage/ProductionWorkflow";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "月下双刃 · 视频放映室", description: "LibTV × 即梦制作的生成式漫剧《月下双刃》专场。" };
const methods = ["剧情拆分", "角色与场景设定", "分镜规划", "视频生成", "音频与节奏处理", "剪辑与成片"] as const;

export default function MovingImagePage() {
  return <article className={styles.page} data-page-theme="film">
    <section className={styles.screening} aria-labelledby="film-title"><div className={styles.feature}>
      <header className={styles.intro}>
        <p className={styles.issue}>MOVING IMAGE · 03 FILMS</p>
        <h1 id="film-title" className={styles.title}><span>从一帧画面，</span><span>走进一段时间。</span></h1>
        <p className={styles.summary}>关于拍摄、剪辑、声音与节奏的个人影像练习。</p>
        <a className={styles.entry} href="#moonlit-player">进入影像放映室 <span aria-hidden="true">↗</span></a>
      </header>
      <div className={styles.heroMedia}><HeroFilm /></div>
    </div></section>
    <section className={styles.playerStage} aria-label="月下双刃完整放映">
      <div className={styles.playerStageInner}>
        <header className={styles.playerStageHeader}><span>FULL SCREENING / 01:00</span><p>完整影片、声音与章节索引</p></header>
        <FilmPlayer />
      </div>
    </section>
    <FrameArchive />
    <div className={styles.workflowBand}><ProductionWorkflow /></div>
    <div className={styles.editorial}>
      <div className={styles.sectionMarker}><span>PROJECT NOTES</span><span>03—04</span></div>
      <section className={styles.background} aria-labelledby="background-title">
        <div className={styles.sectionTitle}><span>03 / CONTEXT</span><h2 id="background-title">项目背景</h2></div>
        <div className={styles.bodyCopy}><p>使用 LibTV 组织漫剧制作流程，将剧本、角色、分镜与成片纳入同一条叙事路径；使用即梦完成画面与视频生成。</p><p>这次尝试关注的不是单张画面的奇观，而是生成式影像在角色一致性、场景气氛、动作连续性与叙事节奏上的表达。</p></div>
      </section>
      <section className={styles.method} aria-labelledby="method-title">
        <div className={styles.sectionTitle}><span>04 / PROCESS</span><h2 id="method-title">制作方法</h2></div>
        <ol className={styles.methodList}>{methods.map((method, index) => <li key={method}><span>{String(index + 1).padStart(2, "0")}</span>{method}</li>)}</ol>
      </section>
    </div>
  </article>;
}
