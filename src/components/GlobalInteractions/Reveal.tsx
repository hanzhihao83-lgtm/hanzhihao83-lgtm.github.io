import styles from "./Reveal.module.css";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: "none" | "short" | "long";
}

export function Reveal({ children, className = "", delay = "none" }: RevealProps) {
  return <div className={`${styles.reveal} ${className}`} data-delay={delay} data-reveal>{children}</div>;
}
