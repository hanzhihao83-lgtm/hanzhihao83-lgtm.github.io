import { getScoreLevel } from "../evaluation-config.ts";
import type { VideoCase, VideoEvaluationProjectData } from "@/types/evaluation";

type NewVideoCase = Omit<VideoCase, "scoreLabel"> & { scoreLabel?: string | null };

export function defineVideoCase(input: NewVideoCase): VideoCase {
  const scoreLabel = typeof input.score === "number"
    ? getScoreLevel(input.score)?.label ?? null
    : input.score === "NA" ? "不适用" : null;
  return { ...input, scoreLabel: input.scoreLabel ?? scoreLabel };
}

const productId = "kling-ai-3-omni";

export const i2vEvaluationProject: VideoEvaluationProjectData = {
  projectSlug: "i2v-evaluation",
  title: "AI视频生成质量评测",
  subtitle: "把主观体验转化为可观察、可解释、可复核的判断",
  englishName: "AI VIDEO QUALITY EVALUATION",
  badge: "CASE DEMO / N=1 PER DIMENSION",
  representativeCaseId: "instruction-following-001",
  products: [
    {
      id: productId,
      name: "可灵AI 3.0 Omni",
      shortName: "KLING 3.0 OMNI",
      note: "五个维度各选取一条代表案例，用于展示评测方法。",
    },
  ],
  cases: [
    defineVideoCase({
      id: "instruction-following-001",
      caseId: "IF-001",
      title: "雨后车站与流星",
      product: productId,
      dimension: "instruction-following",
      score: 4,
      weight: 0.25,
      video: "/videos/i2v-evaluation/instruction-following-001.mp4",
      poster: "/images/i2v-evaluation/instruction-following-001.webp",
      promptSummary: "雨后城市车站天台，一名年轻人站在栏杆旁；远处列车驶过，湿润地面倒映夕阳，天空出现巨大积雨云；镜头缓慢向右移动并轻微推进，人物抬头后出现流星。",
      observableFacts: [
        "正确生成单一人物、雨后天台、高架列车和巨大积雨云。",
        "画面具有蓝紫色天空与橙金色夕阳。",
        "湿润地面形成明显倒影。",
        "镜头存在缓慢横向移动。",
        "视频结尾正确出现流星。",
        "人物抬头动作较轻微。",
        "镜头向前推进的效果不明显。",
        "头发和衣角受风运动不明显。",
      ],
      issueTags: ["if-action-partial", "if-camera-partial"],
      evaluatorNote: "核心场景和主要事件基本完成，但人物动作及镜头推进要求表现不够充分。",
      startTime: 0,
      endTime: null,
      audioRequired: false,
      audioStatus: "available",
      evaluationCoverage: "标准",
      evidenceCoverage: 4,
      cameraMotion: "SLOW PAN RIGHT",
      primaryIssue: "if-camera-partial",
      issueTimestamp: 3.1,
      keyframes: [
        {
          id: "if-001-frame-01", frameLabel: "F01", timestamp: 0.3, imageSrc: "/images/i2v-evaluation/evidence/if-001-frame-01.webp", title: "主体建立", englishTitle: "SUBJECT ESTABLISHED", promptMatch: 4,
          facts: ["正确生成单一人物、雨后天台、高架列车和巨大积雨云。", "湿润地面形成明显倒影。"],
          annotations: [
            { id: "if-f1-subject", label: "单一人物", x: 0.12, y: 0.7, targetX: 0.29, targetY: 0.72, type: "subject", color: "accent", factIndex: 0 },
            { id: "if-f1-scene", label: "雨后天台", x: 0.7, y: 0.84, targetX: 0.57, targetY: 0.77, type: "object", color: "accent", factIndex: 1 },
          ],
        },
        {
          id: "if-001-frame-02", frameLabel: "F02", timestamp: 1.6, imageSrc: "/images/i2v-evaluation/evidence/if-001-frame-02.webp", title: "列车通过", englishTitle: "TRAIN PASSES", promptMatch: 4,
          facts: ["远处高架列车出现在画面中。", "画面具有蓝紫色天空与橙金色夕阳。", "人物主体与场景关系保持稳定。"],
          annotations: [
            { id: "if-f2-train", label: "列车", x: 0.62, y: 0.54, targetX: 0.55, targetY: 0.61, type: "motion", color: "accent", factIndex: 0 },
            { id: "if-f2-color", label: "冷暖天空", x: 0.7, y: 0.18, targetX: 0.58, targetY: 0.3, type: "object", color: "accent", factIndex: 1 },
          ],
        },
        {
          id: "if-001-frame-03", frameLabel: "F03", timestamp: 3.1, imageSrc: "/images/i2v-evaluation/evidence/if-001-frame-03.webp", title: "镜头右移", englishTitle: "CAMERA PANS RIGHT", promptMatch: 4, issueTag: "if-camera-partial",
          facts: ["镜头存在缓慢横向移动。", "镜头向前推进的效果不明显。", "人物抬头动作较轻微。"],
          annotations: [
            { id: "if-f3-camera", label: "镜头方向 →", x: 0.69, y: 0.84, targetX: 0.86, targetY: 0.84, type: "motion", color: "accent", factIndex: 0 },
            { id: "if-f3-push", label: "推进不足", x: 0.14, y: 0.18, targetX: 0.32, targetY: 0.4, type: "issue", color: "issue", factIndex: 1 },
          ],
        },
        {
          id: "if-001-frame-04", frameLabel: "F04", timestamp: 4.6, imageSrc: "/images/i2v-evaluation/evidence/if-001-frame-04.webp", title: "流星出现", englishTitle: "METEOR APPEARS", promptMatch: 4, issueTag: "if-camera-partial",
          facts: ["天空出现明亮流星轨迹。", "列车持续横向通过画面。", "人物主体与场景关系稳定。"],
          annotations: [
            { id: "if-f4-subject", label: "人物主体", x: 0.08, y: 0.65, targetX: 0.3, targetY: 0.74, type: "subject", color: "accent", factIndex: 2 },
            { id: "if-f4-train", label: "列车", x: 0.51, y: 0.55, targetX: 0.45, targetY: 0.64, type: "motion", color: "accent", factIndex: 1 },
            { id: "if-f4-meteor", label: "流星", x: 0.75, y: 0.16, targetX: 0.61, targetY: 0.31, type: "object", color: "accent", factIndex: 0 },
            { id: "if-f4-direction", label: "镜头方向 →", x: 0.76, y: 0.87, targetX: 0.9, targetY: 0.87, type: "issue", color: "issue", factIndex: 2 },
          ],
        },
      ],
    }),
    defineVideoCase({
      id: "motion-quality-001",
      caseId: "MQ-001",
      title: "跑步跨越水洼",
      product: productId,
      dimension: "motion-quality",
      score: 4,
      weight: 0.2,
      video: "/videos/i2v-evaluation/motion-quality-001.mp4",
      poster: "/images/i2v-evaluation/motion-quality-001.webp",
      promptSummary: "年轻男性在雨后天台快速跑动，跨过水洼后自然落地，继续跑动并减速停下；镜头侧面跟拍，同时包含头发、衣物、水花、倒影和远处列车运动。",
      observableFacts: [
        "人物跑步方向和身体重心整体连续。",
        "跑步、腾空、落地和继续前进形成完整动作链。",
        "跨越水洼时出现水花反馈。",
        "落地后身体存在一定缓冲动作。",
        "镜头基本保持稳定侧向跟随。",
        "人物身体比例在运动过程中较稳定。",
        "部分动作阶段被压缩，起跳、落地和减速衔接略快。",
        "水花与脚部接触关系存在轻微不自然。",
      ],
      issueTags: ["mq-transition-rigid", "mq-water-feedback"],
      evaluatorNote: "运动主体完整且总体连续，没有明显冻结或瞬移，但复杂动作在五秒内略显压缩。",
      startTime: 0,
      endTime: null,
      audioRequired: false,
      audioStatus: "available",
      evaluationCoverage: "标准",
      evidenceCoverage: 4,
      cameraMotion: "STABLE SIDE TRACK",
      primaryIssue: "mq-transition-rigid",
      issueTimestamp: 3.1,
      keyframes: [
        {
          id: "mq-001-frame-01", frameLabel: "F01", timestamp: 0.3, imageSrc: "/images/i2v-evaluation/evidence/mq-001-frame-01.webp", title: "起跑", englishTitle: "RUN BEGINS", promptMatch: 4,
          facts: ["人物跑步方向和身体重心整体连续。", "人物身体比例在运动过程中较稳定。"],
          annotations: [
            { id: "mq-f1-body", label: "身体姿态", x: 0.14, y: 0.22, targetX: 0.32, targetY: 0.5, type: "subject", color: "accent", factIndex: 1 },
            { id: "mq-f1-trace", label: "运动轨迹 →", x: 0.55, y: 0.82, targetX: 0.8, targetY: 0.82, type: "motion", color: "accent", factIndex: 0 },
          ],
        },
        {
          id: "mq-001-frame-02", frameLabel: "F02", timestamp: 1.6, imageSrc: "/images/i2v-evaluation/evidence/mq-001-frame-02.webp", title: "接近水洼", englishTitle: "APPROACHES PUDDLE", promptMatch: 4,
          facts: ["跑步、腾空、落地和继续前进形成完整动作链。", "镜头基本保持稳定侧向跟随。"],
          annotations: [
            { id: "mq-f2-takeoff", label: "起跳点", x: 0.23, y: 0.73, targetX: 0.38, targetY: 0.75, type: "motion", color: "accent", factIndex: 0 },
            { id: "mq-f2-camera", label: "侧向跟拍", x: 0.7, y: 0.2, targetX: 0.84, targetY: 0.2, type: "motion", color: "accent", factIndex: 1 },
          ],
        },
        {
          id: "mq-001-frame-03", frameLabel: "F03", timestamp: 3.1, imageSrc: "/images/i2v-evaluation/evidence/mq-001-frame-03.webp", title: "跨越动作", englishTitle: "PUDDLE CROSSING", promptMatch: 4, issueTag: "mq-water-feedback",
          facts: ["跨越水洼时出现水花反馈。", "水花与脚部接触关系存在轻微不自然。", "人物身体比例在运动过程中较稳定。"],
          annotations: [
            { id: "mq-f3-apex", label: "腾空阶段", x: 0.26, y: 0.18, targetX: 0.43, targetY: 0.42, type: "motion", color: "accent", factIndex: 2 },
            { id: "mq-f3-water", label: "水体反馈", x: 0.63, y: 0.77, targetX: 0.52, targetY: 0.72, type: "issue", color: "issue", factIndex: 1 },
          ],
        },
        {
          id: "mq-001-frame-04", frameLabel: "F04", timestamp: 4.6, imageSrc: "/images/i2v-evaluation/evidence/mq-001-frame-04.webp", title: "落地恢复", englishTitle: "LANDING RECOVERY", promptMatch: 4, issueTag: "mq-transition-rigid",
          facts: ["落地后身体存在一定缓冲动作。", "部分动作阶段被压缩，起跳、落地和减速衔接略快。", "没有出现明显冻结或瞬移。"],
          annotations: [
            { id: "mq-f4-land", label: "落地点", x: 0.6, y: 0.76, targetX: 0.5, targetY: 0.73, type: "motion", color: "accent", factIndex: 0 },
            { id: "mq-f4-transition", label: "衔接偏快", x: 0.68, y: 0.28, targetX: 0.53, targetY: 0.46, type: "issue", color: "issue", factIndex: 1 },
          ],
        },
      ],
    }),
    defineVideoCase({
      id: "visual-quality-001",
      caseId: "VQ-001",
      title: "雨后天台画面质量",
      product: productId,
      dimension: "visual-quality",
      score: 4,
      weight: 0.2,
      video: "/videos/i2v-evaluation/visual-quality-001.mp4",
      poster: "/images/i2v-evaluation/visual-quality-001.webp",
      promptSummary: "5秒单镜头从人物腰部以上中近景缓慢推进至面部、双手与透明雨伞近景，重点检查人物细节、雨伞透明材质、光影、倒影与画面稳定性。",
      originalPrompt: `生成一段5秒、16:9、24fps、单镜头连续拍摄的高精度原创日系二维动画电影质感视频。

雨后黄昏的城市车站天台，一名黑色短发的年轻男性穿白色短袖衬衫和深灰色长裤，站在栏杆旁，双手自然握住一把透明雨伞的弧形手柄。

镜头从人物腰部以上的中近景开始，以非常缓慢、稳定的速度向前推进，最终停留在人物面部、双手和透明雨伞的近景。不要切换镜头，不要快速运动。

人物面部五官必须自然清晰，双手完整可见，每只手具有五根手指，关节和握持姿势正常。透明雨伞需要保持正确透明度和弧形结构，伞面带有细小雨珠，八根金属伞骨清晰完整。白色衬衫具有自然褶皱，湿润地面正确反射人物、雨伞、栏杆和天空。

金色夕阳从画面右侧照射，人物右侧形成柔和轮廓光。天空呈蓝紫色与橙金色的冷暖对比，巨大积雨云具有清晰体积和边缘光。人物位于画面左侧三分线附近，天空占据约三分之二画面。

人物只进行轻微呼吸、眨眼和头发随风摆动，所有人物、服装、雨伞、场景和光影细节在视频前后保持稳定。

负面要求：低清晰度、模糊、噪点、重影、人脸崩坏、五官错位、手指缺失、多余手指、手部融合、雨伞变形、伞骨断裂、透明材质错误、穿模、纹理漂移、光源方向错误、倒影错误、过度曝光、背景混乱、文字、字幕、水印和Logo。`,
      observableFacts: [
        "视频为1920×1080，整体画面清晰。",
        "天空、积雨云和夕阳具有较好的明暗层次。",
        "冷暖色彩关系自然。",
        "湿润地面倒影清晰，构图具有空间纵深。",
        "栏杆、高架铁路和远景层次基本完整。",
        "运动中的人物轮廓总体可辨。",
        "人物距离镜头较远，无法充分检查面部、手指和衣物微小细节。",
        "视频没有按画面质量测试目标呈现透明雨伞近景。",
        "快速运动阶段存在轻微细节损失。",
      ],
      issueTags: ["vq-subject-detail", "vq-material-coverage"],
      evaluatorNote: "整体构图、色彩和光影质量较好，但镜头距离较远，对人脸、手部和透明材质的评测覆盖不足。",
      startTime: 0,
      endTime: null,
      audioRequired: false,
      audioStatus: "available",
      evaluationCoverage: "有限",
      evidenceCoverage: 3,
      cameraMotion: "SIDE TRACK / LIMITED COVERAGE",
      primaryIssue: "vq-material-coverage",
      issueTimestamp: 4.6,
      keyframes: [
        {
          id: "vq-001-frame-01", frameLabel: "F01", timestamp: 0.3, imageSrc: "/images/i2v-evaluation/evidence/vq-001-frame-01.webp", title: "构图建立", englishTitle: "COMPOSITION ESTABLISHED", promptMatch: 4,
          facts: ["视频为1920×1080，整体画面清晰。", "湿润地面倒影清晰，构图具有空间纵深。"],
          annotations: [
            { id: "vq-f1-subject", label: "人物边缘", x: 0.12, y: 0.45, targetX: 0.31, targetY: 0.57, type: "subject", color: "accent", factIndex: 0 },
            { id: "vq-f1-depth", label: "空间纵深", x: 0.69, y: 0.76, targetX: 0.54, targetY: 0.68, type: "object", color: "accent", factIndex: 1 },
          ],
        },
        {
          id: "vq-001-frame-02", frameLabel: "F02", timestamp: 1.6, imageSrc: "/images/i2v-evaluation/evidence/vq-001-frame-02.webp", title: "云层细节", englishTitle: "CLOUD DETAIL", promptMatch: 4,
          facts: ["天空、积雨云和夕阳具有较好的明暗层次。", "冷暖色彩关系自然。"],
          annotations: [
            { id: "vq-f2-cloud", label: "云层体积", x: 0.63, y: 0.16, targetX: 0.51, targetY: 0.3, type: "object", color: "accent", factIndex: 0 },
            { id: "vq-f2-light", label: "冷暖光区", x: 0.12, y: 0.23, targetX: 0.3, targetY: 0.34, type: "object", color: "accent", factIndex: 1 },
          ],
        },
        {
          id: "vq-001-frame-03", frameLabel: "F03", timestamp: 3.1, imageSrc: "/images/i2v-evaluation/evidence/vq-001-frame-03.webp", title: "水面倒影", englishTitle: "GROUND REFLECTION", promptMatch: 4,
          facts: ["湿润地面倒影清晰，构图具有空间纵深。", "栏杆、高架铁路和远景层次基本完整。"],
          annotations: [
            { id: "vq-f3-reflection", label: "地面倒影", x: 0.62, y: 0.8, targetX: 0.48, targetY: 0.73, type: "object", color: "accent", factIndex: 0 },
            { id: "vq-f3-edges", label: "结构边缘", x: 0.68, y: 0.49, targetX: 0.56, targetY: 0.57, type: "object", color: "accent", factIndex: 1 },
          ],
        },
        {
          id: "vq-001-frame-04", frameLabel: "F04", timestamp: 4.6, imageSrc: "/images/i2v-evaluation/evidence/vq-001-frame-04.webp", title: "光影保持", englishTitle: "LIGHTING HOLDS", promptMatch: 4, issueTag: "vq-material-coverage",
          facts: ["人物距离镜头较远，无法充分检查面部、手指和衣物微小细节。", "视频没有按画面质量测试目标呈现透明雨伞近景。", "快速运动阶段存在轻微细节损失。"],
          annotations: [
            { id: "vq-f4-subject", label: "主体细节不足", x: 0.1, y: 0.47, targetX: 0.31, targetY: 0.55, type: "issue", color: "issue", factIndex: 0 },
            { id: "vq-f4-material", label: "材质未覆盖", x: 0.66, y: 0.72, targetX: 0.52, targetY: 0.64, type: "issue", color: "issue", factIndex: 1 },
          ],
        },
      ],
      coverageNote: "这条视频内容更接近运动质量案例，暂作画面质量案例使用，不能视为完整的画面质量测试。",
      focusNote: "需要补充人物、人脸、手部与透明雨伞材质的近景样本。",
    }),
    defineVideoCase({
      id: "temporal-consistency-001",
      caseId: "TC-001",
      title: "人物转身与道具一致性",
      product: productId,
      dimension: "temporal-consistency",
      score: 3,
      weight: 0.2,
      video: "/videos/i2v-evaluation/temporal-consistency-001.mp4",
      poster: "/images/i2v-evaluation/temporal-consistency-001.webp",
      promptSummary: "5秒单镜头记录人物由背面转向正面、举伞靠肩并抬头眨眼，重点检查身份、服装、配饰、雨伞结构、场景与光影在运动前后的稳定性。",
      originalPrompt: `生成一段5秒、16:9、24fps、单镜头连续拍摄的原创日系二维动画电影质感视频。

雨后黄昏的城市车站天台，一名年轻女性独自站在栏杆前。整个视频必须严格保持人物身份、服装、配饰、道具、身体比例、场景结构、光源方向和绘画风格一致。

固定人物设定：

- 黑色齐肩短发，长度始终到肩部。
- 右侧头发佩戴一枚红色三角形发夹。
- 棕色眼睛。
- 穿白色短袖衬衫，衣领带有两条深蓝色细线。
- 穿深蓝色长裙，裙摆到小腿位置。
- 左肩背棕色帆布包。
- 右手握住一把透明雨伞。
- 雨伞具有红色弧形手柄和八根银色伞骨。
- 左手腕佩戴蓝色手链。

第0–1.5秒，镜头位于人物背后，人物安静望向远处。

第1.5–3秒，人物缓慢向右转身，镜头同时从人物左后方平稳环绕至正面。转身过程中，脸部、发型、服装、背包、手链和雨伞不能发生变化。

第3–4秒，人物面对镜头，抬起右手中的透明雨伞，将雨伞轻轻靠在右肩。雨伞结构、颜色、手柄和伞骨数量保持一致。

第4–5秒，镜头缓慢推进到胸部近景，人物抬头看向天空并轻轻眨眼。红色发夹始终位于人物头部右侧，棕色帆布包始终位于左肩，蓝色手链始终位于左手腕。

固定场景包括白色金属栏杆、绿色高架铁路、右侧灰白色居民楼、左侧小型车站建筑、中央蓝紫色积雨云和湿润反光地面。金色夕阳始终从画面右侧照射。建筑、电线、栏杆和铁路的位置关系保持稳定。

全程不得出现人物身份漂移、人脸变化、发型变化、发夹换边、服装变色、背包换肩、手链换手、雨伞变形、伞骨数量变化、身体比例变化、物体凭空出现或消失、背景闪烁、光源变化、风格漂移、镜头跳切、文字、字幕、水印或Logo。`,
      observableFacts: [
        "人物从背面转向正面后身份基本稳定。",
        "黑色长发、红色发夹、白色上衣和深蓝色下装整体保持一致。",
        "红色发夹在人物右侧，前后位置基本正确。",
        "棕色背包保持在人物左肩。",
        "人物脸型和年龄没有出现明显改变。",
        "背景栏杆、铁路与建筑结构整体稳定。",
        "透明雨伞的伞骨、弧度和展开结构在转身过程中明显变化。",
        "雨伞部分边缘出现结构漂移。",
        "手部与雨伞手柄的连接关系不够稳定。",
        "蓝色手链缺少足够清晰的持续呈现。",
      ],
      issueTags: ["tc-prop-structure", "tc-umbrella-shape", "tc-hand-prop"],
      evaluatorNote: "人物身份和主要服装较稳定，但透明雨伞存在明显结构变化，因此只能达到部分可用。",
      startTime: 0,
      endTime: null,
      audioRequired: false,
      audioStatus: "available",
      evaluationCoverage: "标准",
      evidenceCoverage: 3,
      cameraMotion: "SLOW ORBIT TO FRONT",
      primaryIssue: "tc-umbrella-shape",
      issueTimestamp: 4.6,
      keyframes: [
        {
          id: "tc-001-frame-01", frameLabel: "F01", timestamp: 0.3, imageSrc: "/images/i2v-evaluation/evidence/tc-001-frame-01.webp", title: "人物建立", englishTitle: "IDENTITY ESTABLISHED", promptMatch: 3,
          facts: ["人物从背面转向正面后身份基本稳定。", "背景栏杆、铁路与建筑结构整体稳定。"],
          annotations: [
            { id: "tc-f1-identity", label: "人物身份", x: 0.12, y: 0.34, targetX: 0.32, targetY: 0.56, type: "subject", color: "accent", factIndex: 0 },
            { id: "tc-f1-scene", label: "场景基准", x: 0.67, y: 0.72, targetX: 0.54, targetY: 0.61, type: "object", color: "accent", factIndex: 1 },
          ],
        },
        {
          id: "tc-001-frame-02", frameLabel: "F02", timestamp: 1.6, imageSrc: "/images/i2v-evaluation/evidence/tc-001-frame-02.webp", title: "雨伞出现", englishTitle: "UMBRELLA REVEALED", promptMatch: 3,
          facts: ["黑色长发、红色发夹、白色上衣和深蓝色下装整体保持一致。", "棕色背包保持在人物左肩。"],
          annotations: [
            { id: "tc-f2-style", label: "服装与发型", x: 0.1, y: 0.26, targetX: 0.34, targetY: 0.47, type: "subject", color: "accent", factIndex: 0 },
            { id: "tc-f2-prop", label: "透明雨伞", x: 0.66, y: 0.31, targetX: 0.54, targetY: 0.46, type: "object", color: "accent", factIndex: 1 },
          ],
        },
        {
          id: "tc-001-frame-03", frameLabel: "F03", timestamp: 3.1, imageSrc: "/images/i2v-evaluation/evidence/tc-001-frame-03.webp", title: "遮挡变化", englishTitle: "OCCLUSION CHANGES", promptMatch: 3, issueTag: "tc-hand-prop",
          facts: ["雨伞部分边缘出现结构漂移。", "手部与雨伞手柄的连接关系不够稳定。", "人物脸型和年龄没有出现明显改变。"],
          annotations: [
            { id: "tc-f3-edge", label: "伞面边缘", x: 0.64, y: 0.2, targetX: 0.54, targetY: 0.38, type: "issue", color: "issue", factIndex: 0 },
            { id: "tc-f3-hand", label: "手柄连接", x: 0.68, y: 0.63, targetX: 0.53, targetY: 0.57, type: "issue", color: "issue", factIndex: 1 },
          ],
        },
        {
          id: "tc-001-frame-04", frameLabel: "F04", timestamp: 4.6, imageSrc: "/images/i2v-evaluation/evidence/tc-001-frame-04.webp", title: "形变暴露", englishTitle: "DEFORMATION EXPOSED", promptMatch: 3, issueTag: "tc-umbrella-shape",
          facts: ["透明雨伞的伞骨、弧度和展开结构在转身过程中明显变化。", "雨伞部分边缘出现结构漂移。", "蓝色手链缺少足够清晰的持续呈现。"],
          annotations: [
            { id: "tc-f4-shape", label: "雨伞形变", x: 0.67, y: 0.2, targetX: 0.52, targetY: 0.37, type: "issue", color: "issue", factIndex: 0 },
            { id: "tc-f4-edge", label: "结构漂移", x: 0.69, y: 0.53, targetX: 0.55, targetY: 0.48, type: "issue", color: "issue", factIndex: 1 },
            { id: "tc-f4-person", label: "身份稳定", x: 0.12, y: 0.34, targetX: 0.36, targetY: 0.5, type: "subject", color: "accent", factIndex: 2 },
          ],
        },
      ],
      focusNote: "重点观察：透明雨伞的伞骨、弧度、展开结构，以及手部与伞柄的连接关系。",
    }),
    defineVideoCase({
      id: "audio-visual-sync-001",
      caseId: "AVS-001",
      title: "脚步、台词与列车同步",
      product: productId,
      dimension: "audio-visual-sync",
      score: 4,
      weight: 0.15,
      video: "/videos/i2v-evaluation/audio-visual-sync-001.mp4",
      poster: "/images/i2v-evaluation/audio-visual-sync-001.webp",
      promptSummary: "人物行走时出现同步脚步和水花声；停下后说出“雨停了，我们走吧”；随后远处列车从左向右驶过并出现对应声音。",
      observableFacts: [
        "视频包含AAC立体声音轨。",
        "实际语音可以识别为“雨停了，我们走吧”。",
        "台词内容完整，没有识别出多余台词。",
        "语音大约从2.16秒开始，到4.34秒结束。",
        "人物正面说话时的嘴部运动与语音时段基本重合。",
        "说话前人物处于行走阶段。",
        "列车在人物说话尚未结束时已经进入画面，早于原始时间线要求。",
        "列车声音的左右空间移动效果不够明确。",
        "环境声音没有明显盖过人物台词。",
      ],
      issueTags: ["av-timeline", "av-train-early", "av-spatial-direction"],
      evaluatorNote: "台词内容准确，人物口型与语音时段基本匹配；列车事件与预设时间线存在偏移，空间声音表现仍有提升空间。",
      startTime: 0,
      endTime: null,
      audioRequired: true,
      audioStatus: "available",
      evaluationCoverage: "标准",
      evidenceCoverage: 4,
      cameraMotion: "STABLE FRAME / EVENT TIMING",
      primaryIssue: "av-train-early",
      issueTimestamp: 3.1,
      keyframes: [
        {
          id: "avs-001-frame-01", frameLabel: "F01", timestamp: 0.3, imageSrc: "/images/i2v-evaluation/evidence/avs-001-frame-01.webp", title: "脚步开始", englishTitle: "WALKING BEGINS", promptMatch: 4,
          facts: ["视频包含AAC立体声音轨。", "说话前人物处于行走阶段。"],
          annotations: [
            { id: "avs-f1-step", label: "行走阶段", x: 0.12, y: 0.66, targetX: 0.34, targetY: 0.7, type: "motion", color: "accent", factIndex: 1 },
            { id: "avs-f1-track", label: "音轨可用", x: 0.67, y: 0.18, targetX: 0.81, targetY: 0.18, type: "audio", color: "accent", factIndex: 0 },
          ],
        },
        {
          id: "avs-001-frame-02", frameLabel: "F02", timestamp: 1.6, imageSrc: "/images/i2v-evaluation/evidence/avs-001-frame-02.webp", title: "踏地事件", englishTitle: "FOOTFALL EVENT", promptMatch: 4,
          facts: ["说话前人物处于行走阶段。", "语音大约从2.16秒开始。"],
          annotations: [
            { id: "avs-f2-foot", label: "画面事件", x: 0.16, y: 0.7, targetX: 0.36, targetY: 0.71, type: "motion", color: "accent", factIndex: 0 },
            { id: "avs-f2-voice", label: "VOICE 之前", x: 0.67, y: 0.2, targetX: 0.8, targetY: 0.2, type: "audio", color: "accent", factIndex: 1 },
          ],
        },
        {
          id: "avs-001-frame-03", frameLabel: "F03", timestamp: 3.1, imageSrc: "/images/i2v-evaluation/evidence/avs-001-frame-03.webp", title: "环境声音", englishTitle: "VOICE AND TRAIN OVERLAP", promptMatch: 4, issueTag: "av-train-early",
          facts: ["人物正面说话时的嘴部运动与语音时段基本重合。", "列车在人物说话尚未结束时已经进入画面，早于原始时间线要求。", "环境声音没有明显盖过人物台词。"],
          annotations: [
            { id: "avs-f3-mouth", label: "口型时段", x: 0.12, y: 0.3, targetX: 0.35, targetY: 0.46, type: "audio", color: "accent", factIndex: 0 },
            { id: "avs-f3-train", label: "列车提前", x: 0.66, y: 0.56, targetX: 0.53, targetY: 0.61, type: "issue", color: "issue", factIndex: 1 },
          ],
        },
        {
          id: "avs-001-frame-04", frameLabel: "F04", timestamp: 4.6, imageSrc: "/images/i2v-evaluation/evidence/avs-001-frame-04.webp", title: "结束对齐", englishTitle: "VOICE WINDOW ENDS", promptMatch: 4, issueTag: "av-spatial-direction",
          facts: ["台词内容完整，没有识别出多余台词。", "实际语音可以识别为“雨停了，我们走吧”。", "列车声音的左右空间移动效果不够明确。"],
          annotations: [
            { id: "avs-f4-voice", label: "VOICE 结束", x: 0.12, y: 0.23, targetX: 0.35, targetY: 0.46, type: "audio", color: "accent", factIndex: 0 },
            { id: "avs-f4-space", label: "空间声不明确", x: 0.65, y: 0.62, targetX: 0.53, targetY: 0.6, type: "issue", color: "issue", factIndex: 2 },
          ],
        },
      ],
      focusNote: "VOICE WINDOW / 2.16–4.34 SEC",
      speechTimeRange: { start: 2.16, end: 4.34 },
    }),
  ],
  summary: {
    overallScore: 3.8,
    percentage: 76,
    sampleSizePerDimension: 1,
    status: "案例演示",
    disclaimer: "当前结果基于每个维度一条代表案例，仅用于展示评测方法与案例分析，不代表对产品整体能力的统计性结论。",
    strengths: [
      "场景、氛围和核心视觉元素完成度较高。",
      "人物运动总体连续。",
      "整体画面构图和光影表现良好。",
      "指定中文台词能够正确生成。",
      "人物身份在转身过程中基本稳定。",
    ],
    weaknesses: [
      "复杂动作在短时长内衔接略显压缩。",
      "画面质量案例缺少近景细节覆盖。",
      "透明雨伞存在明显结构漂移。",
      "音画事件时间线没有完全按照提示词执行。",
      "所有视频右下角均存在平台水印。",
    ],
    recommendations: [
      "重新生成一条人物和透明雨伞近景作为画面质量案例。",
      "一致性测试减少道具复杂度，或使用固定首帧进行图生视频。",
      "音画同步测试将台词和列车事件拆分为更清楚的时间段。",
      "正式对外发布时使用拥有合法权限的无水印导出文件。",
    ],
    frequentIssues: ["复杂动作衔接压缩", "透明雨伞结构漂移", "音画事件时序偏移"],
    representativeBadcaseIds: ["TC-001"],
  },
};
