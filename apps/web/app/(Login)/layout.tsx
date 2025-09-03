import type { Metadata } from "next";
import "../styles/globals.css";
import { keywords, seo } from "@/components/seo/data";


export const metadata: Metadata = {
  title: "Login",
  description:
    "Login to Orange Board and start collaborating on your online whiteboard. Access your boards, brainstorm, and work together in real time.",
  keywords: keywords.loginPage,
  openGraph: {
    ...seo.openGraph,
    title: "Login | Orange Board",
    description:
      "Access your Orange Board account and start collaborating on your whiteboards in real time.",
    url: `${seo.openGraph.url}/login`,
  },
  twitter: {
    ...seo.twitter,
    title: "Login | Orange Board",
    description:
      "Sign in to Orange Board and collaborate with your team on a real-time online whiteboard.",
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