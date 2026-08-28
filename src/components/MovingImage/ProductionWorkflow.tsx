"use client";

import Image from "next/image";
import { type CSSProperties, useState } from "react";
import { WORKFLOW_SEEK_EVENT, type WorkflowNode, type WorkflowStage, workflowStages } from "./workflowData";
import styles from "./ProductionWorkflow.module.css";

interface Selection { node: WorkflowNode; stage: WorkflowStage; stageIndex: number; }

function NodeDetail({ selection }: { selection: Selection }) {
  return <div className={styles.detail} aria-live="polite" aria-atomic="true">
    <div className={styles.detailIdentity}><span>{selection.node.code}</span><strong>{selection.node.title}</strong></div>
    <p>{selection.node.purpose}</p>
    <dl>
      <div><dt>STAGE</dt><dd>{selection.stage.index} / {selection.stage.title}</dd></div>
      {selection.node.duration ? <div><dt>DURATION</dt><dd>{selection.node.duration}</dd></div> : null}
      {selection.node.seekTime !== undefined ? <div><dt>FILM CUE</dt><dd>{selection.node.seekTime.toFixed(1)} SEC</dd></div> : null}
    </dl>
  </div>;
}

export function ProductionWorkflow() {
  const [selection, setSelection] = useState<Selection>(() => ({ node: workflowStages[0].nodes[0], stage: workflowStages[0], stageIndex: 0 }));

  const selectNode = (node: WorkflowNode, stage: WorkflowStage, stageIndex: number) => {
    setSelection({ node, stage, stageIndex });
    if (node.seekTime !== undefined) {
      window.dispatchEvent(new CustomEvent(WORKFLOW_SEEK_EVENT, { detail: { nodeId: node.id, time: node.seekTime } }));
    }
  };

  return <section
    className={styles.workflow}
    aria-labelledby="workflow-heading"
    data-production-workflow
    style={{ "--workflow-progress": selection.stageIndex / (workflowStages.length - 1) } as CSSProperties}
  >
    <header className={styles.header}>
      <div><span>02 / PRODUCTION WORKFLOW</span><h2 id="workflow-heading">从锚点，<br />到成片。</h2></div>
      <p>把 Liblib 画布中的复杂节点整理成可以阅读的创作链路：声音定调、角色与场景锚定、六镜头生成，最后进入智能剪辑。</p>
    </header>
    <div className={styles.stageLegend} aria-hidden="true">{workflowStages.map((stage) => <span key={stage.id}>{stage.shortTitle}</span>)}</div>
    <div className={styles.flowLine} aria-hidden="true"><i /></div>
    <div className={styles.stages}>
      {workflowStages.map((stage, stageIndex) => <section className={styles.stage} data-current={selection.stage.id === stage.id ? "true" : undefined} key={stage.id}>
        <header><span>{stage.index}</span><h3>{stage.title}</h3></header>
        <div className={styles.nodes}>
          {stage.nodes.map((node) => {
            const selected = selection.node.id === node.id;
            return <button
              aria-pressed={selected}
              className={styles.node}
              data-workflow-node={node.id}
              data-selected={selected ? "true" : undefined}
              data-tone={node.tone}
              key={node.id}
              onClick={() => selectNode(node, stage, stageIndex)}
              type="button"
            >
              {node.image ? <span className={styles.nodeImage}><Image alt={node.title + "真实视频帧"} fill loading="lazy" sizes="(max-width: 900px) 38vw, (max-width: 1080px) 20vw, 11vw" src={node.image} /></span> : null}
              <span className={styles.nodeCopy}><i>{node.code}</i><strong>{node.title}</strong>{node.duration ? <time>{node.duration}</time> : null}{node.seekTime !== undefined ? <time>{node.seekTime.toFixed(1)}s</time> : null}</span>
            </button>;
          })}
        </div>
        {stage.id === "edit" ? <div className={styles.output}>
          <span>FINAL CUT / 月下双刃</span>
          <dl>
            <div><dt>FRAME</dt><dd>1920 × 1080</dd></div><div><dt>RATE</dt><dd>30 FPS</dd></div>
            <div><dt>LENGTH</dt><dd>约 60 秒</dd></div><div><dt>SOUND</dt><dd>AAC 音轨</dd></div>
            <div><dt>MADE WITH</dt><dd>LibTV × 即梦</dd></div><div><dt>STATUS</dt><dd>已完成</dd></div>
          </dl>
          <button onClick={() => document.getElementById("moonlit-player")?.scrollIntoView({ behavior: "smooth", block: "center" })} type="button">回到放映 <span aria-hidden="true">↑</span></button>
        </div> : null}
        {selection.stage.id === stage.id ? <div className={styles.mobileDetail}><NodeDetail selection={selection} /></div> : null}
      </section>)}
    </div>
    <div className={styles.desktopDetail}><NodeDetail selection={selection} /></div>
    <p className={styles.disclaimer}>本页展示的是该漫剧的实际制作链路整理，用于说明创作方法；节点关系经过作品集阅读场景的视觉简化。</p>
  </section>;
}
