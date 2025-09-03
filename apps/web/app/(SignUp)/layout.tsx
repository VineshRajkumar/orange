import type { Metadata } from "next";
import "../styles/globals.css";
import { keywords, seo } from "@/components/seo/data";


export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your free Orange Board account and start collaborating on an online whiteboard. Register now to brainstorm, draw, and share ideas in real time.",
  keywords: keywords.signupPage,
  openGraph: {
    ...seo.openGraph,
    title: "Sign Up | Orange Board",
    description:
      "Sign up for Orange Board to create your account and collaborate with your team on a real-time online whiteboard.",
    url: `${seo.openGraph.url}/signup`,
  },
  twitter: {
    ...seo.twitter,
    title: "Sign Up | Orange Board",
    description:
      "Register for Orange Board and start collaborating with your team on an online whiteboard instantly.",
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

    <div>
      {children}
    </div>

  );
}
