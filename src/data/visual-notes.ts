import type { NoteDimension, VisualNote } from "@/types/content";

export const noteDimensions: NoteDimension[] = [
  "色调", "角度", "构图", "景别", "光影", "焦距", "风格", "镜头语言",
];

const images = {
  warm: "/images/visual-notes/warm-balance.jpg",
  lowAngle: "/images/visual-notes/low-angle.jpg",
  negativeSpace: "/images/visual-notes/negative-space.jpg",
  wideShot: "/images/visual-notes/wide-shot.jpg",
  sideLight: "/images/visual-notes/side-light.jpg",
  compression: "/images/visual-notes/compression.jpg",
  editorial: "/images/visual-notes/editorial.jpg",
  rhythm: "/images/visual-notes/rhythm-cut.jpg",
} as const;

export const visualNotes: VisualNote[] = [
  {
    id: "warm-balance", index: "001", title: "色调对比", dimension: "色调",
    definition: "色调不是单一滤镜，而是画面中颜色、明度与环境光共同形成的整体倾向。",
    caption: "暖调、冷调与中性色调对照", image: images.warm,
    question: "这些画面分别是什么色调？",
    comparisons: [
      { id: "tone-warm", image: images.warm, label: "暖色调", observation: "琥珀、棕红与暖光占主导，暗部仍保留层次。", alt: "暖色灯光下的雨夜咖啡馆" },
      { id: "tone-cool", image: images.wideShot, label: "冷色调", observation: "蓝灰环境光统一画面，少量暖灯成为对比点。", alt: "蓝灰色雨后车站环境" },
      { id: "tone-neutral", image: images.negativeSpace, label: "中性色调", observation: "米白和灰色降低情绪强度，珊瑚色只承担视觉锚点。", alt: "中性色海边广场与珊瑚色人物" },
    ],
  },
  {
    id: "low-angle", index: "002", title: "角度对比", dimension: "角度",
    definition: "机位高度决定观众与主体的关系：仰视强调尺度，俯视交代结构，顶视把场景转化为图形。",
    caption: "仰视、俯视与顶视角度对照", image: images.lowAngle,
    question: "这些画面分别是什么拍摄角度？",
    comparisons: [
      { id: "angle-low", image: images.lowAngle, label: "低机位仰视", observation: "地面机位让桥柱向上汇聚，主体获得更强尺度感。", alt: "从地面仰拍高架桥和骑行者" },
      { id: "angle-high", image: images.wideShot, label: "高机位俯视", observation: "从高处向下观察，站台、列车与人物关系同时展开。", alt: "从高处俯拍雨后站台" },
      { id: "angle-top", image: images.editorial, label: "近顶视角", observation: "接近垂直向下的视点，将物体关系整理为平面网格。", alt: "近顶视角拍摄的设计工作台" },
    ],
  },
  {
    id: "negative-space", index: "003", title: "构图对比", dimension: "构图",
    definition: "构图决定视觉重量如何分配。留白负责停顿，对角线制造方向，网格建立秩序。",
    caption: "负空间、对角线与网格构图对照", image: images.negativeSpace,
    question: "这些画面使用了什么构图方式？",
    comparisons: [
      { id: "composition-space", image: images.negativeSpace, label: "负空间构图", observation: "主体集中在右下区域，大面积天空形成叙事停顿。", alt: "大量留白的海边站亭画面" },
      { id: "composition-diagonal", image: images.sideLight, label: "对角线构图", observation: "斜向光束切开画面，同时引导视线落到静物主体。", alt: "斜向硬光照亮工作室静物" },
      { id: "composition-grid", image: images.editorial, label: "网格构图", observation: "照片、色卡和标尺沿隐形网格排列，建立清晰层级。", alt: "按照网格排列的编辑设计工作台" },
    ],
  },
  {
    id: "wide-shot", index: "004", title: "景别对比", dimension: "景别",
    definition: "景别控制信息密度：全景建立环境，中景描述人物状态，近景强调材质与局部关系。",
    caption: "全景、中景与近景对照", image: images.wideShot,
    question: "这些画面分别属于什么景别？",
    comparisons: [
      { id: "shot-wide", image: images.wideShot, label: "环境全景", observation: "人物比例很小，站台、列车和城市共同交代空间。", alt: "人物比例很小的雨后车站全景" },
      { id: "shot-medium", image: images.warm, label: "人物中景", observation: "人物与咖啡馆环境同时可读，适合呈现状态与氛围。", alt: "咖啡馆窗边人物中景" },
      { id: "shot-close", image: images.sideLight, label: "近景与细节", observation: "器物、布料与侧脸占据主要画面，强调材质和光线。", alt: "工作室器物和人物侧脸近景" },
    ],
  },
  {
    id: "side-light", index: "005", title: "光影对比", dimension: "光影",
    definition: "光线方向与软硬程度共同塑造体积。硬光强调边界，柔光降低反差，环境光建立情绪。",
    caption: "侧向硬光、阴天柔光与实景暖光对照", image: images.sideLight,
    question: "这些画面使用了什么光线？",
    comparisons: [
      { id: "light-hard", image: images.sideLight, label: "侧向硬光", observation: "明确的明暗切线塑造器物体积，阴影边缘清晰。", alt: "侧向硬光下的陶器静物" },
      { id: "light-soft", image: images.negativeSpace, label: "阴天柔光", observation: "云层扩大光源，反差较低，人物与环境过渡柔和。", alt: "阴天柔光下的海边广场" },
      { id: "light-practical", image: images.warm, label: "实景暖光", observation: "吊灯、街灯与橱窗反射共同形成多层环境光。", alt: "咖啡馆吊灯和街灯形成的暖光" },
    ],
  },
  {
    id: "compression", index: "006", title: "焦距对比", dimension: "焦距",
    definition: "焦距改变空间关系：广角放大前后距离，标准视角接近人眼，长焦压缩层次。",
    caption: "广角、标准与长焦视角对照", image: images.compression,
    question: "这些画面更接近哪种焦距表现？",
    comparisons: [
      { id: "lens-wide", image: images.lowAngle, label: "广角透视", observation: "近处桥柱被放大，线条快速汇聚，空间纵深明显。", alt: "广角仰拍高架桥" },
      { id: "lens-normal", image: images.warm, label: "标准视角", observation: "人物与环境比例自然，空间感接近日常观看体验。", alt: "自然透视的咖啡馆人物画面" },
      { id: "lens-tele", image: images.compression, label: "长焦压缩", observation: "远近街区被拉近，人物与建筑层层叠加。", alt: "长焦拍摄的密集城市街道" },
    ],
  },
  {
    id: "editorial", index: "007", title: "风格对比", dimension: "风格",
    definition: "风格来自选材、色彩、构图和叙事距离的共同选择，而不是单独套用滤镜。",
    caption: "编辑静物、纪实电影感与都市叙事对照", image: images.editorial,
    question: "这些画面分别呈现什么视觉风格？",
    comparisons: [
      { id: "style-editorial", image: images.editorial, label: "编辑静物", observation: "克制色彩、网格和材质细节让信息本身成为视觉。", alt: "克制网格风格的编辑工作台" },
      { id: "style-documentary", image: images.wideShot, label: "纪实电影感", observation: "真实环境、天气和小人物关系共同构成场景叙事。", alt: "雨后车站的纪实电影感画面" },
      { id: "style-urban", image: images.warm, label: "都市叙事", observation: "人物、玻璃反射和街灯共同建立带情绪的城市片段。", alt: "雨夜咖啡馆的都市叙事画面" },
    ],
  },
  {
    id: "rhythm-cut", index: "008", title: "镜头语言对比", dimension: "镜头语言",
    definition: "单张画面也能暗示时间：重复和运动形成节拍，静态留白制造停顿，全景负责建立场景。",
    caption: "运动节拍、静态停顿与建立镜头对照", image: images.rhythm,
    question: "这些画面分别传达什么镜头语言？",
    comparisons: [
      { id: "language-rhythm", image: images.rhythm, label: "运动节拍", observation: "列车横向运动与重复柱体形成连续视觉重音。", alt: "列车和行人形成运动节拍的站台" },
      { id: "language-pause", image: images.negativeSpace, label: "静态停顿", observation: "大面积留白和静止人物延长观看时间，形成呼吸。", alt: "以留白制造静态停顿的海边画面" },
      { id: "language-establish", image: images.wideShot, label: "建立镜头", observation: "先交代城市、站台、列车和人物，为后续叙事定位。", alt: "交代完整空间关系的车站建立镜头" },
    ],
  },
];

export const visualNotesIntro = {
  volume: "VOL. 01 / VISUAL RESEARCH",
  title: "视觉笔记档案",
  description: "把模糊的“好看”拆成可描述、可比较、可复用的观察语言。八个维度各设置三图对照，通过提问、观察和答案回查建立视觉判断。",
} as const;
