import type { Metadata } from "next";
import { ResourceStructuredData } from "../components/structured-data";

export const metadata: Metadata = {
  title: "Resource Library: CIA Hyde Park Guides & Documents",
  description: "Download the official CIA Hyde Park documents families use most: freshman meal plan, academic calendar, culinary and baking kit lists, food allergy protocol, textbook ordering and local medical care.",
  alternates: { canonical: "/resources" },
  openGraph: { title: "Resource Library: CIA Hyde Park Guides & Documents", description: "Download the official CIA Hyde Park documents families use most: freshman meal plan, academic calendar, culinary and baking kit lists, food allergy protocol, textbook ordering and local medical care.", url: "/resources", type: "website" },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <><ResourceStructuredData />{children}</>; }
