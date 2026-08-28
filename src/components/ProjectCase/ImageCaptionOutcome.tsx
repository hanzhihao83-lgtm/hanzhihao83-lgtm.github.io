import styles from "./ImageCaptionOutcome.module.css";

const outcomeAssets = [
  {
    index: "01",
    code: "CAPTION SCHEMA",
    value: "06",
    unit: "FIELDS",
    title: "结构化描述字段",
    body: "主体、属性、动作、关系、场景与风格形成统一的信息骨架。",
    meta: "SCHEMA / READY",
  },
  {
    index: "02",
    code: "RULE REGISTRY",
    value: "06",
    unit: "RULES",
    title: "规则与问题标签",
    body: "每条规则绑定唯一问题标签，让错误能够被记录、聚类与回查。",
    meta: "TAG SET / V1.0",
  },
  {
    index: "03",
    code: "REVIEW LOOP",
    value: "01",
    unit: "LOOP",
    title: "证据复核闭环",
    body: "从画面证据到自然描述，再回到逐短语核验与难例回流。",
    meta: "TRACE / ENABLED",
  },
];

const capabilities = [
  { index: "01", title: "视觉信息抽取", body: "把复杂画面拆成可指认、可复核的事实节点。" },
  { index: "02", title: "描述规范设计", body: "将离散字段组织成稳定且自然的语言表达。" },
  { index: "03", title: "质量问题治理", body: "用规则、标签和难例库推动规范持续迭代。" },
];

export function ImageCaptionOutcome() {
  return (
    <section aria-labelledby="caption-outcome-title" className={styles.outcome}>
      <header className={styles.header}>
        <div>
          <span>06 / OUTCOME</span>
          <p>METHOD ASSETS / CAPABILITY</p>
        </div>
        <h2 id="caption-outcome-title">结果不是一个数字，<br />而是一套可复用资产。</h2>
        <p className={styles.intro}>
          本案例不虚构数据规模与通过率，重点呈现已经建立的方法资产，以及它们如何支撑后续生产、复核与版本迭代。
        </p>
      </header>

      <div className={styles.assetConsole}>
        <div className={styles.consoleBar}>
          <span>ASSET REGISTRY / 03</span>
          <p><i aria-hidden="true" />METHOD READY</p>
          <strong>PUBLIC METRICS / PENDING</strong>
        </div>

        <div className={styles.assetGrid}>
          {outcomeAssets.map((asset) => (
            <article key={asset.index}>
              <header><span>{asset.index}</span><p>{asset.code}</p></header>
              <div className={styles.assetValue}><strong>{asset.value}</strong><i>{asset.unit}</i></div>
              <h3>{asset.title}</h3>
              <p>{asset.body}</p>
              <footer><span>{asset.meta}</span><i aria-hidden="true" /></footer>
            </article>
          ))}
        </div>

        <div className={styles.capabilityBand}>
          <div className={styles.bandLabel}>
            <span>CAPABILITY MAP</span>
            <strong>从方法到能力</strong>
          </div>
          <ol>
            {capabilities.map((capability) => (
              <li key={capability.index}>
                <span>{capability.index}</span>
                <div><strong>{capability.title}</strong><p>{capability.body}</p></div>
              </li>
            ))}
          </ol>
        </div>

        <footer className={styles.conclusion}>
          <span>PROJECT CONCLUSION</span>
          <p>建立“事实抽取—字段组织—自然描述—证据复核—难例回流”的完整链路，使图像描述从一次性文本产出转变为可检查、可复用、可持续迭代的数据方法。</p>
          <strong>REUSABLE / TRACEABLE / VERSIONED</strong>
        </footer>
      </div>
    </section>
  );
}
