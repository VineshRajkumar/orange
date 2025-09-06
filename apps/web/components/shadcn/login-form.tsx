'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,

  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { AxiosError, AxiosResponse } from "axios"
import axios from '@/lib/axios'
import { toast, Toaster } from "sonner"
import { ApiError } from "@repo/backend-common"
import { useAuthStore } from "@/store/Auth"
import { useNavigateToDashboard } from "@/hooks/use-navigate-dashboard"
import { ApiResponse } from "@/types/responses.type"
import { loginErrorMsg } from "@/types/responses.type"
import { userType } from "@/types/user.type"
import { areCookiesEnabled } from "@/actions/cookieAllowed.action"

export function LoginForm() {

  const [errors, setErrors] = useState<Record<string, string>[] | string[]>([])
  const [cookiesAllowed, setCookiesAllowed] = useState(true)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { status, login } = useAuthStore((state) => (state))


  //custom hook to redirect to dashboard if status is true
  useNavigateToDashboard({status,router})

  useEffect(() => {
    setCookiesAllowed(areCookiesEnabled())
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {

    e.preventDefault()
    if (!cookiesAllowed) {
      toast.error("Login not possible: your browser has cookies disabled.")
      return
    }

    const formData = new FormData(e.currentTarget)

    const data = {
      email: formData.get('email'),
      password: formData.get('password')
    }
    // console.log(data)



    try {
      const response = await axios.post(`/users/login`, data) as AxiosResponse
      const res = response.data as ApiResponse
      const userdata = (res.data as { user: userType }).user;
     
      // console.log(res)
      // console.log(userdata)
      login(userdata)
      // loggedIn(userdata)


      toast.success(res.message)

      startTransition(() => {
        // setTimeout(() => router.push('/dashboard'), 1000);
        setTimeout(() => router.replace('/dashboard'), 1000);
      })


    } catch (err) {
      // console.log(err)
      const error = err as AxiosError
      if (!error.response) {
        toast.error(`Backend server not active OR ${error.message}`)
        return
        // throw new Error(`Backend server not active OR ${error.message}`)
      }
      const data = error?.response?.data as ApiError
      // console.log(error)
      if (data.errors?.length) {
        setErrors(data.errors);
      } else {
        toast.error(data.message);
      }

    }

  }

  return (

    <div className={cn("flex min-h-screen items-center justify-center px-6 py-12 ")}>
      <div className="w-full max-w-sm space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-white">
              Welcome back !!
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!cookiesAllowed && (
              <div className="mb-4 rounded-md bg-red-100 text-red-700 p-2 text-sm text-center">
                ⚠️ Cookies are disabled in your browser. Login will not work properly.
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email" className="text-gray-900 dark:text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                />
                {errors ? errors.map((msg: loginErrorMsg, index) => (
                  msg.email ?
                    (<span key={index} className="flex justify-center text-center p-1 text-red-500">
                      {msg.email}
                    </span>) : ''
                )) : ''}
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-gray-900 dark:text-white">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password" name="password" required />
                {errors ? errors.map((msg: loginErrorMsg, index) => (
                  msg.password ?
                    (<span key={index} className="flex justify-center text-center p-1 text-red-500">
                      {msg.password}
                    </span>) : ''
                )) : ''}
              </div>

              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white">
                {isPending ? 'Loading...' : 'Login'}
              </Button>

              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-semibold text-orange-600 hover:text-orange-500 dark:hover:text-orange-400">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
        <Toaster richColors position="top-center" />
      </div>
    </div>


  )
}


