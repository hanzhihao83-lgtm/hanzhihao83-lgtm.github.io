import styles from "./ImageCaptionRuleSystem.module.css";

const captionRules = [
  {
    index: "01",
    code: "SUBJECT COVERAGE",
    title: "主体完整",
    check: "主要人物、物体和核心事件不得遗漏，主次对象必须清楚。",
    tag: "MISS_SUBJECT",
  },
  {
    index: "02",
    code: "ATTRIBUTE GROUNDING",
    title: "属性准确",
    check: "颜色、材质、数量和外观必须与画面证据保持一致。",
    tag: "ATTR_ERROR",
  },
  {
    index: "03",
    code: "RELATION CLARITY",
    title: "关系清晰",
    check: "左右、前后、遮挡、动作和人物互动需要明确且无歧义。",
    tag: "RELATION_DRIFT",
  },
  {
    index: "04",
    code: "STYLE CONTROL",
    title: "风格克制",
    check: "只使用画面能够支持的光线、氛围与风格词，避免过度修饰。",
    tag: "STYLE_OVERREACH",
  },
  {
    index: "05",
    code: "NO HALLUCINATION",
    title: "禁止幻觉",
    check: "不补充不可见的身份、意图、原因、品牌或画面外事件。",
    tag: "VISUAL_HALLUCINATION",
  },
  {
    index: "06",
    code: "LANGUAGE QUALITY",
    title: "语言自然",
    check: "表达简洁连贯，不重复堆词，不保留生硬的字段拼接痕迹。",
    tag: "LANGUAGE_REDUNDANCY",
  },
];

export function ImageCaptionRuleSystem() {
  return (
    <section aria-labelledby="caption-rules-title" className={styles.rules}>
      <header className={styles.header}>
        <div>
          <span>04 / RULE SYSTEM</span>
          <p>CHECKABLE RULES / ISSUE TAGS</p>
        </div>
        <h2 id="caption-rules-title">规则与<br />问题标签</h2>
        <p className={styles.intro}>
          每条规则同时定义“什么是正确”和“错误如何记录”，让审核结论可以追踪、聚类并回流到下一版规范。
        </p>
      </header>

      <div className={styles.ruleConsole}>
        <div className={styles.consoleBar}>
          <span>RULE REGISTRY / 06</span>
          <p><i aria-hidden="true" />EVIDENCE REQUIRED</p>
          <strong>TAG SET / V1.0</strong>
        </div>

        <div className={styles.ruleGrid}>
          {captionRules.map((rule) => (
            <article key={rule.index}>
              <header>
                <span>{rule.index}</span>
                <p>{rule.code}</p>
              </header>
              <div>
                <h3>{rule.title}</h3>
                <p>{rule.check}</p>
              </div>
              <footer>
                <span>ISSUE TAG</span>
                <strong>{rule.tag}</strong>
              </footer>
            </article>
          ))}
        </div>

        <footer className={styles.consoleFooter}>
          <span>REVIEW LOGIC</span>
          <p>看得见</p><i>→</i><p>说得准</p><i>→</i><p>能回查</p>
          <strong>NO SCORE / RULE-BASED</strong>
        </footer>
      </div>
    </section>
  );
}
