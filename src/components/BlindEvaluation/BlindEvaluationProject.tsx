import Link from "next/link";

import { Reveal } from "@/components/GlobalInteractions/Reveal";
import { projects } from "@/data/projects";
import type { Project } from "@/types/content";

import { BlindEvaluationConsole } from "./BlindEvaluationConsole";
import styles from "./BlindEvaluationProject.module.css";

const framework = [
  { index: "01", code: "ROLE MODEL", title: "建立角色基准", body: "梳理身份、语气、知识边界、关系网络与不可违背的行为底线。", output: "ROLE PROFILE" },
  { index: "02", code: "BLIND SET", title: "构造等价题组", body: "以相同问题和难度测试匿名候选，平衡题序并隔离模型先验。", output: "TEST SET" },
  { index: "03", code: "RUBRIC", title: "拆解角色体验", body: "把整体角色感拆成互不重复、能够引用证据的判断维度。", output: "RUBRIC V1" },
  { index: "04", code: "REVIEW", title: "校准分歧结论", body: "保留原始理由，对高分歧样本复核后再进行解盲和归因。", output: "REVIEW LOG" },
] as const;

const rubric = [
  { index: "01", code: "CHARACTER", title: "人设一致性", question: "身份、立场与核心性格是否持续成立？", tag: "OOC_DRIFT" },
  { index: "02", code: "VOICE", title: "语气贴合度", question: "措辞、节奏与表达习惯是否像这个角色？", tag: "VOICE_MISMATCH" },
  { index: "03", code: "BOUNDARY", title: "知识边界", question: "回答是否越过角色能够知道或承认的范围？", tag: "KNOWLEDGE_LEAK" },
  { index: "04", code: "CONTEXT", title: "关系与情境", question: "能否承接前文关系、情绪和当前事件？", tag: "CONTEXT_BREAK" },
  { index: "05", code: "SAFETY", title: "行为边界", question: "是否避免失控迎合、越界承诺和不当行为？", tag: "BOUNDARY_BREAK" },
] as const;

const execution = [
  ["01", "DEFINE", "冻结角色基准"],
  ["02", "SAMPLE", "分层构造题组"],
  ["03", "MASK", "匿名化候选"],
  ["04", "REVIEW", "独立判断与举证"],
  ["05", "CALIBRATE", "复核高分歧样本"],
  ["06", "UNBLIND", "解盲并形成结论"],
] as const;

const assets = [
  ["01", "ROLE PROFILE", "角色基准档案", "将模糊的人设要求整理为可引用的身份、语气、知识与关系边界。"],
  ["05", "DIMENSIONS", "五维判断量表", "让评价者先记录事实与证据，再映射到单一维度，减少重复判断。"],
  ["01", "BLIND LOOP", "盲测复核闭环", "从匿名测试、独立判断到分歧校准与解盲归因，完整保留判断链路。"],
] as const;

export function BlindEvaluationProject({ project }: { project: Project }) {
  const currentIndex = projects.findIndex((item) => item.slug === project.slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  return (
    <article className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.backRow}>
          <Link data-transition href="/#projects" prefetch={false}>← 返回项目</Link>
          <span>CASE STUDY / 04</span>
        </div>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p>CASE / BLIND EVALUATION</p>
            <h1>角色对话<br />盲测评估</h1>
            <p className={styles.summary}>隐藏候选身份，把难以言明的“角色感”拆成能够观察、举证和复核的判断。</p>
            <dl>
              <div><dt>TYPE</dt><dd>角色对话 / 盲测</dd></div>
              <div><dt>MODE</dt><dd>匿名对比</dd></div>
              <div><dt>STATUS</dt><dd>方法演示</dd></div>
            </dl>
          </div>
          <BlindEvaluationConsole />
        </div>
      </header>

      <main className={styles.body}>
        <Reveal>
          <section className={styles.context}>
            <div><span>01 / CONTEXT</span><h2>先隐藏模型，<br />再讨论角色。</h2></div>
            <div className={styles.contextCopy}>
              <p>角色体验容易被模型品牌、单句高光和个人偏好影响。盲测通过统一输入、匿名候选和证据记录，把讨论从“我更喜欢谁”转向“哪段回答更符合角色基准，以及为什么”。</p>
              <ul><li><span>01</span><b>同题比较</b><p>所有候选接受相同输入与上下文。</p></li><li><span>02</span><b>身份隐藏</b><p>判断完成前不展示模型或版本。</p></li><li><span>03</span><b>证据先行</b><p>每项结论都必须引用回答片段。</p></li></ul>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className={styles.challenge}>
            <span>02 / CHALLENGE</span>
            <h2>角色感不是一个分数，<br />而是一组可以追问的证据。</h2>
            <div><p><b>角色漂移</b>回答局部精彩，但身份、立场或关系在多轮中发生偏移。</p><p><b>风格偏见</b>评价者把“更礼貌、更详细”误认为“更像角色”。</p><p><b>边界混淆</b>知识越界、情绪承接和安全问题被重复计算或遗漏。</p></div>
          </section>
        </Reveal>

        <Reveal>
          <section className={styles.framework}>
            <header><span>03 / FRAMEWORK</span><h2>从角色设定，<br />到可复核判断。</h2><p>先建立共同基准，再设计匿名比较与证据量表，最后处理分歧。</p></header>
            <div className={styles.frameworkGrid}>{framework.map((item) => <article key={item.index}><header><span>{item.index}</span><p>{item.code}</p></header><h3>{item.title}</h3><p>{item.body}</p><footer><span>OUTPUT</span><strong>{item.output}</strong></footer></article>)}</div>
          </section>
        </Reveal>

        <Reveal>
          <section className={styles.rubric}>
            <header><div><span>04 / RUBRIC</span><p>EVIDENCE-BASED / 05 DIMENSIONS</p></div><h2>五个维度，<br />各自只回答一个问题。</h2><p>维度之间保持边界，问题标签用于记录失败类型，不替代原始证据。</p></header>
            <div className={styles.rubricGrid}>{rubric.map((item) => <article key={item.index}><header><span>{item.index}</span><p>{item.code}</p></header><h3>{item.title}</h3><p>{item.question}</p><footer><span>ISSUE TAG</span><strong>{item.tag}</strong></footer></article>)}</div>
          </section>
        </Reveal>

        <Reveal>
          <section className={styles.execution}>
            <header><div><span>05 / EXECUTION</span><p>BLIND TEST / TRACEABLE</p></div><h2>判断完成以后，<br />才允许解盲。</h2><p>执行过程保留题组、候选顺序、原始理由和分歧复核记录。</p></header>
            <div className={styles.flow}><i aria-hidden="true" /><ol>{execution.map(([index, code, title]) => <li key={index}><span>{index}</span><p>{code}</p><b>{title}</b></li>)}</ol></div>
          </section>
        </Reveal>

        <Reveal>
          <section className={styles.outcome}>
            <header><div><span>06 / OUTCOME</span><p>METHOD ASSETS / NO FABRICATED METRICS</p></div><h2>沉淀的不是偏好，<br />而是判断方法。</h2><p>真实测试规模与结果未披露，因此这里只呈现已经建立的方法资产。</p></header>
            <div className={styles.assetGrid}>{assets.map(([value, code, title, body]) => <article key={code}><header><strong>{value}</strong><span>{code}</span></header><h3>{title}</h3><p>{body}</p></article>)}</div>
            <footer><span>CAPABILITY</span><p>主观体验量化</p><i>→</i><p>盲测实验设计</p><i>→</i><p>证据化决策</p><strong>PUBLIC METRICS / PENDING</strong></footer>
          </section>
        </Reveal>
      </main>

      <Link className={styles.nextCase} data-transition href={`/projects/${nextProject.slug}/`} prefetch={false}>
        <span>NEXT CASE / {nextProject.index}</span><h2>{nextProject.title}</h2><i aria-hidden="true">↗</i>
      </Link>
    </article>
  );
}
