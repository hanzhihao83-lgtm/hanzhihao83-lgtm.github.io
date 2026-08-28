import type { Metadata } from "next";
import { HomePage } from "@/components/Home/HomePage";

export const metadata: Metadata = {
  title: "首页",
  description: "精选项目、视觉笔记、摄影与动态影像组成的中文个人作品集首页。",
};

export default function Page() {
  return <HomePage />;
}
