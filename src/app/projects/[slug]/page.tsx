import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MultiTurnVQAProject } from "@/components/MultiTurnVQA/MultiTurnVQAProject";
import { BlindEvaluationProject } from "@/components/BlindEvaluation/BlindEvaluationProject";
import { ProjectCase } from "@/components/ProjectCase/ProjectCase";
import { VideoEvaluationProject } from "@/components/VideoEvaluation/VideoEvaluationProject";
import { getProject, projects } from "@/data/projects";
import type { ProjectSlug } from "@/types/content";

interface ProjectPageProps { params: Promise<{ slug: ProjectSlug }> }

export const dynamicParams = false;
export function generateStaticParams() { return projects.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  return project ? { title: project.title, description: project.summary } : {};
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  if (project.slug === "i2v-evaluation") return <VideoEvaluationProject project={project} />;
  if (project.slug === "project-02") return <MultiTurnVQAProject project={project} />;
  if (project.slug === "project-04") return <BlindEvaluationProject project={project} />;
  return <ProjectCase project={project} />;
}
