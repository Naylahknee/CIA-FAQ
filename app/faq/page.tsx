import type { Metadata } from "next";
import { FaqHub } from "../components/guide-faq-pages";
import { FaqStructuredData } from "../components/structured-data";

const description = "Searchable answers for CIA Hyde Park families: meal plans and dining points, move-in and arrival, tuition and costs, culinary kits and textbooks, campus life, health and safety.";

export const metadata: Metadata = {
  title: "FAQs & Help: CIA Hyde Park Family Questions Answered",
  description,
  alternates: { canonical: "/faq" },
  openGraph: { title: "FAQs & Help: CIA Hyde Park Family Questions Answered", description, url: "/faq", type: "website" },
};

export default function FaqPage() {
  return <><FaqStructuredData /><FaqHub /></>;
}
