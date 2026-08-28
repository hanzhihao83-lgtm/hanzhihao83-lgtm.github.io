import Link from "next/link";

import { Reveal } from "@/components/GlobalInteractions/Reveal";
import { evaluationDimensions, scoreLevels } from "@/data/evaluation-config";
import { projects } from "@/data/projects";
import { i2vEvaluationProject } from "@/data/projects/i2v-evaluation";
import { buildProductResults, validateEvaluationCases } from "@/lib/evaluation";
import type { Project } from "@/types/content";
import type { EvaluationResult } from "@/types/evaluation";

import { EvaluationExplorer } from "./EvaluationExplorer";
import { EvaluationConclusion, type EvaluationConclusionDimension } from "./EvaluationConclusion";
import { EvaluationSnapshot } from "./EvaluationSnapshot";
import { EvaluationHeroVideo } from "./EvaluationHeroVideo";
import { ContextTransitionCover } from "./ContextTransitionCover";
import { ReviewNavigator, type ReviewNavigatorStep } from "./ReviewNavigator";
import { WeightedResultSection, type WeightedResultDimension } from "./WeightedResultSection";
import styles from "./VideoEvaluationProject.module.css";

const reviewDimensionOrder = [
  { id: "motion-quality", description: "静音观看完整视频，检查动作与镜头" },
  { id: "visual-quality", description: "静音检查关键帧、细节与光影" },
  { id: "temporal-consistency", description: "连续观察前后帧与主体稳定性" },
  { id: "audio-visual-sync", description: "开启声音，核对音频节奏与视觉事件" },
  { id: "instruction-following", description: "回到原始提示词，完成闭环核验" },
] as const;

function ProductComparison({ results }: { results: EvaluationResult[] }) {
  const summary = i2vEvaluationProject.summary;
  const product = i2vEvaluationProject.products[0];
  const result = results.find((item) => item.productId === product.id);
  const dimensions: WeightedResultDimension[] = evaluationDimensions.flatMap((dimension) => {
    const caseData = i2vEvaluationProject.cases.find((item) => item.dimension === dimension.id);
    const score = result?.dimensionScores[dimension.id];
    if (!caseData || typeof score !== "number") return [];
    return [{
      caseId: caseData.caseId,
      color: dimension.color,
      contribution: Number((score * dimension.weight).toFixed(2)),
      id: dimension.id,
      name: dimension.name,
      score,
      weight: dimension.weight,
    }];
  });
  const rating = scoreLevels.find((level) => level.score === Math.round(summary.overallScore))?.label ?? "待评定";

  return (
    <Reveal>
      <WeightedResultSection
        className={styles.section}
        dimensions={dimensions}
        overallScore={summary.overallScore}
        percentage={summary.percentage}
        productName={product.name}
        rating={rating}
        sampleSize={summary.sampleSizePerDimension}
        status={summary.status}
        validWeight={result?.validWeight ?? 0}
      />
    </Reveal>
  );
}

export function VideoEvaluationProject({ project }: { project: Project }) {
  const validationErrors = validateEvaluationCases(i2vEvaluationProject.cases, evaluationDimensions);
  if (validationErrors.length) throw new Error(`视频评测数据校验失败：${validationErrors.join("；")}`);

  const representativeCase = i2vEvaluationProject.cases.find((item) => item.id === i2vEvaluationProject.representativeCaseId)
    ?? i2vEvaluationProject.cases[0];
  const results = buildProductResults(i2vEvaluationProject.products, i2vEvaluationProject.cases, evaluationDimensions);
  const productResult = results[0];
  if (productResult?.overallScore !== i2vEvaluationProject.summary.overallScore) {
    throw new Error("视频评测综合得分与案例数据不一致。");
  }
  const currentIndex = projects.findIndex((item) => item.slug === project.slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];
  const conclusionDimensions: EvaluationConclusionDimension[] = evaluationDimensions.flatMap((dimension) => {
    const caseData = i2vEvaluationProject.cases.find((item) => item.dimension === dimension.id);
    if (!caseData || typeof caseData.score !== "number") return [];
    return [{
      caseId: caseData.caseId,
      color: dimension.color,
      id: dimension.id,
      name: dimension.name,
      observation: caseData.evaluatorNote,
      score: caseData.score,
      weight: dimension.weight,
    }];
  });
  const conclusionRating = scoreLevels.find((level) => level.score === Math.round(i2vEvaluationProject.summary.overallScore))?.label ?? "待评定";
  const reviewSteps: ReviewNavigatorStep[] = [
    {
      anchor: "#evaluation-protocol",
      color: evaluationDimensions[0].color,
      context: "原始提示词与评测协议",
      description: "建立评测依据与任务边界",
      meta: "PROMPT SOURCE",
      title: "原始提示词",
    },
    ...reviewDimensionOrder.flatMap(({ description, id }) => {
      const dimension = evaluationDimensions.find((item) => item.id === id);
      const caseData = i2vEvaluationProject.cases.find((item) => item.dimension === id);
      if (!dimension || !caseData) return [];
      const score = typeof caseData.score === "number" ? `${caseData.score}/5` : "N/A";
      return [{
        anchor: `#case-${caseData.caseId.toLowerCase()}`,
        color: dimension.color,
        context: `${dimension.name}案例`,
        description,
        meta: `${caseData.caseId} · ${score} · ${Math.round(caseData.weight * 100)}%`,
        title: dimension.name,
      }];
    }),
  ];

  return (
    <article className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.backRow}>
          <Link data-transition href="/#projects" prefetch={false}>← 返回项目</Link>
          <span>{i2vEvaluationProject.badge}</span>
        </div>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p>{i2vEvaluationProject.englishName}</p>
            <h1><span>AI视频</span><span>生成质量评测</span></h1>
            <p className={styles.heroSummary}>{i2vEvaluationProject.subtitle}</p>
            <EvaluationSnapshot
              badge={i2vEvaluationProject.badge}
              caseCount={i2vEvaluationProject.cases.length}
              dimensionCount={evaluationDimensions.length}
              dimensions={evaluationDimensions.map(({ color, id, name, weight }) => {
                const caseData = i2vEvaluationProject.cases.find((item) => item.dimension === id);
                return {
                  caseId: caseData?.caseId ?? "—",
                  color,
                  id,
                  name,
                  score: typeof caseData?.score === "number" ? caseData.score : 0,
                  weight,
                };
              })}
              percentage={i2vEvaluationProject.summary.percentage}
              rating={scoreLevels.find((level) => level.score === Math.round(i2vEvaluationProject.summary.overallScore))?.label ?? "待评定"}
              score={i2vEvaluationProject.summary.overallScore}
              status={i2vEvaluationProject.summary.status}
            />
          </div>
          <EvaluationHeroVideo accent={project.accent} caseData={representativeCase} />
        </div>
        <div className={styles.heroFoot}><span>SCROLL TO INSPECT</span><i aria-hidden="true">↓</i><p>{i2vEvaluationProject.badge}</p></div>
      </header>

      <ContextTransitionCover
        dimensions={evaluationDimensions.map(({ color, id, name }) => ({
          caseId: i2vEvaluationProject.cases.find((item) => item.dimension === id)?.caseId ?? "—",
          color,
          id,
          name,
        }))}
      />

      <div className={styles.content}>
        <Reveal>
          <section className={`${styles.section} ${styles.context}`} id="context">
            <div className={styles.sectionHeading}><span>01 / CONTEXT</span><h2>先定义边界，<br />再讨论好坏。</h2></div>
            <div><p>{project.background}</p><p>{i2vEvaluationProject.summary.disclaimer}</p></div>
          </section>
        </Reveal>

        <Reveal>
          <section aria-labelledby="process-title" className={`${styles.section} ${styles.processSection}`} id="evaluation-protocol">
            <div className={styles.sectionHeading}><span>02 / REVIEW PROTOCOL</span><h2 id="process-title">评测顺序</h2><p>声音、画面、时序与指令分阶段检视，降低一次观看带来的判断污染。</p></div>
            <ReviewNavigator steps={reviewSteps} />
          </section>
        </Reveal>

        <EvaluationExplorer cases={i2vEvaluationProject.cases} comparison={<ProductComparison results={results} />} dimensions={evaluationDimensions} products={i2vEvaluationProject.products} />

        <Reveal>
          <EvaluationConclusion
            className={styles.section}
            dimensions={conclusionDimensions}
            overallScore={i2vEvaluationProject.summary.overallScore}
            percentage={i2vEvaluationProject.summary.percentage}
            rating={conclusionRating}
            sampleSizePerDimension={i2vEvaluationProject.summary.sampleSizePerDimension}
          />
        </Reveal>
      </div>

      <Link className={styles.nextCase} data-transition href={`/projects/${nextProject.slug}/`} prefetch={false}>
        <span>NEXT CASE / {nextProject.index}</span><h2>{nextProject.title}</h2><i aria-hidden="true">↗</i>
      </Link>
    </article>
  );
}
