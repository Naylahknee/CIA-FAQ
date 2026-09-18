import { readFile, writeFile, mkdir } from "node:fs/promises";

const output = process.argv[2] ?? "audits/guide-visible-text.txt";
const html = await readFile("legacy/index.html", "utf8");
const guide = await readFile("public/guide.js", "utf8");
const strip = (value) => value
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/<style[\s\S]*?<\/style>/gi, "")
  .replace(/<[^>]*>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&nbsp;/g, " ")
  .replace(/\s+/g, " ")
  .trim();
const strings = [...guide.matchAll(/(?:studentQ|parentQ|studentA|parentA|stepStudent|stepParent|source|linkLabel):\s*"([^"]*)"/g)]
  .map((match) => match[1]);
await mkdir(output.slice(0, output.lastIndexOf("/")), { recursive: true });
await writeFile(output, `${strip(html)}\n\n[Guide data rendered by public/guide.js]\n${strings.join("\n")}\n`);
