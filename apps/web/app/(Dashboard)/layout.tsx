import type { Metadata } from "next";
import "../styles/globals.css";
import { Poppins } from 'next/font/google'
import { keywords } from "@/components/seo/data";

const poppins = Poppins({
    weight: ['400', '600'],
    subsets: ['latin'],
    display: 'swap'
})

export const metadata: Metadata = {
    title: "Dashboard",
    description:
        "Access your Orange Board dashboard to manage your whiteboards, collaborate with teammates, and track real-time brainstorming sessions.",
    keywords: keywords.dashboard,
    robots: {
        index: false, // don’t index private pages
        follow: false,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className={`${poppins.className} leading-[1.5rem]`} >
            <div className="min-h-[100dvh] bg-[#FFFFFF] text-[#333333]  dark:bg-[#1A1A1A] dark:text-[#EAEAEA] ">

                {children}

            </div>
        </div>

    );
}