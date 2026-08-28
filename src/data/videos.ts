import type { VideoWork } from "@/types/content";

export const videoWorks: VideoWork[] = [
  { id: "film-01", index: "01", title: "作品标题待替换", year: "年份待填写", duration: "00:00", type: "短片 / 类型待填写", poster: "/media/video-01.svg", source: null, description: "视频简介待填写。当前展示本地 poster 和完整播放器状态，替换 source 后即可播放。", presentation: "cinema" },
  { id: "film-02", index: "02", title: "作品标题待替换", year: "年份待填写", duration: "00:00", type: "影像随笔 / 类型待填写", poster: "/media/video-02.svg", source: null, description: "视频简介待填写。用户主动播放后才可开启声音，离开视口会自动暂停。", presentation: "split" },
  { id: "film-03", index: "03", title: "作品标题待替换", year: "年份待填写", duration: "00:00", type: "竖屏实验 / 类型待填写", poster: "/media/video-03.svg", source: null, description: "视频简介待填写。移动端采用延迟挂载策略，避免同时加载多个大视频。", presentation: "portrait" },
];
