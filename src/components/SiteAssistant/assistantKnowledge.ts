import { evaluationDimensions } from "@/data/evaluation-config";
import { projects } from "@/data/projects";
import { homeCopy } from "@/data/site";

export interface AssistantReply {
  text: string;
  href?: string;
  linkLabel?: string;
}

interface AssistantAnswer extends AssistantReply {
  id: string;
  keywords: string[];
}

export interface AssistantQuickQuestion {
  id: string;
  label: string;
  question: string;
}

export interface AssistantKnowledge {
  author: {
    name: string;
    englishName: string;
    intro: string;
  };
  welcome: string;
  quickQuestions: AssistantQuickQuestion[];
  answers: AssistantAnswer[];
  fallback: string;
}

export function createAssistantKnowledge(): AssistantKnowledge {
  const videoProject = projects.find((project) => project.slug === "i2v-evaluation");
  const vqaProject = projects.find((project) => project.slug === "project-02");
  const projectTitles = projects.map((project) => project.title).join("、");
  const dimensionNames = evaluationDimensions.map((dimension) => dimension.name).join("、");

  return {
    author: {
      name: "韩志浩",
      englishName: "HAN ZHIHAO",
      intro: homeCopy.intro,
    },
    welcome: "你好，我是小浩。我可以带你快速了解韩志浩的作品集。",
    quickQuestions: [
      { id: "featured", label: "查看精选项目", question: "带我看精选项目" },
      { id: "about", label: "介绍韩志浩", question: "介绍一下韩志浩" },
      { id: "projects", label: "有哪些项目", question: "有哪些项目" },
      { id: "video", label: "视频评测项目", question: "视频质量评测是什么" },
      { id: "vqa", label: "多轮视觉问答", question: "多轮视觉问答是什么" },
      { id: "contact", label: "如何联系", question: "怎么联系韩志浩" },
    ],
    answers: [
      {
        id: "home",
        keywords: ["回到首页", "返回首页"],
        text: "可以，我带你回到韩志浩的作品集首页。",
        href: "/#top",
        linkLabel: "回到首页 →",
      },
      {
        id: "featured",
        keywords: ["带我看精选项目", "查看精选项目", "精选项目"],
        text: "可以，从首页的四个项目案例开始看最合适。",
        href: "/#projects",
        linkLabel: "查看精选项目 →",
      },
      {
        id: "recommend",
        keywords: ["推荐一个项目", "推荐项目", "先看哪个"],
        text: "推荐先看AI视频生成质量评测，它完整展示了从观察、标签到评分的评测方法。",
        href: "/projects/i2v-evaluation/",
        linkLabel: "查看项目 →",
      },
      {
        id: "dimensions",
        keywords: ["五个评测维度", "五项评测维度", "评测维度", "五个维度"],
        text: "视频评测包含：" + dimensionNames + "。",
        href: "/projects/i2v-evaluation/",
        linkLabel: "查看项目 →",
      },
      {
        id: "video",
        keywords: ["视频质量评测是什么", "视频评测项目", "视频评测", "ai视频", "视频质量"],
        text: videoProject?.summary ?? "这个项目把主观观看体验整理为可观察、可解释、可复核的判断。",
        href: "/projects/i2v-evaluation/",
        linkLabel: "查看项目 →",
      },
      {
        id: "vqa",
        keywords: ["多轮视觉问答是什么", "多轮视觉问答", "视觉问答", "多轮对话"],
        text: vqaProject?.summary ?? "这个项目用结构化节点检查图像事实与多轮上下文是否持续一致。",
        href: "/projects/project-02/",
        linkLabel: "查看项目 →",
      },
      {
        id: "projects",
        keywords: ["有哪些项目", "项目有哪些", "作品有哪些", "你的项目"],
        text: "作品集目前包含：" + projectTitles + "。",
        href: "/#projects",
        linkLabel: "查看项目 →",
      },
      {
        id: "contact",
        keywords: ["怎么联系韩志浩", "怎么联系你", "如何联系", "联系方式", "联系韩志浩", "邮箱"],
        text: "可以到页面底部的联系区域查看作品集现有联系方式。",
        href: "/#footer-contact",
        linkLabel: "查看联系区域 →",
      },
      {
        id: "identity",
        keywords: ["韩志浩是谁", "介绍一下韩志浩", "介绍韩志浩", "你是谁", "关于韩志浩"],
        text: "韩志浩关注数字体验、视觉判断与内容系统，习惯把复杂问题整理成清晰、可复用的方法。",
        href: "/#top",
        linkLabel: "查看个人介绍 →",
      },
    ],
    fallback: "这个问题暂时没有写进作品集。你可以先查看相关项目，或者直接联系韩志浩。",
  };
}
