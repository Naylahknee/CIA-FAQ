import assert from "node:assert/strict";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({ appType: "custom", configFile: false, root, server: { middlewareMode: true } });
after(async () => { await vite.close(); });

const { facts, factForTerm, factsForTerm, homePicks, resolveFact, termLabels, termNotice } =
  await vite.ssrLoadModule("/app/guide-data.ts");

test("termOverrides are actually applied", () => {
  const raw = facts.find((fact) => fact.id === "family-weekend");
  assert.ok(raw?.termOverrides?.spring, "fixture gone: family-weekend no longer carries a spring override");
  const spring = resolveFact(raw, "spring");
  assert.equal(spring.parentA, raw.termOverrides.spring.parentA);
  assert.notEqual(spring.parentA, raw.parentA, "the spring answer is still the fall answer");
  // Fall must be untouched by the override.
  assert.equal(resolveFact(raw, "fall").parentA, raw.parentA);
});

test("term-scoped facts are only available in their own term", () => {
  assert.ok(factForTerm("fall-dates", "fall"), "Fall dates missing from Fall");
  assert.equal(factForTerm("fall-dates", "spring"), undefined, "Fall dates leaked into Spring");
  assert.ok(factForTerm("spring-dates", "spring"), "Spring dates missing from Spring");
  assert.equal(factForTerm("spring-dates", "fall"), undefined, "Spring dates leaked into Fall");
});

test("factsForTerm never returns a fact belonging to the other term", () => {
  for (const term of ["fall", "spring"]) {
    for (const fact of factsForTerm(term)) {
      if (fact.terms) assert.ok(fact.terms.includes(term), `${fact.id} should not appear in ${term}`);
    }
  }
});

test("the home page leads with different answers per term", () => {
  const fall = homePicks.fall;
  const spring = homePicks.spring;
  assert.notDeepEqual(fall.opening, spring.opening, "both terms open with the same questions");
  assert.notDeepEqual(fall.mostAsked, spring.mostAsked, "both terms surface the same 'most asked' list");

  // Every pick must actually resolve in its own term, or the page silently
  // renders fewer cards than intended.
  for (const [term, picks] of Object.entries({ fall, spring })) {
    for (const id of [...picks.opening, ...picks.mostAsked]) {
      assert.ok(factForTerm(id, term), `home pick "${id}" does not resolve in ${term}`);
    }
  }
});

test("a Spring visitor is not shown September move-in as the arrival answer", () => {
  assert.ok(homePicks.fall.opening.includes("movein"));
  assert.ok(!homePicks.spring.opening.includes("movein"), "Spring still leads with Fall move-in");
  const springArrival = factForTerm("spring-dates", "spring");
  assert.match(springArrival.parentA, /January/, "the Spring arrival answer should talk about January");
});

test("spring caveats are scoped to spring", () => {
  const costs = facts.find((fact) => fact.id === "costs");
  assert.ok(costs.springNotice, "fixture gone: costs no longer carries a springNotice");
  assert.equal(termNotice(costs, "spring"), costs.springNotice);
  assert.equal(termNotice(costs, "fall"), undefined, "a Spring 2027 caveat is showing on a Fall page");
});

test("term labels are the single source of the year shown to families", () => {
  assert.equal(termLabels.fall, "Fall 2026");
  assert.equal(termLabels.spring, "Spring 2027");
});
