import { facts, factAppliesToTerm, resolveFact, topics, type Fact, type Term } from "./guide-data";
import { resourceLibrary, staffGuidance } from "./guide-sections";

/** A row destined for `search_documents`. Kept deliberately flat: the index
 *  only needs text, and everything shown to a reader is looked up from the
 *  original record by `refId` afterwards. */
export type CorpusDocument = {
  id: string;
  source: "guide";
  refId: string;
  category: string;
  /** "" means the document applies to every term. */
  terms: string;
  href: string;
  title: string;
  altTitle: string;
  body: string;
  tags: string;
};

const TERMS: Term[] = ["fall", "spring"];

const factBody = (fact: Fact) => [fact.parentA, fact.studentA, fact.stepParent, fact.stepStudent, fact.source].join(" ");

function factDocuments(): CorpusDocument[] {
  const documents: CorpusDocument[] = [];
  for (const fact of facts) {
    const tags = [topics[fact.category]?.name ?? "", fact.category, fact.sourceType].join(" ");
    // A fact whose wording is identical in both terms is indexed once. Only
    // facts that are term-scoped, or that carry termOverrides, get a row per
    // term -- otherwise the index would carry two near-identical copies of
    // every answer and bm25 would be scoring duplicates against each other.
    const termSpecific = Boolean(fact.terms || fact.termOverrides);
    if (!termSpecific) {
      documents.push({
        id: `guide:${fact.id}`, source: "guide", refId: fact.id, category: fact.category, terms: "",
        href: `/faq/${fact.category}`, title: fact.parentQ, altTitle: fact.studentQ, body: factBody(fact), tags,
      });
      continue;
    }
    for (const term of TERMS) {
      if (!factAppliesToTerm(fact, term)) continue;
      const resolved = resolveFact(fact, term);
      documents.push({
        id: `guide:${fact.id}:${term}`, source: "guide", refId: fact.id, category: fact.category, terms: term,
        href: `/faq/${fact.category}`, title: resolved.parentQ, altTitle: resolved.studentQ, body: factBody(resolved), tags,
      });
    }
  }
  return documents;
}

/** Staff guidance and the resource library were never searchable at all. They
 *  are part of what a family is looking for when they type "packing" or "meal
 *  plan pdf", so they go into the same index. */
function sectionDocuments(): CorpusDocument[] {
  const guidance: CorpusDocument[] = staffGuidance.map((item, position) => ({
    id: `guide:staff-${position}`, source: "guide", refId: `staff-${position}`, category: "living", terms: "",
    href: "/resources", title: item.topic, altTitle: "", body: item.guidance, tags: "staff guidance advice",
  }));
  const library: CorpusDocument[] = resourceLibrary.map((item) => ({
    id: `guide:resource-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    source: "guide", refId: item.title, category: "living", terms: "",
    href: "/resources", title: item.title, altTitle: "", body: item.description,
    tags: `${item.kind} ${item.format} download`,
  }));
  return [...guidance, ...library];
}

export function buildCorpus(): CorpusDocument[] {
  return [...factDocuments(), ...sectionDocuments()];
}

/** FNV-1a. Not a security hash -- it only has to change when the text changes,
 *  and it avoids making corpus sync await Web Crypto on every cold start. */
export function contentVersion(documents: CorpusDocument[]): string {
  const payload = documents.map((doc) => `${doc.id}\u0000${doc.title}\u0000${doc.altTitle}\u0000${doc.body}\u0000${doc.tags}\u0000${doc.terms}`).join("\u0001");
  let hash = 0x811c9dc5;
  for (let index = 0; index < payload.length; index += 1) {
    hash ^= payload.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `${documents.length}-${hash.toString(16)}`;
}
