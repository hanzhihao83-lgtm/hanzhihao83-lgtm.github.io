import styles from "./ImageCaptionExecution.module.css";

const executionStages = [
  { index: "01", code: "SCHEMA", title: "定义字段与边界", body: "确定六类字段、写作顺序和不可推断内容。", output: "GUIDELINE V1" },
  { index: "02", code: "EVIDENCE", title: "标记视觉证据", body: "定位主体、属性、动作与关系对应的画面区域。", output: "EVIDENCE MAP" },
  { index: "03", code: "CAPTION", title: "合成自然描述", body: "依据字段结果生成事实优先、语序自然的 Caption。", output: "DRAFT CAPTION" },
  { index: "04", code: "REVIEW", title: "双重规则复核", body: "执行字段完整性检查与逐短语反向证据核验。", output: "REVIEW LOG" },
  { index: "05", code: "HARD CASE", title: "难例聚类回流", body: "将遮挡、反射、多主体等失败样本按标签归类。", output: "HARD CASE SET" },
  { index: "06", code: "VERSION", title: "规范迭代归档", body: "更新规则、样例与标签定义，保留版本变更记录。", output: "GUIDELINE VNEXT" },
];

export function ImageCaptionExecution() {
  return (
    <section aria-labelledby="caption-execution-title" className={styles.execution}>
      <header className={styles.header}>
        <div>
          <span>05 / EXECUTION</span>
          <p>PRODUCTION LOOP / VERSIONED</p>
        </div>
        <h2 id="caption-execution-title">从一张图，<br />走到一套规范。</h2>
        <p className={styles.intro}>
          执行不是一次性交付：样本经过证据标记、描述、复核和难例回流后，继续推动规则与版本迭代。
        </p>
      </header>

      <div className={styles.flowViewport} role="region" aria-label="图片描述横向执行流程" tabIndex={0}>
        <div aria-hidden="true" className={styles.flowTrack}><i /></div>
        <ol className={styles.flowList}>
          {executionStages.map((stage) => (
            <li key={stage.index}>
              <header><span>{stage.index}</span><p>{stage.code}</p></header>
              <div>
                <i aria-hidden="true" />
                <h3>{stage.title}</h3>
                <p>{stage.body}</p>
              </div>
              <footer><span>DELIVERABLE</span><strong>{stage.output}</strong></footer>
            </li>
          ))}
        </ol>
      </div>

      <footer className={styles.statusBar}>
        <span>LOOP STATUS</span>
        <div><i aria-hidden="true" />01–04 / PRODUCTION</div>
        <div><i aria-hidden="true" />05 / FEEDBACK</div>
        <div><i aria-hidden="true" />06 / VERSIONING</div>
        <strong>TRACEABLE PIPELINE</strong>
      </footer>
    </section>
  );
}
