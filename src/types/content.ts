export type ProjectSlug =
  | "i2v-evaluation"
  | "project-02"
  | "project-03"
  | "project-04";

export type ProjectVisual = "console" | "dialogue" | "caption" | "matrix";

export interface Metric {
  label: string;
  value: string;
  note: string;
}

export interface ProjectSection {
  title: string;
  body: string;
}

export interface Project {
  slug: ProjectSlug;
  index: string;
  eyebrow: string;
  title: string;
  shortTitle: string;
  summary: string;
  type: string;
  period: string;
  year: string;
  accent: string;
  surface: string;
  visual: ProjectVisual;
  cover: string;
  tags: string[];
  capabilities: string[];
  background: string;
  challenge: string;
  framework: ProjectSection[];
  rules: string[];
  process: string[];
  metrics: Metric[];
  outcome: string;
}

export type NoteDimension =
  | "色调"
  | "角度"
  | "构图"
  | "景别"
  | "光影"
  | "焦距"
  | "风格"
  | "镜头语言";

export interface VisualNote {
  id: string;
  index: string;
  title: string;
  dimension: NoteDimension;
  definition: string;
  caption: string;
  image: string;
  question: string;
  comparisons: VisualComparison[];
}

export interface VisualComparison {
  id: string;
  image: string;
  label: string;
  observation: string;
  alt: string;
}

export type PhotoCategory = "城市" | "人物" | "建筑" | "夜景" | "日常";

export interface Photograph {
  id: string;
  index: string;
  title: string;
  category: PhotoCategory;
  location: string;
  year: string;
  image: string;
  width: number;
  height: number;
  alt: string;
  description: string;
}

export interface VideoWork {
  id: string;
  index: string;
  title: string;
  year: string;
  duration: string;
  type: string;
  poster: string;
  source: string | null;
  description: string;
  presentation: "cinema" | "split" | "portrait";
}

export interface Tag {
  id: string;
  label: string;
}
