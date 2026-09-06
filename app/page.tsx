"use client";

import Script from "next/script";
import guideDocument from "../legacy/index.html?raw";

const guideBody = guideDocument
  .match(/<body>([\s\S]*?)<script src="app\.js"><\/script>[\s\S]*?<\/body>/)?.[1]
  ?.trim() ?? "";

export default function Home() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: guideBody }} />
      <Script src="/guide.js" strategy="afterInteractive" />
    </>
  );
}
