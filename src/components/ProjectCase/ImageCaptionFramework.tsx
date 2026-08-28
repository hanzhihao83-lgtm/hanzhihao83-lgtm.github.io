import styles from "./ImageCaptionFramework.module.css";

const frameworkStages = [
  {
    index: "01",
    code: "OBSERVE",
    title: "建立画面事实",
    body: "先确认画面中真实可见的主体、物体与事件，只记录证据，不提前推断动机或情绪。",
    input: "RAW IMAGE",
    output: "EVIDENCE MAP",
    marks: [true, true, true, false, false],
  },
  {
    index: "02",
    code: "DECOMPOSE",
    title: "拆解描述字段",
    body: "按主体、属性、动作、关系、场景和风格六类字段组织信息，避免描述无序堆叠。",
    input: "EVIDENCE MAP",
    output: "FIELD SET",
    marks: [true, true, true, true, false],
  },
  {
    index: "03",
    code: "COMPOSE",
    title: "合成自然描述",
    body: "遵循主体优先、先事实后修饰的语序，把离散字段合成为简洁、自然的 Caption。",
    input: "FIELD SET",
    output: "DRAFT CAPTION",
    marks: [true, true, true, true, true],
  },
  {
    index: "04",
    code: "VERIFY",
    title: "反向证据核验",
    body: "逐短语回查画面，删除无法指认的信息，并复核关系、指代、完整性与语言表达。",
    input: "DRAFT CAPTION",
    output: "CAPTION READY",
    marks: [true, true, true, true, true],
  },
];

export function ImageCaptionFramework() {
  return (
    <section aria-labelledby="caption-framework-title" className={styles.framework}>
      <header className={styles.header}>
        <div>
          <span>03 / FRAMEWORK</span>
          <p>EVIDENCE-FIRST WORKFLOW</p>
        </div>
        <h2 id="caption-framework-title">从看见，<br />到写对。</h2>
        <p className={styles.intro}>
          不直接生成一句话，而是让观察、拆解、合成和核验四个阶段都留下可以回查的中间结果。
        </p>
      </header>

      <div className={styles.pipeline}>
        <div aria-hidden="true" className={styles.track}>
          <i />
          {frameworkStages.map((stage) => <span key={stage.index} />)}
        </div>

        <div className={styles.stageGrid}>
          {frameworkStages.map((stage) => (
            <article key={stage.index}>
              <header>
                <span>{stage.index}</span>
                <p>{stage.code}</p>
              </header>

              <div className={styles.stageBody}>
                <h3>{stage.title}</h3>
                <p>{stage.body}</p>
              </div>

              <div aria-hidden="true" className={styles.markRow}>
                {stage.marks.map((active, index) => (
                  <i data-active={active ? "true" : "false"} key={`${stage.index}-${index}`} />
                ))}
              </div>

              <footer>
                <div><span>INPUT</span><p>{stage.input}</p></div>
                <i aria-hidden="true">→</i>
                <div><span>OUTPUT</span><strong>{stage.output}</strong></div>
              </footer>
            </article>
          ))}
        </div>
      </div>

      <footer className={styles.principleBar}>
        <span>GROUNDING PRINCIPLE</span>
        <strong>只描述看得见的事实</strong>
        <div><p>VISIBLE</p><i>→</i><p>TRACEABLE</p><i>→</i><p>REUSABLE</p></div>
      </footer>
    </section>
  );
}
