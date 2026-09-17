const existingFaqs = [
  ["deposit", "How do I pay my tuition deposit?"],
  ["costs", "What will CIA cost beyond tuition?"],
  ["proxy", "How do I let a parent see grades or financial information?"],
  ["books", "Where do I find and order my textbooks?"],
  ["kit", "What comes in my culinary or baking kit?"],
  ["meal", "What is the difference between Blue and Gold Points?"],
  ["allergy", "What should I do if I have a food allergy?"],
  ["health", "Where can I go for medication or urgent medical care?"],
  ["move", "What should I bring on move-in day?"],
  ["roommate", "What should I do about a roommate problem?"],
  ["calendar", "Are regular college holidays always days off?"],
  ["uniform", "When and where will I need my full uniform?"],
  ["laundry", "How should I handle laundry and stained chef whites?"],
  ["printer", "Do I need to bring a printer?"],
  ["orientation", "How much of orientation do I really need to attend?"],
  ["travel", "How do I get to the train station or airport for breaks?"],
  ["work", "Can I work while I am enrolled?"],
  ["mail", "How will I receive mail and packages?"],
  ["fall-dates", "What are the key Fall 2026 dates and deadlines?"],
  ["spring-dates", "When can I return for Spring 2027, and when do classes begin?"],
  ["celebration", "Can my family send me a Celebration Gram?"],
] as const;

const categoryWords = {
  money: ["tuition", "deposit", "bill", "cost", "fee", "financial", "aid", "payment", "meal point", "blue point", "gold point"],
  arrival: ["move-in", "move in", "arrival", "orientation", "calendar", "deadline", "break", "return", "airport", "train", "travel"],
  classes: ["class", "schedule", "grade", "textbook", "book", "uniform", "kit", "knife", "kitchen", "bakeshop"],
  health: ["health", "allergy", "medical", "doctor", "hospital", "pharmacy", "urgent", "medication", "insurance"],
  living: ["dorm", "housing", "roommate", "laundry", "mail", "package", "printer", "work", "job", "celebration"],
} as const;

const stopWords = new Set(["a", "an", "and", "are", "can", "do", "for", "how", "i", "in", "is", "it", "my", "of", "on", "or", "our", "the", "to", "we", "what", "when", "where", "will"]);

function tokens(value: string) {
  return new Set(value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(word => word.length > 2 && !stopWords.has(word)));
}

function similarity(left: string, right: string) {
  const a = tokens(left);
  const b = tokens(right);
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const word of a) if (b.has(word)) shared += 1;
  return shared / Math.min(a.size, b.size);
}

export function redactGroupMeText(value: unknown, senderName?: unknown) {
  let text = String(value ?? "").normalize("NFKC").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  text = text
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email removed]")
    .replace(/(?:https?:\/\/|www\.)\S+/gi, "[link removed]")
    .replace(/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g, "[phone removed]")
    .replace(/@(?:[\p{L}\p{N}_.'-]+(?:\s+[\p{L}\p{N}_.'-]+)?)/gu, "[name removed]")
    .replace(/\b\d{7,}\b/g, "[number removed]");
  const names = String(senderName ?? "").split(/\s+/).filter(part => part.length >= 3);
  for (const name of names) text = text.replace(new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi"), "[name removed]");
  return text.slice(0, 1200);
}

export function analyzeFaqCandidate(text: string) {
  const cleaned = text.trim();
  if (cleaned.length < 12 || /^(thanks?|thank you|ok(?:ay)?|yes|no|lol|welcome)[.!\s]*$/i.test(cleaned)) return null;
  const questionLead = /^(who|what|when|where|why|how|can|could|do|does|did|is|are|should|will|would)\b/i.test(cleaned);
  const updateSignal = /\b(deadline|changed?|updated?|new|now|date|cost|fee|required|closed?|open(?:ed)?)\b/i.test(cleaned);
  const relevant = Object.values(categoryWords).flat().some(word => cleaned.toLowerCase().includes(word));
  if (!(cleaned.includes("?") || questionLead || (updateSignal && relevant))) return null;

  let category: keyof typeof categoryWords = "living";
  let bestCount = -1;
  for (const [candidate, words] of Object.entries(categoryWords) as [keyof typeof categoryWords, readonly string[]][]) {
    const count = words.filter(word => cleaned.toLowerCase().includes(word)).length;
    if (count > bestCount) { category = candidate; bestCount = count; }
  }

  let bestMatch: { id: string; score: number } | null = null;
  for (const [id, question] of existingFaqs) {
    const score = similarity(cleaned, question);
    if (!bestMatch || score > bestMatch.score) bestMatch = { id, score };
  }
  const duplicate = Boolean(bestMatch && bestMatch.score >= 0.6);
  const question = cleaned.endsWith("?") ? cleaned : `${cleaned.replace(/[.!]+$/, "")}?`;
  return { question, category, status: duplicate ? "duplicate" as const : "pending" as const, matchedFaqId: duplicate ? bestMatch!.id : null };
}

export async function secretMatches(provided: string, expected: string) {
  if (!provided || !expected) return false;
  const encoder = new TextEncoder();
  const [left, right] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const a = new Uint8Array(left);
  const b = new Uint8Array(right);
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a[index] ^ b[index];
  return difference === 0;
}
