import type { Metadata } from "next";
import "../styles/globals.css";
import { seo } from "@/components/seo/data";


export const metadata: Metadata = {
  title: {
    absolute: seo.defaultTitle
  },
  description: seo.description,
  keywords: seo.keywords,
  openGraph: seo.openGraph,
  twitter: seo.twitter,
  robots: seo.robots,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {children}
    </div>
  );
}
