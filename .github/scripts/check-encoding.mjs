#!/usr/bin/env node
// Reject text files that are not valid UTF-8.
//
// A commit once replaced app/guide.css with 60KB of binary data. The file is
// imported by app/layout.tsx, so every build failed with
// "stream did not contain valid UTF-8" -- but nothing caught it until three
// Cloudflare deploys had already failed and the live site was stuck on an old
// version. GitHub's own conflict editor rendered the bytes as CJK mojibake,
// which made it look like an encoding quirk rather than a destroyed file.
//
// This turns that class of failure into a red check on the pull request, which
// costs a second instead of an outage. It also catches NUL bytes, which are
// valid UTF-8 but never belong in source.
//
// Run: node .github/scripts/check-encoding.mjs

import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

// Extensions whose contents are meant to be binary. Everything else tracked in
// the repository is expected to be decodable text.
const BINARY = new Set([
  "png", "jpg", "jpeg", "gif", "webp", "avif", "ico", "bmp", "tiff",
  "pdf", "zip", "gz", "tgz", "br", "7z", "rar",
  "woff", "woff2", "ttf", "otf", "eot",
  "mp3", "mp4", "webm", "mov", "wav", "ogg",
  "wasm", "node", "bin", "exe", "dll", "so", "dylib",
  "sqlite", "db", "keystore", "jks", "p12", "pfx",
]);

/** Returns the byte offset of the first invalid UTF-8 sequence, or -1. */
function firstInvalidByte(buf) {
  let i = 0;
  while (i < buf.length) {
    const b = buf[i];
    let need;
    if (b <= 0x7f) { i += 1; continue; }
    else if (b >= 0xc2 && b <= 0xdf) need = 1;
    else if (b >= 0xe0 && b <= 0xef) need = 2;
    else if (b >= 0xf0 && b <= 0xf4) need = 3;
    else return i;                              // 0x80-0xc1 and 0xf5-0xff never start a sequence

    if (i + need >= buf.length + 0 && i + need > buf.length - 1) return i;  // truncated
    for (let k = 1; k <= need; k += 1) {
      const c = buf[i + k];
      if (c === undefined || c < 0x80 || c > 0xbf) return i + k;
    }
    // Reject overlong forms and surrogates, which decoders also refuse.
    if (need === 2 && b === 0xe0 && buf[i + 1] < 0xa0) return i + 1;
    if (need === 2 && b === 0xed && buf[i + 1] >= 0xa0) return i + 1;
    if (need === 3 && b === 0xf0 && buf[i + 1] < 0x90) return i + 1;
    if (need === 3 && b === 0xf4 && buf[i + 1] >= 0x90) return i + 1;
    i += need + 1;
  }
  return -1;
}

const files = execFileSync("git", ["ls-files", "-z"], { maxBuffer: 64 * 1024 * 1024 })
  .toString("utf8")
  .split("\0")
  .filter(Boolean);

const problems = [];
let scanned = 0;

for (const file of files) {
  const ext = (file.split(".").pop() || "").toLowerCase();
  if (BINARY.has(ext) && file.includes(".")) continue;

  let buf;
  try {
    if (!statSync(file).isFile()) continue;
    buf = readFileSync(file);
  } catch {
    continue; // deleted or unreadable in this checkout; not this check's business
  }

  scanned += 1;

  const bad = firstInvalidByte(buf);
  if (bad !== -1) {
    problems.push({ file, kind: "is not valid UTF-8", offset: bad, size: buf.length });
    continue;
  }
  const nul = buf.indexOf(0);
  if (nul !== -1) {
    problems.push({ file, kind: "contains a NUL byte", offset: nul, size: buf.length });
  }
}

console.log(`Checked ${scanned} text file${scanned === 1 ? "" : "s"}.`);

if (problems.length === 0) {
  console.log("All text files decode as UTF-8.");
  process.exit(0);
}

for (const p of problems) {
  // A large file that fails within its first bytes has no readable prefix at
  // all, so it is binary that landed under a text name rather than a file with
  // one bad character in it -- a different problem, needing a different fix.
  const hint = p.offset < 16 && p.size > 1024
    ? " Nothing at the start of this file is text, so it is binary under a text name rather than a stray character: restore it from the last commit where it parsed, rather than editing it."
    : "";
  console.log(`::error file=${p.file}::${p.file} ${p.kind} at byte ${p.offset} (file is ${p.size} bytes).${hint}`);
}

console.log(`\n${problems.length} file${problems.length === 1 ? "" : "s"} failed the encoding check.`);
console.log("A text file that does not decode will break the build wherever it is imported.");
process.exit(1);
