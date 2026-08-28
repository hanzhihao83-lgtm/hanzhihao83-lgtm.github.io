"use client";

import Image from "next/image";
import {
  type CSSProperties,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import styles from "./ImageCaptionCases.module.css";

interface CaptionAnchor {
  label: string;
  x: number;
  y: number;
}

interface ImageCaptionCase {
  id: string;
  title: string;
  image: string;
  task: string;
  caption: string;
  subjects: string;
  attributes: string;
  actions: string;
  relations: string;
  scene: string;
  anchors: CaptionAnchor[];
}

const imageCaptionCases: ImageCaptionCase[] = [
  {
    id: "IC-01",
    title: "雨后车站",
    image: "/images/projects/project-03/caption-station-rain.jpg",
    task: "空间关系 / 场景描述",
    caption:
      "雨后的车站站台上，一名撑透明雨伞的男子站在铁轨旁，银色列车从他面前经过，黑色背包放在他的右侧，左侧设有红色自动售货机。",
    subjects: "撑伞男子、银色列车、黑色背包、自动售货机",
    attributes: "透明雨伞、银色车身、黑色背包、红色机身",
    actions: "男子站立等候，列车正从站台前方经过",
    relations: "背包位于男子右侧，售货机位于画面左侧，列车经过男子前方",
    scene: "雨后车站站台，傍晚蓝调光线，地面留有积水反射",
    anchors: [
      { label: "撑伞男子", x: 51, y: 40 },
      { label: "银色列车", x: 76, y: 47 },
      { label: "黑色背包", x: 59, y: 65 },
      { label: "红色售货机", x: 7, y: 48 },
    ],
  },
  {
    id: "IC-02",
    title: "桌面静物",
    image: "/images/projects/project-03/caption-desk-still-life.jpg",
    task: "物体属性 / 相对位置",
    caption:
      "夕阳照亮木质桌面，红色陶瓷杯位于黄色书本左侧，黑色钢笔斜放在书本上，相机位于杯子后方，右后方摆放着绿色植物。",
    subjects: "红色陶瓷杯、黄色书本、黑色钢笔、相机、绿色植物",
    attributes: "陶瓷杯呈红色，书本为黄色，钢笔为黑色，桌面为木质",
    actions: "静物保持静止，夕阳从窗外照入桌面",
    relations: "杯子位于书本左侧，相机在杯子后方，钢笔斜放于书本上方，植物位于右后方",
    scene: "室内窗边桌面，夕阳时段，暖橙色侧逆光",
    anchors: [
      { label: "红色陶瓷杯", x: 29, y: 61 },
      { label: "黄色书本", x: 67, y: 73 },
      { label: "相机", x: 46, y: 51 },
      { label: "绿色植物", x: 76, y: 34 },
    ],
  },
  {
    id: "IC-03",
    title: "街头市场",
    image: "/images/projects/project-03/caption-market-relations.jpg",
    task: "多人关系 / 动作识别",
    caption:
      "市场摊主正在把纸袋递给背着浅蓝色帆布包的顾客，右侧另一位顾客正在挑选橙子，左侧自行车靠在摊位旁，前景摆放着黄色花束。",
    subjects: "市场摊主、两位顾客、自行车、橙子、黄色花束",
    attributes: "浅蓝色帆布包、橙色水果、黄色花束、木质摊位",
    actions: "摊主递交纸袋，中间顾客接取，右侧顾客挑选橙子",
    relations: "纸袋位于摊主与顾客之间，自行车靠在左侧摊位旁，花束位于前景",
    scene: "城市街头市场，日间自然光，多人物交易场景",
    anchors: [
      { label: "递交纸袋", x: 47, y: 31 },
      { label: "浅蓝色帆布包", x: 61, y: 49 },
      { label: "挑选橙子", x: 78, y: 46 },
      { label: "黄色花束", x: 26, y: 72 },
    ],
  },
  {
    id: "IC-04",
    title: "玻璃后的阅读者",
    image: "/images/projects/project-03/caption-cafe-reflection.jpg",
    task: "反射识别 / 遮挡判断",
    caption:
      "一名穿灰色毛衣的女性坐在咖啡馆窗边阅读，桌上放着蓝色杯子，玻璃倒映出红色公交车、路灯和树枝，左侧空椅上搭着米色围巾。",
    subjects: "阅读女性、蓝色杯子、红色公交车倒影、空椅与围巾",
    attributes: "灰色毛衣、蓝色杯子、红色车身、米色围巾",
    actions: "女性在窗边阅读，公交车倒影经过玻璃表面",
    relations: "杯子位于女性前方，围巾搭在左侧空椅上，公交车、路灯与树枝通过玻璃反射叠加",
    scene: "傍晚咖啡馆窗边，室内暖光与室外冷光交叠",
    anchors: [
      { label: "阅读女性", x: 73, y: 49 },
      { label: "蓝色杯子", x: 50, y: 66 },
      { label: "公交车倒影", x: 24, y: 46 },
      { label: "米色围巾", x: 19, y: 72 },
    ],
  },
];

const subscribeToReducedMotion = (onStoreChange: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
};

const getReducedMotionSnapshot = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getReducedMotionServerSnapshot = () => false;

function anchorStyle(anchor: CaptionAnchor) {
  return { "--anchor-x": `${anchor.x}%`, "--anchor-y": `${anchor.y}%` } as CSSProperties;
}

export function ImageCaptionCases() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const activeCase = imageCaptionCases[activeIndex];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: "0px 0px -8%" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <section
      aria-labelledby="image-caption-cases-title"
      className={styles.section}
      data-visible={isVisible || prefersReducedMotion ? "true" : "false"}
      ref={sectionRef}
    >
      <header className={styles.sectionHeader}>
        <div>
          <span>IMAGE CASES / 04</span>
          <h2 id="image-caption-cases-title">图片描述案例</h2>
        </div>
        <p>STRUCTURED CAPTION / VISUAL EVIDENCE</p>
      </header>

      <div className={styles.caseGrid}>
        {imageCaptionCases.map((item, index) => {
          const isActive = index === activeIndex;
          const enterStyle = { "--enter-delay": `${index * 100}ms` } as CSSProperties;

          return (
            <article className={styles.caseCard} data-active={isActive ? "true" : "false"} key={item.id} style={enterStyle}>
              <div className={styles.cardHeading}>
                <div>
                  <span>{item.id}</span>
                  <h3>{item.title}</h3>
                </div>
                <p>{item.task}</p>
              </div>

              <button
                aria-label={`查看 ${item.id} ${item.title}的结构化描述`}
                aria-pressed={isActive}
                className={styles.visualButton}
                data-visible={isVisible || prefersReducedMotion ? "true" : "false"}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                <Image
                  alt={`${item.title}图片描述案例：${item.caption}`}
                  className={styles.caseImage}
                  height={1024}
                  loading="lazy"
                  sizes="(max-width: 760px) calc(100vw - 2.2rem), (max-width: 1200px) calc(50vw - 3rem), 640px"
                  src={item.image}
                  width={1536}
                />
                <span aria-hidden="true" className={styles.imageGrid} />
                <span className={styles.taskOverlay}>{item.task}</span>
                {isActive ? (
                  <>
                    <span aria-hidden="true" className={styles.scanLine} />
                    <span aria-hidden="true" className={styles.anchors}>
                      {item.anchors.map((anchor) => (
                        <span className={styles.anchor} key={anchor.label} style={anchorStyle(anchor)}>
                          <i />
                          <b>{anchor.label}</b>
                        </span>
                      ))}
                    </span>
                  </>
                ) : null}
              </button>
            </article>
          );
        })}
      </div>

      <article
        aria-live="polite"
        className={styles.descriptionPanel}
        key={activeCase.id}
      >
        <header className={styles.panelHeader}>
          <div>
            <span>{activeCase.id} / ACTIVE CAPTION</span>
            <h3>{activeCase.title}</h3>
          </div>
          <p><i aria-hidden="true" />CAPTION READY</p>
        </header>

        <p className={styles.caption}>{activeCase.caption}</p>

        <dl className={styles.fieldGrid}>
          <div><dt>主体 / SUBJECT</dt><dd>{activeCase.subjects}</dd></div>
          <div><dt>属性 / ATTRIBUTE</dt><dd>{activeCase.attributes}</dd></div>
          <div><dt>动作 / ACTION</dt><dd>{activeCase.actions}</dd></div>
          <div><dt>关系 / RELATION</dt><dd>{activeCase.relations}</dd></div>
          <div><dt>场景 / SCENE</dt><dd>{activeCase.scene}</dd></div>
        </dl>
      </article>
    </section>
  );
}
