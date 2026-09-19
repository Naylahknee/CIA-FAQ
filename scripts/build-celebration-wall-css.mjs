#!/usr/bin/env node
// Compiles the Tailwind stylesheet the celebration wall needs, so the page can
// drop the cdn.tailwindcss.com script tag. That CDN build is a just-in-time
// compiler that runs in the visitor's browser: it costs a round trip and a
// parse on every load, it stops working if the CDN does, and allowing it in the
// CSP means trusting a third-party origin to execute script on a site where
// families sign in. A prebuilt file has none of those properties.
//
// Re-run after editing public/celebration-wall.html, or classes added there
// will have no styles:  npm run build:wall-css
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { readFileSync, writeFileSync } from "node:fs";

const OUT = "public/celebration-wall.css";
// @source points the scanner at the page; Tailwind reads it as text, so the
// class strings inside the page's own <script> templates are picked up too.
const entry = `@import "tailwindcss";\n@source "./celebration-wall.html";\n`;

const result = await postcss([tailwind()]).process(entry, { from: "public/entry.css", to: OUT });
writeFileSync(OUT, result.css);

const bytes = Buffer.byteLength(result.css);
const html = readFileSync("public/celebration-wall.html", "utf8");
if (html.includes("cdn.tailwindcss.com")) {
  console.error("WARNING: the page still references the Tailwind CDN.");
  process.exit(1);
}
console.log(`wrote ${OUT} (${(bytes / 1024).toFixed(1)} KB)`);
