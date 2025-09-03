import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { keywords, seo } from "@/components/seo/data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for doesn't exist on Orange Board. Return home to continue using Orange Board.",
  keywords: keywords.notfound,
  openGraph: {
    ...seo.openGraph,
    title: "404 - Page Not Found | Orange Board",
    description: "Oops! The page you're looking for doesn't exist on Orange Board.",
    url: `${seo.openGraph.url}/404`,
  },
  twitter: {
    ...seo.twitter,
    title: "404 - Page Not Found | Orange Board",
    description: "Oops! The page you're looking for doesn't exist on Orange Board.",
  },
  robots: "noindex, follow",
};

//html and body are removed from layout due to hydration error and also a layout page is just needed for notfound 
export default function NotFound() {
  return (

    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-900 px-6 text-center">

      <div className="mb-6">
        <AlertTriangle className="h-16 w-16 text-orange-500" />
      </div>


      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        404 - Page Not Found
      </h1>


      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
      </p>


      <Link href="/">
        <Button className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200">
          Go Back to Orange Board
        </Button>
      </Link>
    </div>

  );
}


