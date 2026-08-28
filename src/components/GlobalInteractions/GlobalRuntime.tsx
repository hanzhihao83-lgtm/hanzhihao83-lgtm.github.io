import Script from "next/script";

export function GlobalRuntime() {
  return <Script id="portfolio-runtime" src="/runtime.js" strategy="afterInteractive" />;
}
