import Image from "next/image";

import { Reveal } from "@/components/GlobalInteractions/Reveal";
import { noteDimensions, visualNotes, visualNotesIntro } from "@/data/visual-notes";

import styles from "./VisualNotesArchive.module.css";
import { VisualComparisonLab } from "./VisualComparisonLab";

export function VisualNotesArchive() {
  return (
    <article className={styles.archive} data-page-theme="notes">
      <header className={styles.hero}>
        <div className={styles.volume}><span>{visualNotesIntro.volume}</span><span>{String(visualNotes.length).padStart(3, "0")} ENTRIES</span></div>
        <h1>{visualNotesIntro.title}</h1>
        <div className={styles.heroBottom}><p>{visualNotesIntro.description}</p><div><strong>08</strong><span>DIMENSIONS</span></div></div>
      </header>

      <nav className={styles.index} aria-label="视觉笔记维度索引">
        {noteDimensions.map((dimension, index) => {
          const count = visualNotes.filter((note) => note.dimension === dimension).length;
          const preview = visualNotes.find((note) => note.dimension === dimension);
          return (
            <a href={`#dimension-${index + 1}`} key={dimension}>
              {preview ? <Image alt="" fill loading={index === 0 ? "eager" : "lazy"} sizes="(max-width: 520px) 100vw, (max-width: 800px) 50vw, 25vw" src={preview.image} /> : null}
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{dimension}</b>
              <i>{String(count).padStart(2, "0")}</i>
            </a>
          );
        })}
      </nav>

      <div className={styles.entries}>
        {noteDimensions.map((dimension, dimensionIndex) => {
          const entries = visualNotes.filter((note) => note.dimension === dimension);
          return (
            <section className={styles.dimension} id={`dimension-${dimensionIndex + 1}`} key={dimension}>
              <div className={styles.dimensionTitle}><span>{String(dimensionIndex + 1).padStart(2, "0")}</span><h2>{dimension}</h2><i>{String(entries.length).padStart(2, "0")} TAGS</i></div>
              {entries.map((note) => (
                <Reveal className={styles.note} key={note.id}>
                  <div className={styles.noteCopy}><span>{note.index}</span><h3>{note.title}</h3><p>{note.definition}</p></div>
                  <VisualComparisonLab comparisons={note.comparisons} dimension={note.dimension} question={note.question} />
                </Reveal>
              ))}
            </section>
          );
        })}
      </div>
    </article>
  );
}
