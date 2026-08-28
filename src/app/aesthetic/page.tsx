import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "视觉档案已迁移", description: "视觉笔记档案的新入口。" };
export default function AestheticAliasPage() {
  return <section className="legacy-route"><span>ARCHIVE MOVED</span><h1>视觉档案已迁移。</h1><Link data-transition href="/visual-notes/" prefetch={false}>进入视觉笔记 ↗</Link></section>;
}
