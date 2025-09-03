import { SigninForm } from "@/components/shadcn/signin-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900">

      <Link href="/" className="absolute left-4 top-4 inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

       <div className="flex min-h-screen items-center justify-center px-4 ">
        <SigninForm />
      </div>
    </div>
  )
}

