import styles from "./ImageCaptionContext.module.css";

const contextFields = [
  { index: "01", label: "SUBJECT", value: "主体" },
  { index: "02", label: "ATTRIBUTE", value: "属性" },
  { index: "03", label: "ACTION", value: "动作" },
  { index: "04", label: "RELATION", value: "关系" },
  { index: "05", label: "SCENE", value: "场景" },
  { index: "06", label: "STYLE", value: "风格" },
];

export function ImageCaptionContext() {
  return (
    <section aria-labelledby="caption-context-title" className={styles.context}>
      <header className={styles.heading}>
        <div>
          <span>01 / CONTEXT</span>
          <p>WHY STRUCTURED CAPTION</p>
        </div>
        <h2 id="caption-context-title">
          让每条描述，
          <br />
          都能回到画面证据。
        </h2>
      </header>

      <div className={styles.contentGrid}>
        <div className={styles.story}>
          <p className={styles.lead}>
            项目面向图像描述类 SFT 数据生产。传统自由文本容易把可见事实、主观判断与风格词混在一起，
            造成主体遗漏、空间关系漂移，以及描述结果无法回查。
          </p>
          <p>
            因此，我将单张图像拆解为主体、属性、动作、关系、场景与风格六类字段，
            要求每一项描述都绑定可指认的视觉证据，最后再合成为自然、稳定、可复用的 Caption。
          </p>

          <dl className={styles.metaGrid}>
            <div>
              <dt>DATA USE</dt>
              <dd>多模态 SFT / 图像理解</dd>
            </div>
            <div>
              <dt>CORE RISK</dt>
              <dd>遗漏 · 幻觉 · 关系漂移</dd>
            </div>
            <div>
              <dt>OUTPUT</dt>
              <dd>可复核的结构化描述</dd>
            </div>
          </dl>
        </div>

        <div className={styles.systemMap}>
          <div className={styles.mapHeader}>
            <span>CAPTION PIPELINE / 01</span>
            <p><i aria-hidden="true" />EVIDENCE LOCKED</p>
          </div>

          <div className={styles.sourceRow}>
            <div>
              <span>INPUT / RAW IMAGE</span>
              <strong>画面事实</strong>
            </div>
            <i aria-hidden="true">→</i>
            <div>
              <span>RISK / FREE CAPTION</span>
              <strong>描述不稳定</strong>
            </div>
          </div>

          <div aria-hidden="true" className={styles.signalLine}><i /></div>

          <div className={styles.fieldMatrix}>
            {contextFields.map((field) => (
              <div key={field.label}>
                <span>{field.index}</span>
                <p>{field.label}</p>
                <strong>{field.value}</strong>
              </div>
            ))}
          </div>

          <div className={styles.resultRow}>
            <span>STRUCTURED OUTPUT</span>
            <p>VISIBLE FACTS</p>
            <i aria-hidden="true">→</i>
            <p>CHECKABLE FIELDS</p>
            <i aria-hidden="true">→</i>
            <strong>NATURAL CAPTION</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
