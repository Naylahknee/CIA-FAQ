import type { Metadata } from "next";
import { TopicPage } from "../../components/guide-faq-pages";
import { BreadcrumbStructuredData, FaqStructuredData } from "../../components/structured-data";
import { topics, type TopicKey } from "../../guide-data";

export function generateStaticParams() {
  return Object.keys(topics).map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const item = topics[topic as TopicKey];
  if (!item) return { title: "FAQ topic unavailable", robots: { index: false, follow: true } };
  const title = `${item.name} at CIA Hyde Park: Questions Answered`;
  const description = `${item.description} Answers for Culinary Institute of America Hyde Park students and families, with the official source for each one.`;
  return {
    title,
    description,
    alternates: { canonical: `/faq/${topic}` },
    openGraph: { title, description, url: `/faq/${topic}`, type: "article" },
  };
}

export default async function FaqTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const known = topic in topics;
  return <>
    {known && <><FaqStructuredData topic={topic as TopicKey} /><BreadcrumbStructuredData topic={topic as TopicKey} /></>}
    <TopicPage topic={topic} />
  </>;
}
