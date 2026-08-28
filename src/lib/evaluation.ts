import type {
  EvaluationDimension,
  EvaluationDimensionId,
  EvaluationResult,
  Product,
  ScoreValue,
  VideoCase,
} from "../types/evaluation";

const isScore = (value: VideoCase["score"]): value is ScoreValue =>
  typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;

export function calculateOverallScore(
  scores: Partial<Record<EvaluationDimensionId, number | "NA">>,
  dimensions: EvaluationDimension[],
) {
  let weightedTotal = 0;
  let validWeight = 0;

  dimensions.forEach((dimension) => {
    const score = scores[dimension.id];
    if (typeof score !== "number") return;
    weightedTotal += score * dimension.weight;
    validWeight += dimension.weight;
  });

  return {
    score: validWeight ? Number((weightedTotal / validWeight).toFixed(2)) : null,
    validWeight,
  };
}

export function buildProductResults(
  products: Product[],
  cases: VideoCase[],
  dimensions: EvaluationDimension[],
): EvaluationResult[] {
  return products.map((product) => {
    const dimensionScores: EvaluationResult["dimensionScores"] = {};

    dimensions.forEach((dimension) => {
      const matching = cases.filter(
        (item) => item.product === product.id && item.dimension === dimension.id,
      );
      const numericScores = matching.map((item) => item.score).filter(isScore);
      if (numericScores.length) {
        const average = numericScores.reduce((sum, score) => sum + score, 0) / numericScores.length;
        dimensionScores[dimension.id] = Number(average.toFixed(2));
      } else if (matching.length && matching.every((item) => item.score === "NA")) {
        dimensionScores[dimension.id] = "NA";
      }
    });

    const overall = calculateOverallScore(dimensionScores, dimensions);
    return {
      productId: product.id,
      dimensionScores,
      overallScore: overall.score,
      validWeight: overall.validWeight,
    };
  });
}

export function validateEvaluationCases(
  cases: VideoCase[],
  dimensions: EvaluationDimension[],
) {
  const errors: string[] = [];
  const dimensionMap = new Map(dimensions.map((dimension) => [dimension.id, dimension]));

  cases.forEach((item) => {
    const dimension = dimensionMap.get(item.dimension);
    if (!dimension) {
      errors.push(`${item.id}: 使用了未知评测维度 ${item.dimension}。`);
      return;
    }
    if (typeof item.score === "number" && !isScore(item.score)) {
      errors.push(`${item.id}: 评分必须是 1–5 的整数。`);
    }
    if (item.weight !== dimension.weight) {
      errors.push(`${item.id}: 案例权重必须与 ${dimension.name} 的配置一致。`);
    }
    if (isScore(item.score) && item.score < 5 && item.issueTags.length === 0) {
      errors.push(`${item.id}: 低于 5 分必须至少挂载一个问题标签。`);
    }
    if (item.score === "NA" && item.issueTags.length) {
      errors.push(`${item.id}: N/A 案例不能挂载扣分标签。`);
    }
    const allowed = new Set(dimension.issueTags.map((tag) => tag.id));
    item.issueTags.forEach((tag) => {
      if (!allowed.has(tag)) errors.push(`${item.id}: 标签 ${tag} 不属于当前维度。`);
    });
    if (item.score === "NA" && item.dimension === "audio-visual-sync" && item.audioRequired) {
      errors.push(`${item.id}: 提示词要求声音时，音画同步不能标记为 N/A。`);
    }
    if (item.audioRequired && item.audioStatus === "not-required") {
      errors.push(`${item.id}: 声音为必需项时不能标记为不要求声音。`);
    }
  });

  return errors;
}
