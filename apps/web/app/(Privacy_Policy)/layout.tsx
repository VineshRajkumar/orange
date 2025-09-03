import type { Metadata } from "next";
import "../styles/globals.css";
import { keywords, seo } from "@/components/seo/data";


export const metadata: Metadata = {

  title: "Privacy Policy",
  description:
    "Learn how Orange Board handles your data, including guest mode, login, and analytics. We value your privacy and transparency.",

  keywords: keywords.privacyPolicy,

  openGraph: {
    ...seo.openGraph,
    title: "Privacy Policy | Orange Board",
    description:
      "Read Orange Board's privacy practices. Learn how we handle guest mode, login data, and analytics securely.",
    url: `${seo.openGraph.url}/privacy-policy`,
  },
  twitter: {
    ...seo.twitter,
    title: "Privacy Policy | Orange Board",
    description:
      "Understand Orange Board's privacy practices for guest mode, login, and analytics.",
  },
  robots: {
    index: true,
    follow: true,
  },

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <div className="relative min-h-screen ">
      {children}
    </div>

  );
}