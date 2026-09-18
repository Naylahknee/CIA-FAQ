import test from "node:test";
import assert from "node:assert/strict";
import { analyzeFaqCandidate, redactGroupMeText, secretMatches } from "../app/groupme-faq.ts";

test("GroupMe intake removes common identifying details", () => {
  const result = redactGroupMeText("Ask Jane Doe at jane@example.com or (845) 555-1212. See https://example.com @Mary Smith", "Jane Doe");
  assert.equal(result.includes("jane@example.com"), false);
  assert.equal(result.includes("555-1212"), false);
  assert.equal(result.includes("example.com"), false);
  assert.equal(result.toLowerCase().includes("jane"), false);
  assert.equal(result.includes("@Mary"), false);
});

test("GroupMe intake identifies a new FAQ candidate", () => {
  const result = analyzeFaqCandidate("Where can students buy replacement kitchen shoes?");
  assert.ok(result);
  assert.equal(result.category, "classes");
  assert.equal(result.status, "pending");
});

test("GroupMe intake marks close existing questions as duplicates", () => {
  const result = analyzeFaqCandidate("How do I pay the tuition deposit?");
  assert.ok(result);
  assert.equal(result.status, "duplicate");
  assert.equal(result.matchedFaqId, "deposit");
});

test("GroupMe intake ignores acknowledgements and verifies secrets", async () => {
  assert.equal(analyzeFaqCandidate("Thank you!"), null);
  assert.equal(await secretMatches("correct", "correct"), true);
  assert.equal(await secretMatches("wrong", "correct"), false);
});
