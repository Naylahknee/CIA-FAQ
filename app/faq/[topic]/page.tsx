import { TopicPage } from "../../components/guide-faq-pages";

export default async function FaqTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  return <TopicPage topic={topic} />;
}
