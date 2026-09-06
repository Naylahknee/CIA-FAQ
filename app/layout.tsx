import type { Metadata } from "next";
import "./globals.css";
import "./guide.css";

export const metadata: Metadata = {
  title: "My Village Auntie | CIA Hyde Park Guide",
  description: "A practical student and parent guide for Culinary Institute of America Hyde Park families.",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
