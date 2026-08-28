import type { Metadata } from "next";
import { VisualNotesArchive } from "@/components/VisualNotes/VisualNotesArchive";

export const metadata: Metadata = { title: "视觉笔记档案", description: "围绕色调、角度、构图、光影与镜头语言整理的可滚动视觉研究档案。" };
export default function VisualNotesPage() { return <VisualNotesArchive />; }
