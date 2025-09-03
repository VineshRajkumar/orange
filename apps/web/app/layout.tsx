import { Metadata } from "next";
import '../app/styles/globals.css'
import { seo, siteConfig } from "@/components/seo/data";
import { ThemeProvider } from "@/components/ui/theme-provider";

//since this is now a global layout file according to nextjs so writing the main things that are common in all files 
export const metadata: Metadata = {

    metadataBase: new URL(siteConfig.url!),
    title: {
        default: seo.defaultTitle,
        template: seo.titleTemplate,
    },
    authors: seo.authors,
    creator: seo.creator,
    icons: seo.icons,
    manifest: seo.manifest

};

// Since we have a `not-found.tsx` page on the root, a layout file
// is required, even if it's just passing children through.
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (

        <html suppressHydrationWarning lang="en">
            <head>
                {/* <meta name="google-site-verification" content="m430e2fTgc2fp0gSlvgXhAGSe-ZLiD5gKFmK2Q25ek4" /> */}
                <meta name="apple-mobile-web-app-title" content="Orange" />
            </head>
            <body >

                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >

                    {children}

                </ThemeProvider>

            </body>
        </html>
    );


}