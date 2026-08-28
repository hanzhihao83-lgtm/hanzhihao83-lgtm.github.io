export const WORKFLOW_SEEK_EVENT = "moonlit-duel:workflow-seek";

export interface WorkflowSeekDetail {
  nodeId: string;
  time: number;
}

export interface WorkflowNode {
  id: string;
  code: string;
  title: string;
  purpose: string;
  duration?: string;
  image?: string;
  seekTime?: number;
  tone?: "climax" | "output";
}

export interface WorkflowStage {
  id: string;
  index: string;
  title: string;
  shortTitle: string;
  nodes: WorkflowNode[];
}

export const workflowStages: WorkflowStage[] = [
  {
    id: "audio",
    index: "01",
    title: "声音定调",
    shortTitle: "声音",
    nodes: [
      {
        id: "aud-01",
        code: "AUD-01",
        title: "古钟声与雨夜环境音",
        duration: "00:14",
        purpose: "建立雨夜古寺的空间感，为镜头转场提供听觉连续性。",
      },
      {
        id: "aud-02",
        code: "AUD-02",
        title: "月下问剑配乐",
        duration: "02:51",
        purpose: "承担情绪曲线，从安静对峙逐步进入剑气交锋。",
      },
    ],
  },
  {
    id: "characters",
    index: "02",
    title: "角色锚点",
    shortTitle: "角色",
    nodes: [
      {
        id: "a1",
        code: "A1",
        title: "沈川",
        purpose: "白衣剑客角色锚点。锁定服装、发型、武器和人物气质。",
      },
      {
        id: "a2",
        code: "A2",
        title: "夜枭",
        purpose: "暗红披风角色锚点。保持角色外形、武器和红色剑气的视觉识别。",
      },
    ],
  },
  {
    id: "scenes",
    index: "03",
    title: "场景锚点",
    shortTitle: "场景",
    nodes: [
      {
        id: "s1",
        code: "S1",
        title: "悬崖古寺",
        purpose: "负责开场的地理建立与冷蓝月夜基调。",
      },
      {
        id: "s2",
        code: "S2",
        title: "庭院对峙",
        purpose: "定义角色站位、距离和主要交锋空间。",
      },
      {
        id: "s3",
        code: "S3",
        title: "屋脊场景",
        purpose: "用于动作过渡、空间延展和建筑关系保持。",
      },
    ],
  },
  {
    id: "shots",
    index: "04",
    title: "六镜头生成",
    shortTitle: "镜头",
    nodes: [
      {
        id: "shot-s01",
        code: "S01",
        title: "悬崖古寺航拍",
        purpose: "建立悬崖、古寺与冷蓝月夜的地理关系。",
        image: "/images/moving-image/moonlit-workflow-s01.jpg",
        seekTime: 1.2,
      },
      {
        id: "shot-s02",
        code: "S02",
        title: "雨夜对峙",
        purpose: "将沈川与夜枭放入雨院，建立交锋前的站位和距离。",
        image: "/images/moving-image/moonlit-workflow-s02.jpg",
        seekTime: 7.5,
      },
      {
        id: "shot-s03",
        code: "S03",
        title: "拔剑前奏特写",
        purpose: "承接拔剑前的停顿与力量积蓄，让节奏进入临战状态。",
        image: "/images/moving-image/moonlit-workflow-s03.jpg",
        seekTime: 15.5,
      },
      {
        id: "shot-s04",
        code: "S04",
        title: "首次交锋",
        purpose: "呈现第一次刀剑碰撞，推动叙事从对峙进入交锋。",
        image: "/images/moving-image/moonlit-workflow-s04.jpg",
        seekTime: 25.5,
      },
      {
        id: "shot-s05",
        code: "S05",
        title: "连续剑术对决",
        purpose: "连接庭院与屋脊中的连续动作段落，维持空间关系。",
        image: "/images/moving-image/moonlit-workflow-s05.jpg",
        seekTime: 39,
      },
      {
        id: "shot-s06",
        code: "S06",
        title: "红色剑气",
        purpose: "以红色剑气完成冲突高潮，并把动作段落带入收束。",
        image: "/images/moving-image/moonlit-workflow-s06.jpg",
        seekTime: 53,
        tone: "climax",
      },
    ],
  },
  {
    id: "edit",
    index: "05",
    title: "智能剪辑",
    shortTitle: "剪辑输出",
    nodes: [
      {
        id: "cut-01",
        code: "CUT-01",
        title: "智能剪辑时间线",
        purpose: "将环境音轨、配乐音轨与六段视频镜头组织进智能剪辑时间线。",
      },
      {
        id: "final-cut",
        code: "FINAL CUT",
        title: "月下双刃",
        purpose: "汇合画面、环境声与配乐，形成约 60 秒的最终成片。",
        tone: "output",
      },
    ],
  },
];
