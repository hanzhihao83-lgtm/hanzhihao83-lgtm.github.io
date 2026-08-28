import type { Metadata, Viewport } from "next";

import { CustomCursor } from "@/components/GlobalInteractions/CustomCursor";
import { GlobalRuntime } from "@/components/GlobalInteractions/GlobalRuntime";
import { PageTransition } from "@/components/GlobalInteractions/PageTransition";
import { SiteFooter } from "@/components/SiteFooter/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader/SiteHeader";
import { SiteAssistant } from "@/components/SiteAssistant/SiteAssistant";
import { profile, profileFallbacks, resolveProfileValue } from "@/data/profile";

import "./globals.css";

const displayName = resolveProfileValue(profile.name, profileFallbacks.name);
const displayRole = resolveProfileValue(profile.role, profileFallbacks.role);

export const metadata: Metadata = {
  metadataBase: new URL("https://myhanzhihao.cn"),
  title: { default: `${displayName} · ${displayRole}`, template: `%s · ${displayName}` },
  description: "项目案例、视觉笔记、摄影与动态影像组成的中文个人作品集。",
  openGraph: { title: `${displayName} · ${displayRole}`, description: "中文个人作品集", type: "website", locale: "zh_CN" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f1f0eb" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="zh-CN">
      <body>
        <a className="skip-link" href="#main-content">跳到主要内容</a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
        <PageTransition />
        <CustomCursor />
        <GlobalRuntime />
        <SiteAssistant />
      </body>
    </html>
  );
}
