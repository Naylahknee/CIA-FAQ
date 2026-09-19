// Regenerates public/sitemap.xml and public/robots.txt.
// vinext does not support Next's app/sitemap.ts metadata routes, so these are
// static files. Run `node scripts/generate-sitemap.mjs` after adding a route.
import { readFileSync, writeFileSync } from "node:fs";

const SITE = "https://ciaquestions.com";
const src = readFileSync(new URL("../app/guide-data.ts", import.meta.url), "utf8");
const block = src.slice(src.indexOf("export const topics"), src.indexOf("export const dates"));
const topics = [...block.matchAll(/"(\w+)":\s*\{/g)].map((m) => m[1]);
if (topics.length < 5) throw new Error(`expected the guide topics, parsed ${topics.length}`);

const pages = [["", "weekly", "1.0"], ["/faq", "weekly", "0.9"], ["/calendar", "weekly", "0.8"],
  ["/resources", "monthly", "0.8"], ["/safety", "monthly", "0.8"], ["/shopping", "monthly", "0.7"],
  ["/community", "weekly", "0.6"], ["/support", "monthly", "0.5"], ["/scholarship", "monthly", "0.5"],
  ["/share", "yearly", "0.4"], ["/corrections", "yearly", "0.4"], ["/privacy", "yearly", "0.3"]];
const today = new Date().toISOString().slice(0, 10);
const urls = [...pages, ...topics.map((t) => [`/faq/${t}`, "weekly", "0.9"])]
  .map(([path, freq, priority]) => `  <url>\n    <loc>${SITE}${path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`)
  .join("\n");

writeFileSync(new URL("../public/sitemap.xml", import.meta.url),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

writeFileSync(new URL("../public/robots.txt", import.meta.url),
  `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /account\nDisallow: /admin\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`sitemap.xml: ${pages.length + topics.length} urls (${topics.length} topics)`);
console.log("robots.txt written");
