import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/GlobalInteractions/Reveal";
import { projects } from "@/data/projects";
import type { Project } from "@/types/content";

import { ImageCaptionCases } from "./ImageCaptionCases";
import { ImageCaptionContext } from "./ImageCaptionContext";
import { ImageCaptionExecution } from "./ImageCaptionExecution";
import { ImageCaptionFramework } from "./ImageCaptionFramework";
import { ImageCaptionHero } from "./ImageCaptionHero";
import { ImageCaptionOutcome } from "./ImageCaptionOutcome";
import { ImageCaptionRuleSystem } from "./ImageCaptionRuleSystem";
import styles from "./ProjectCase.module.css";

function VisualConsole({ project }: { project: Project }) {
  return (
    <div className={styles.visualConsole} data-visual={project.visual}>
      <Image alt="" fill priority sizes="(max-width: 800px) 100vw, 58vw" src={project.cover} />
      <div className={styles.hudGrid} aria-hidden="true" />
      <span>SYS / {project.index}</span><time>00:07:00:12</time>
    </div>
  );
}

function MetricGrid({ project }: { project: Project }) {
  return (
    <div className={styles.metrics}>
      {project.metrics.map((metric) => (
        <article key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><p>{metric.note}</p></article>
      ))}
    </div>
  );
}

function ProcessTimeline({ steps }: { steps: string[] }) {
  return (
    <ol className={styles.process}>
      {steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><b>{step}</b></li>)}
    </ol>
  );
}

function TagMatrix({ tags }: { tags: string[] }) {
  return <div className={styles.tagMatrix}>{tags.map((tag, index) => <span key={tag}><i>{String(index + 1).padStart(2, "0")}</i>{tag}</span>)}</div>;
}

export function ProjectCase({ project }: { project: Project }) {
  const currentIndex = projects.findIndex((item) => item.slug === project.slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];
  const pageStyle = { "--case-accent": project.accent, "--case-surface": project.surface } as React.CSSProperties;

  return (
    <article className={styles.case} data-visual={project.visual} style={pageStyle}>
      <header className={styles.hero}>
        <div className={styles.backRow}>
          <Link data-transition href="/#projects" prefetch={false}>← 返回项目</Link>
          <span>CASE STUDY / {project.index}</span>
        </div>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p>{project.eyebrow}</p>
            <h1>{project.title}</h1>
            <p className={styles.summary}>{project.summary}</p>
            <dl><div><dt>TYPE</dt><dd>{project.type}</dd></div><div><dt>PERIOD</dt><dd>{project.period}</dd></div><div><dt>YEAR</dt><dd>{project.year}</dd></div></dl>
          </div>
          {project.slug === "project-03" ? <ImageCaptionHero /> : <VisualConsole project={project} />}
        </div>
      </header>

      <div className={styles.body}>
        <Reveal>
          {project.slug === "project-03" ? (
            <ImageCaptionContext />
          ) : (
            <section className={styles.twoColumn}><div><span>01 / CONTEXT</span><h2>项目背景</h2></div><p>{project.background}</p></section>
          )}
        </Reveal>
        <Reveal><section className={styles.challenge}><span>02 / CHALLENGE</span><h2>把模糊感受，拆成可以共同判断的问题。</h2><p>{project.challenge}</p></section></Reveal>
        <Reveal>
          {project.slug === "project-03" ? (
            <ImageCaptionFramework />
          ) : (
            <section className={styles.framework}>
              <div className={styles.sectionTitle}><span>03 / FRAMEWORK</span><h2>方法框架</h2></div>
              <div className={styles.frameworkGrid}>{project.framework.map((item, index) => <article key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
            </section>
          )}
        </Reveal>
        <Reveal>
          {project.slug === "project-03" ? (
            <ImageCaptionRuleSystem />
          ) : (
            <section><div className={styles.sectionTitle}><span>04 / RULE SYSTEM</span><h2>规则 / 标签体系</h2></div><TagMatrix tags={project.rules} /></section>
          )}
        </Reveal>
        <Reveal>
          {project.slug === "project-03" ? (
            <ImageCaptionExecution />
          ) : (
            <section><div className={styles.sectionTitle}><span>05 / EXECUTION</span><h2>执行流程</h2></div><ProcessTimeline steps={project.process} /></section>
          )}
        </Reveal>
        <Reveal>
          {project.slug === "project-03" ? (
            <ImageCaptionOutcome />
          ) : (
            <section><div className={styles.sectionTitle}><span>06 / RESULT</span><h2>结果与能力沉淀</h2></div><MetricGrid project={project} /><p className={styles.outcome}>{project.outcome}</p></section>
          )}
        </Reveal>
        {project.slug === "project-03" ? <ImageCaptionCases /> : null}
      </div>

      <Link className={styles.nextCase} data-transition href={`/projects/${nextProject.slug}/`} prefetch={false}>
        <span>NEXT CASE / {nextProject.index}</span><h2>{nextProject.title}</h2><i aria-hidden="true">↗</i>
      </Link>
    </article>
  );
}
