export type EvaluationDimensionId =
  | "instruction-following"
  | "motion-quality"
  | "visual-quality"
  | "temporal-consistency"
  | "audio-visual-sync";

export type ScoreValue = 1 | 2 | 3 | 4 | 5;
export type EvaluationScore = ScoreValue | "NA" | null;
export type AudioStatus = "available" | "missing-required" | "not-required" | "unknown";
export type EvaluationCoverage = "标准" | "有限";

export interface Product {
  id: string;
  name: string;
  shortName: string;
  note: string;
}

export interface IssueTag {
  id: string;
  label: string;
  dimension: EvaluationDimensionId;
}

export interface EvaluationDimension {
  id: EvaluationDimensionId;
  name: string;
  englishName: string;
  definition: string;
  method: string;
  exclusion: string;
  color: string;
  weight: number;
  issueTags: IssueTag[];
}

export interface ScoreLevel {
  score: ScoreValue;
  label: string;
  description: string;
}

export type EvidenceAnnotationType = "subject" | "motion" | "object" | "issue" | "audio";
export type EvidenceAnnotationColor = "accent" | "issue";

export interface EvidenceAnnotation {
  id: string;
  label: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  type: EvidenceAnnotationType;
  color: EvidenceAnnotationColor;
  factIndex?: number;
}

export interface EvidenceFrame {
  id: string;
  frameLabel: string;
  timestamp: number;
  imageSrc: string;
  title: string;
  englishTitle: string;
  facts: string[];
  promptMatch: ScoreValue;
  issueTag?: IssueTag["id"];
  annotations: EvidenceAnnotation[];
}

export interface VideoCase {
  id: string;
  caseId: string;
  title: string;
  video: string;
  poster: string;
  product: Product["id"];
  promptSummary: string;
  originalPrompt?: string;
  dimension: EvaluationDimensionId;
  score: EvaluationScore;
  scoreLabel: string | null;
  weight: number;
  observableFacts: string[];
  issueTags: IssueTag["id"][];
  evaluatorNote: string;
  startTime: number;
  endTime: number | null;
  audioRequired: boolean | null;
  audioStatus: AudioStatus;
  evaluationCoverage: EvaluationCoverage;
  evidenceCoverage: ScoreValue;
  keyframes: EvidenceFrame[];
  cameraMotion: string;
  primaryIssue: IssueTag["id"];
  issueTimestamp: number;
  coverageNote?: string;
  focusNote?: string;
  speechTimeRange?: { start: number; end: number };
}

export interface EvaluationResult {
  productId: Product["id"];
  dimensionScores: Partial<Record<EvaluationDimensionId, number | "NA">>;
  overallScore: number | null;
  validWeight: number;
}

export interface EvaluationSummary {
  overallScore: number;
  percentage: number;
  sampleSizePerDimension: number;
  status: string;
  disclaimer: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  frequentIssues: string[];
  representativeBadcaseIds: string[];
}

export type ProjectSummary = EvaluationSummary;

export interface VideoEvaluationProjectData {
  projectSlug: string;
  title: string;
  subtitle: string;
  englishName: string;
  badge: string;
  representativeCaseId: string;
  products: Product[];
  cases: VideoCase[];
  summary: EvaluationSummary;
}
