import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "404 · 页面未找到", description: "请求的页面不在当前作品集档案中。" };

export default function NotFound() {
  return (
    <section className="not-found">
      <span>ARCHIVE / NOT FOUND</span>
      <h1>404</h1>
      <div><p>这张页面不在当前档案中。</p><Link data-transition href="/" prefetch={false}>返回首页 ↗</Link></div>
    </section>
  );
}
