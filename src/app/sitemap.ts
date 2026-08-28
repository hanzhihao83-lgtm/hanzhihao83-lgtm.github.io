import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://example.com";
  const routes = ["", "/visual-notes", "/photography", "/moving-image"];
  return [
    ...routes.map((route) => ({ url: `${baseUrl}${route}`, changeFrequency: "monthly" as const, priority: route === "" ? 1 : 0.7 })),
    ...projects.map((project) => ({ url: `${baseUrl}/projects/${project.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
