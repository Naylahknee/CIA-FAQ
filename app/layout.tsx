import type { Metadata } from "next";
import { GuideShell } from "./components/guide-shell";
import "./globals.css";
import "./guide.css";
import "./forms.css";

export const SITE_URL = "https://ciaquestions.com";
const SITE_NAME = "CIA Questions — Independent Family Guide";
const SITE_DESCRIPTION = "Practical answers for Culinary Institute of America Hyde Park students and families: meal plans, move-in, tuition and costs, kits and textbooks, campus life, health and safety.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | CIA Hyde Park Family Guide` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  keywords: ["CIA Hyde Park", "Culinary Institute of America", "family guide", "parent FAQ", "meal plan", "move-in", "culinary school"],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" } },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Applies the saved sidebar state before first paint, so a collapsed
            sidebar never flashes open and nothing shifts after load. */}
        <script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.sidebar=localStorage.getItem("guide-sidebar-collapsed")==="1"?"collapsed":"expanded"}catch(e){document.documentElement.dataset.sidebar="expanded"}` }} />
      </head>
      <body className="antialiased"><GuideShell>{children}</GuideShell></body>
    </html>
  );
}
