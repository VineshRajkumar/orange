
import { satoshi } from "@/app/styles/fonts";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";


export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900">

      <Link href="/" className="absolute left-4 top-4 inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <main className={`${satoshi.className} max-w-3xl mx-auto px-6 py-16`}>
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

        <p className="mb-4">
          At <strong>Orange Board</strong>, we respect your privacy. This page explains
          how we handle data when you use our app.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">1. Guest Mode</h2>
        <p className="mb-4">
          When you use Orange Board as a guest, we do <strong>not</strong> collect or store your personal information.
          For security purposes, we may temporarily check your IP address <em>only</em> to apply rate limiting
          (to prevent abuse of the guest login feature). However, we do <strong>not</strong> log, save, or associate
          your IP with your activity. We may also use browser storage (like <code>localStorage</code>) to
          temporarily track guest session usage, but this data stays only in your browser and can be cleared anytime.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">2. Cookies</h2>
        <p className="mb-4">
          We only use essential cookies to manage your login session, such as access and refresh tokens. These cookies are necessary for secure authentication and are not used for tracking or advertising.
        </p>
        <p className="mb-4">
          Please note: since Orange Board relies on cookies for login, the app may not work properly in
          <strong> Incognito/Private Browsing mode</strong> or in browsers where cookies are blocked or disabled.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">3. Analytics</h2>
        <p className="mb-4">
          We use <strong>Vercel Analytics</strong> to understand basic traffic trends (like page views). This tool is privacy-friendly:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>No cookies</li>
          <li>No personal data collection</li>
          <li>No IP tracking</li>
        </ul>
        <p className="mb-4">
          This helps us improve the app while keeping your data private.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">4. Your Control</h2>
        <p className="mb-4">
          We aim to store the minimum amount of data required to keep Orange Board secure and functional. If you have any concerns or questions about your privacy, feel free to contact us.
        </p>

        <p className="text-sm text-gray-500 mt-12">Last updated: August 7, 2025</p>
      </main>
    </div>
  );
}
