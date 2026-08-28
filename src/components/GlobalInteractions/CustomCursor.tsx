import styles from "./CustomCursor.module.css";

export function CustomCursor() {
  return (
    <div aria-hidden="true" className={styles.cursor} id="custom-cursor">
      <div className={styles.dot} data-cursor-dot />
      <div className={styles.ring} data-cursor-ring><i /><i /></div>
    </div>
  );
}
