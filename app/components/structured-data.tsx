import { facts, topics, type TopicKey } from "../guide-data";
import { resourceLibrary } from "../guide-sections";

const SITE_URL = "https://ciaquestions.com";
const SITE_NAME = "CIA Hyde Park Family Guide & FAQ";

function Ld({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

/** Strip the HTML that answers carry, so JSON-LD holds plain text. */
function plain(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function faqEntities(list: typeof facts) {
  return list.map((fact) => ({
    "@type": "Question",
    name: plain(fact.parentQ),
    acceptedAnswer: { "@type": "Answer", text: `${plain(fact.parentA)} Next step: ${plain(fact.stepParent)}` },
  }));
}

export function SiteStructuredData() {
  return <Ld data={{
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME,
        description: "Practical answers for Culinary Institute of America Hyde Park students and families.",
        inLanguage: "en-US", publisher: { "@id": `${SITE_URL}/#organization` } },
      { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL,
        description: "An independent guide for CIA Hyde Park families, built from official documents and anonymized family questions." },
    ],
  }} />;
}

export function FaqStructuredData({ topic }: { topic?: TopicKey }) {
  const list = topic ? facts.filter((fact) => fact.category === topic) : facts;
  if (!list.length) return null;
  const name = topic ? `${topics[topic].name} FAQs` : "CIA Hyde Park Family FAQs";
  return <Ld data={{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name,
    url: topic ? `${SITE_URL}/faq/${topic}` : `${SITE_URL}/faq`,
    inLanguage: "en-US",
    mainEntity: faqEntities(list),
  }} />;
}

export function BreadcrumbStructuredData({ topic }: { topic: TopicKey }) {
  return <Ld data={{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "FAQs & Help", item: `${SITE_URL}/faq` },
      { "@type": "ListItem", position: 3, name: topics[topic].name, item: `${SITE_URL}/faq/${topic}` },
    ],
  }} />;
}

export function ResourceStructuredData() {
  return <Ld data={{
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "CIA Hyde Park family resource library",
    url: `${SITE_URL}/resources`,
    numberOfItems: resourceLibrary.length,
    itemListElement: resourceLibrary.map((resource, index) => ({
      "@type": "ListItem", position: index + 1,
      item: { "@type": "DigitalDocument", name: resource.title, description: resource.description, url: `${SITE_URL}${resource.href}`, encodingFormat: "application/pdf", genre: resource.kind },
    })),
  }} />;
}
