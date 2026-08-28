import type {
  EvaluationDimension,
  EvaluationDimensionId,
  IssueTag,
  ScoreLevel,
} from "@/types/evaluation";

const tags = (
  dimension: EvaluationDimensionId,
  values: Array<[id: string, label: string]>,
): IssueTag[] => values.map(([id, label]) => ({ id, label, dimension }));

export const scoreLevels: ScoreLevel[] = [
  { score: 1, label: "完全不可用", description: "核心目标未实现，存在严重错误。" },
  { score: 2, label: "明显不足", description: "仅完成少量要求，主要问题显著影响使用。" },
  { score: 3, label: "部分可用", description: "完成部分要求，但存在明显缺陷。" },
  { score: 4, label: "基本可用", description: "主要要求已经完成，仅存在局部瑕疵。" },
  { score: 5, label: "稳定可用", description: "完整满足当前维度要求，没有明显问题。" },
];

export const evaluationDimensions: EvaluationDimension[] = [
  {
    id: "instruction-following",
    name: "指令遵循",
    englishName: "INSTRUCTION FOLLOWING",
    definition: "判断视频是否完成原始提示词中明确要求的主体、数量、特征、动作、场景、道具、镜头、风格、台词和声音事件。",
    method: "完整阅读提示词，逐项对照画面与声音中可验证的明确要求。",
    exclusion: "不在此评价运动是否流畅或画面是否精美。",
    color: "#b9ff43",
    weight: 0.25,
    issueTags: tags("instruction-following", [
      ["if-total-failure", "完全不遵循"], ["if-missing-subject", "主体缺失"],
      ["if-wrong-count", "主体数量错误"], ["if-wrong-trait", "主体特征不符"],
      ["if-action-incomplete", "动作未完成"], ["if-wrong-order", "动作顺序错误"],
      ["if-wrong-scene", "场景不符"], ["if-missing-prop", "道具缺失"],
      ["if-camera", "镜头未遵循"], ["if-style", "风格未遵循"],
      ["if-dialogue", "台词不符"], ["if-sound", "声音要求未遵循"],
      ["if-extra", "出现多余内容"], ["if-other", "其他指令偏离"],
      ["if-action-partial", "动作未完整表现"], ["if-camera-partial", "镜头未完全遵循"],
    ]),
  },
  {
    id: "motion-quality",
    name: "运动质量",
    englishName: "MOTION QUALITY",
    definition: "静音判断主体运动、局部运动、物体运动和镜头运动是否连续、自然、完整并符合物理规律。",
    method: "静音完整观看，并对动作起止、速度、轨迹和镜头运动进行连续检查。",
    exclusion: "不因清晰度、色彩或构图问题在此维度扣分。",
    color: "#9d8cff",
    weight: 0.2,
    issueTags: tags("motion-quality", [
      ["mq-stutter", "运动卡顿"], ["mq-frame-skip", "跳帧"], ["mq-teleport", "主体瞬移"],
      ["mq-incomplete", "动作不完整"], ["mq-rigid", "动作僵硬"], ["mq-speed", "速度异常"],
      ["mq-direction", "运动方向错误"], ["mq-limb", "肢体运动异常"], ["mq-physics", "物理规律错误"],
      ["mq-freeze", "局部冻结"], ["mq-shake", "镜头抖动"], ["mq-camera-jump", "运镜突变"],
      ["mq-depth", "前后景运动不协调"], ["mq-blur", "动态模糊异常"], ["mq-loop", "循环动作明显"],
      ["mq-transition-rigid", "动作衔接略生硬"], ["mq-water-feedback", "水体反馈轻微异常"],
    ]),
  },
  {
    id: "visual-quality",
    name: "画面质量",
    englishName: "VISUAL QUALITY",
    definition: "判断单帧和整体画面的清晰度、完整度、构图、光影、色彩、材质、纹理和视觉瑕疵。",
    method: "静音检查关键帧和典型画面，记录可定位的单帧或整体视觉问题。",
    exclusion: "跨帧身份或外观变化归入一致性，不在这里重复扣分。",
    color: "#51d6ff",
    weight: 0.2,
    issueTags: tags("visual-quality", [
      ["vq-blurry", "清晰度低"], ["vq-resolution", "分辨率不足"], ["vq-deform", "主体变形"],
      ["vq-face", "人脸崩坏"], ["vq-hand", "手部异常"], ["vq-limb", "肢体结构错误"],
      ["vq-object", "物体结构错误"], ["vq-fusion", "主体与环境融合"], ["vq-intersection", "穿模"],
      ["vq-text", "文字乱码"], ["vq-texture", "纹理异常"], ["vq-material", "材质失真"],
      ["vq-light", "光影错误"], ["vq-color", "色彩异常"], ["vq-exposure", "曝光异常"],
      ["vq-composition", "构图失衡"], ["vq-noise", "画面噪点"], ["vq-ghosting", "重影"],
      ["vq-edge", "边缘伪影"], ["vq-compression", "压缩痕迹"],
      ["vq-subject-detail", "主体细节不足"], ["vq-material-coverage", "关键材质未覆盖"],
    ]),
  },
  {
    id: "temporal-consistency",
    name: "一致性",
    englishName: "TEMPORAL CONSISTENCY",
    definition: "判断主体身份、外观特征、物体属性、场景结构、光影关系和视觉风格在视频前后是否稳定。",
    method: "连续观察前后帧，比较身份、属性、空间、光影和风格是否发生无依据变化。",
    exclusion: "单帧结构或画质问题归入画面质量，不在这里重复扣分。",
    color: "#f2b15b",
    weight: 0.2,
    issueTags: tags("temporal-consistency", [
      ["tc-identity", "主体身份漂移"], ["tc-face", "人脸漂移"], ["tc-clothes", "服装变化"],
      ["tc-accessory", "配饰变化"], ["tc-color", "颜色漂移"], ["tc-texture", "纹理漂移"],
      ["tc-shape", "主体形态突变"], ["tc-count", "物体数量变化"], ["tc-appear", "物体凭空出现"],
      ["tc-disappear", "物体凭空消失"], ["tc-scene", "场景结构变化"], ["tc-flicker", "背景闪烁"],
      ["tc-light", "光影跳变"], ["tc-style", "风格漂移"], ["tc-scale", "比例变化"],
      ["tc-space", "空间关系错误"], ["tc-cut", "镜头衔接断裂"],
      ["tc-prop-structure", "道具结构漂移"], ["tc-umbrella-shape", "雨伞形态变化"],
      ["tc-hand-prop", "手部与道具关系不稳定"],
    ]),
  },
  {
    id: "audio-visual-sync",
    name: "音画同步",
    englishName: "AUDIO-VISUAL SYNC",
    definition: "开启声音后，判断声音发生的时间、来源、内容、材质、距离和情绪是否与画面事件匹配。",
    method: "主动开启声音，逐项核对口型、事件时点、声源、内容、材质、距离与情绪。",
    exclusion: "提示词未要求声音且素材无音轨时标记为 N/A，不参与综合得分。",
    color: "#ff6d57",
    weight: 0.15,
    issueTags: tags("audio-visual-sync", [
      ["av-lip", "口型不同步"], ["av-early", "声音提前"], ["av-delay", "声音延迟"],
      ["av-missing", "动作音效缺失"], ["av-extra", "出现多余音效"], ["av-source", "音效来源错误"],
      ["av-material", "材质声音不匹配"], ["av-ambient", "环境音不匹配"], ["av-dialogue", "台词内容不符"],
      ["av-voice", "人物音色不匹配"], ["av-emotion", "情绪不匹配"], ["av-distance", "距离感不匹配"],
      ["av-cut", "声音突然中断"], ["av-event", "音画事件错位"], ["av-silent", "应有声音但完全无声"],
      ["av-timeline", "事件时序偏移"], ["av-train-early", "列车事件提前"],
      ["av-spatial-direction", "空间声方向不够明确"],
    ]),
  },
];

export const evaluationProcess = [
  "阅读原始提示词。",
  "静音观看完整视频，评估运动质量。",
  "静音检查关键帧，评估画面质量。",
  "连续观察前后帧，评估一致性。",
  "开启声音观看，评估音画同步。",
  "回到原始提示词，评估指令遵循。",
] as const;

export const allIssueTags = evaluationDimensions.flatMap((dimension) => dimension.issueTags);

export function getScoreLevel(score: number) {
  return scoreLevels.find((level) => level.score === score);
}
