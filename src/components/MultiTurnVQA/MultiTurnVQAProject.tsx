import Link from "next/link";

import { Reveal } from "@/components/GlobalInteractions/Reveal";
import { projects } from "@/data/projects";
import type { Project } from "@/types/content";

import { MultiTurnVQADemo } from "./MultiTurnVQADemo";
import { MultiTurnVQAContextVisual } from "./MultiTurnVQAContextVisual";
import styles from "./MultiTurnVQAProject.module.css";
import { VQAExecutionTimeline } from "./VQAExecutionTimeline";
import { VQAQuestionLedger } from "./VQAQuestionLedger";
import { VQAQualityConsole } from "./VQAQualityConsole";
import { VQAResultSummary } from "./VQAResultSummary";
import { VQARuleInspector } from "./VQARuleInspector";

const frameworkLabels = ["GROUNDING", "DEPENDENCY", "CONSISTENCY"] as const;

const rewriteStages = [
  { title: "单轮样本", input: "单图单问答", action: "完整性预检", output: "可改写源样本", risk: "图文不一致", status: "GATE 01" },
  { title: "图像事实抽取", input: "源图像", action: "抽取对象、属性与关系", output: "事实节点集", risk: "视觉幻觉", status: "VERIFIED" },
  { title: "实体与属性建图", input: "事实节点集", action: "实体对齐并建立关系边", output: "图像事实图", risk: "节点冲突", status: "GRAPHED" },
  { title: "首轮独立问题", input: "图像事实图", action: "生成无上下文问题", output: "Q1 / A1", risk: "信息过载", status: "ANCHORED" },
  { title: "上下文依赖扩展", input: "Q1 / A1", action: "引入真实历史依赖", output: "Q2—Q4 问题链", risk: "伪依赖", status: "LINKED" },
  { title: "指代与关系改写", input: "问题链", action: "唯一化指代与参照物", output: "多轮自然表达", risk: "指代歧义", status: "RESOLVED" },
  { title: "一致性回查", input: "全轮对话", action: "逐轮对照事实图", output: "复核记录", risk: "属性漂移", status: "CHECKED" },
  { title: "多轮 SFT 样本", input: "复核通过对话", action: "按版本结构化归档", output: "Multi-turn SFT", risk: "标签遗漏", status: "READY" },
] as const;

const conclusionColumns = [
  { label: "RETAINABLE CAPABILITY", title: "可保留能力", items: ["单轮事实可定位后再进入依赖改写", "对象、属性与关系保留事实节点", "每轮答案都能返回视觉证据"] },
  { label: "HIGH-RISK ISSUES", title: "高风险问题", items: ["伪依赖或指代存在多个候选对象", "属性在后续轮次发生漂移", "同一问题重复计入多个主维度"] },
  { label: "NEXT-STAGE ACTION", title: "处理建议", items: ["逐轮核对依赖与唯一证据节点", "冲突样本退回人工复核", "检查通过后再进入版本归档"] },
] as const;

export function MultiTurnVQAProject({ project }: { project: Project }) {
  const currentIndex = projects.findIndex((item) => item.slug === project.slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];
  const pageStyle = { "--vqa-accent": project.accent, "--vqa-surface": project.surface } as React.CSSProperties;

  return (
    <article className={styles.case} data-page-theme="vqa" style={pageStyle}>
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
            <div className={styles.heroState}><i aria-hidden="true" /> STATUS / EDITABLE PROJECT TEMPLATE</div>
            <dl>
              <div><dt>TYPE</dt><dd>{project.type}</dd></div>
              <div><dt>PERIOD</dt><dd>{project.period}</dd></div>
              <div><dt>YEAR</dt><dd>{project.year}</dd></div>
            </dl>
          </div>
          <MultiTurnVQADemo />
        </div>
      </header>

      <div className={styles.body}>
        <Reveal>
          <section className={styles.context} id="context">
            <div className={styles.contextCopy}>
              <div className={styles.contextHeading}>
                <span>01 / PROJECT CONTEXT</span>
                <h2>从单轮事实，<br /><span>扩展为连续对话。</span></h2>
              </div>
              <p>{project.background}</p>
              <dl className={styles.contextParameters}>
                <div><dt>数据用途</dt><dd>多模态模型 SFT 训练与质量评测</dd></div>
                <div><dt>目标模型</dt><dd>通用视觉语言对话模型</dd></div>
                <div><dt>对话轮次</dt><dd>每组 3—5 轮</dd></div>
              </dl>
            </div>

            <MultiTurnVQAContextVisual />
          </section>
        </Reveal>

        <Reveal>
          <section className={styles.challenge} id="challenge">
            <div className={styles.sectionHeading}><span>02 / CHALLENGE</span><small>CONTENT PLACEHOLDER</small></div>
            <h2>把上下文依赖，变成可以逐轮回查的结构。</h2>
            <p>{project.challenge}</p>
          </section>
        </Reveal>

        <Reveal>
          <section className={styles.framework} id="framework">
            <SectionTitle eyebrow="03 / REWRITE METHOD" title="单轮转多轮改写" note="SINGLE-TURN SOURCE → FACT GRAPH → DEPENDENT DIALOGUE → SFT SAMPLE" />
            <div className={styles.frameworkGrid}>
              {project.framework.map((item, index) => (
                <article key={item.title}>
                  <div className={styles.frameworkMeta}><span>0{index + 1} / {frameworkLabels[index]}</span><i aria-hidden="true">CORE FRAMEWORK</i></div>
                  <div className={styles.relationLine} aria-hidden="true"><i /><i /><i /></div>
                  <h3>{item.title}</h3><p>{item.body}</p>
                </article>
              ))}
            </div>
            <ol className={styles.rewritePipeline} aria-label="视觉问答单轮转多轮改写流程">
              {rewriteStages.map((stage, index) => (
                <li key={stage.title} style={{ "--stage": index } as React.CSSProperties}>
                  <div className={styles.pipelineHeader}><span>{String(index + 1).padStart(2, "0")}</span><i>{stage.status}</i></div>
                  <h3>{stage.title}</h3>
                  <dl>
                    <div><dt>INPUT</dt><dd>{stage.input}</dd></div>
                    <div><dt>ACTION</dt><dd>{stage.action}</dd></div>
                    <div><dt>OUTPUT</dt><dd>{stage.output}</dd></div>
                    <div><dt>RISK</dt><dd>{stage.risk}</dd></div>
                  </dl>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>

        <Reveal>
          <section className={styles.rules} id="rule-system">
            <SectionTitle eyebrow="04 / REWRITE RULES" title="改写规则面板" note="SELECT ONE RULE / INSPECT LINKED EVIDENCE" />
            <VQARuleInspector rules={project.rules} />
          </section>
        </Reveal>

        <Reveal>
          <section className={styles.ledger} id="question-ledger">
            <VQAQuestionLedger />
          </section>
        </Reveal>

        <Reveal>
          <section className={styles.quality} id="quality-check">
            <VQAQualityConsole />
          </section>
        </Reveal>

        <Reveal>
          <section className={styles.execution} id="execution">
            <VQAExecutionTimeline steps={project.process} />
          </section>
        </Reveal>

        <Reveal>
          <section className={styles.results} id="result">
            <VQAResultSummary />
          </section>
        </Reveal>

        <Reveal>
          <section className={styles.conclusion} id="conclusion">
            <SectionTitle eyebrow="09 / CONCLUSION" title="让每一轮都回到证据。" note="RETAIN → REVIEW → RELEASE" />
            <div className={styles.conclusionGrid}>
              {conclusionColumns.map((column, index) => (
                <article key={column.title}>
                  <div><span>0{index + 1}</span><i>{column.label}</i></div><h3>{column.title}</h3>
                  <ul>{column.items.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
              ))}
            </div>
            <div className={styles.boundaryNote}><i aria-hidden="true" /><span>METHOD BOUNDARY</span><strong>案例演示，不构成正式数据集质量结论。</strong></div>
          </section>
        </Reveal>
      </div>

      <Link className={styles.nextCase} data-transition href={`/projects/${nextProject.slug}/`} prefetch={false}>
        <span>NEXT CASE / {nextProject.index}</span><h2>{nextProject.title}</h2><i aria-hidden="true">↗</i>
      </Link>
    </article>
  );
}

function SectionTitle({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
  return <div className={styles.sectionTitle}><span>{eyebrow}</span><h2>{title}</h2><p>{note}</p></div>;
}
