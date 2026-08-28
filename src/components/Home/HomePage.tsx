import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/GlobalInteractions/Reveal";
import { homeCopy } from "@/data/site";
import { homeProjectCopy, projects } from "@/data/projects";
import { profile, profileFallbacks, resolveProfileValue } from "@/data/profile";

import { FeaturedEvaluationCard } from "./FeaturedEvaluationCard";
import { BlindEvaluationCoverVisual } from "./BlindEvaluationCoverVisual";
import { HomeFilmCover } from "./HomeFilmCover";
import { ImageCaptionCoverVisual } from "./ImageCaptionCoverVisual";
import styles from "./HomePage.module.css";
import { MultiTurnVQACoverVisual } from "./MultiTurnVQACoverVisual";
import { VisualNotesEntranceCollage } from "./VisualNotesEntranceCollage";

function ProjectVisual({ index }: { index: number }) {
  const project = projects[index];
  if (project.slug === "project-02") return <MultiTurnVQACoverVisual />;
  if (project.slug === "project-03") return <ImageCaptionCoverVisual />;
  if (project.slug === "project-04") return <BlindEvaluationCoverVisual />;

  return (
    <div className={styles.projectVisual} data-visual={project.visual}>
      <Image alt="" fill sizes={index === 0 ? "(max-width: 800px) 100vw, 58vw" : "(max-width: 800px) 100vw, 33vw"} src={project.cover} />
      <div className={styles.scanlines} aria-hidden="true" />
      <span className={styles.visualStatus}>{project.visual.toUpperCase()} / ACTIVE</span>
      <span className={styles.timecode}>00:0{index + 4}:2{index}:0{index}</span>
    </div>
  );
}

function ProjectCard({ index }: { index: number }) {
  const project = projects[index];
  const cardSummary = project.slug === "project-02"
    ? project.summary.replace("。内容为可编辑模板。", "。")
    : project.summary;
  if (index === 0) {
    return (
      <FeaturedEvaluationCard
        accent={project.accent}
        eyebrow={project.eyebrow}
        href={`/projects/${project.slug}/`}
        index={project.index}
        summary={project.summary}
        title={project.title}
        type={project.type}
      />
    );
  }
  return (
    <Link
      aria-label={project.slug === "project-02" ? `查看${project.title}项目` : undefined}
      className={styles.projectCard}
      data-accent={project.visual}
      data-project-accent={project.accent}
      data-project-index={project.index}
      data-project-title={project.title}
      data-project-transition
      data-transition
      href={`/projects/${project.slug}/`}
    >
      <div className={styles.projectCopy}>
        <div className={styles.cardMeta}><span>{project.index} / 04</span><span>{project.type}</span></div>
        <div>
          <p className={styles.cardEyebrow}>{project.eyebrow}</p>
          <h3>{project.title}</h3>
          <p className={styles.cardSummary}>{cardSummary}</p>
          <ul>{project.capabilities.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <span className={styles.cardArrow} data-project-arrow aria-hidden="true">↗</span>
      </div>
      <ProjectVisual index={index} />
    </Link>
  );
}

export function HomePage() {
  const role = resolveProfileValue(profile.role, profileFallbacks.role);
  const year = resolveProfileValue(profile.year, profileFallbacks.year);

  return (
    <div className={styles.page}>
      <section className={styles.hero} id="top">
        <div className={styles.orbits} aria-hidden="true"><i /><i /><i /><span /></div>
        <p className={styles.heroEyebrow}>{homeCopy.eyebrow} · {year}</p>
        <h1><span>{homeCopy.heroLead}</span><em>{homeCopy.heroMuted}</em></h1>
        <div className={styles.heroBottom}>
          <div><span>{role}</span><p>{homeCopy.intro}</p></div>
          <a href="#projects">{homeCopy.cta}<i aria-hidden="true">↓</i></a>
          <span className={styles.heroCount}>01 <i /> 04</span>
        </div>
      </section>

      <section className={styles.projects} id="projects">
        <Reveal className={styles.sectionHead}>
          <div><p>{homeProjectCopy.eyebrow}</p><span>01 — 04</span></div>
          <h2>{homeProjectCopy.title}</h2>
          <p>{homeProjectCopy.description}</p>
        </Reveal>
        <Reveal><ProjectCard index={0} /></Reveal>
        <Reveal>
          <div className={styles.projectGrid}>
            {[1, 2, 3].map((index) => <ProjectCard index={index} key={projects[index].slug} />)}
          </div>
        </Reveal>
      </section>

      <section className={styles.entrances}>
        <Reveal className={styles.notesBand}>
          <div className={styles.notesEntrance} id="visual-notes">
            <div className={styles.entranceCopy}>
              <p>{homeCopy.visualNotes.eyebrow}</p>
              <h2>{homeCopy.visualNotes.title}</h2>
              <span>{homeCopy.visualNotes.description}</span>
              <b><Link data-transition href="/visual-notes/">进入视觉档案 ↗</Link></b>
            </div>
            <VisualNotesEntranceCollage />
          </div>
        </Reveal>
        <Reveal className={styles.photoBand}>
          <Link className={styles.photoEntrance} data-transition href="/photography/" id="photography">
            <div className={styles.photoStack} aria-hidden="true">
              <span className={styles.photoStackMeta}>CONTACT SHEET / 01—05</span>
              <span className={styles.photoCard} data-frame="01">
                <Image alt="" fill sizes="(max-width: 980px) 72vw, 34vw" src="/images/photography/generated/city-rain-01.jpg" />
                <i>城市 / 雨线以外</i>
              </span>
              <span className={styles.photoCard} data-frame="02">
                <Image alt="" fill sizes="(max-width: 980px) 44vw, 21vw" src="/images/photography/generated/portrait-window-01.jpg" />
                <i>人物 / 窗边停顿</i>
              </span>
              <span className={styles.photoCard} data-frame="03">
                <Image alt="" fill sizes="(max-width: 980px) 58vw, 28vw" src="/images/photography/generated/architecture-shadow-01.jpg" />
                <i>建筑 / 尺度之间</i>
              </span>
              <span className={styles.photoReticle}><i /><i /></span>
            </div>
            <div className={styles.entranceCopy}>
              <span className={styles.photoSectionIndex}>03 / ARCHIVE</span>
              <p>{homeCopy.photography.eyebrow}</p>
              <h2>{homeCopy.photography.title}</h2>
              <span>{homeCopy.photography.description}</span>
              <b>进入摄影档案 ↗</b>
            </div>
          </Link>
        </Reveal>
        <Reveal className={styles.filmBand}>
          <Link className={styles.filmEntrance} data-transition href="/moving-image/" id="moving-image">
            <div className={styles.entranceCopy}><p>{homeCopy.movingImage.eyebrow}</p><h2>{homeCopy.movingImage.title}</h2><span>{homeCopy.movingImage.description}</span><b>进入影像放映室 ↗</b></div>
            <div className={styles.filmScreen}>
              <HomeFilmCover />
            </div>
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
