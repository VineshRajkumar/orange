'use client'
import { Toaster, toast } from 'sonner'
import { useTransition } from 'react'
import { AxiosError, AxiosResponse } from 'axios'
import axios from '@/lib/axios'
import { ApiError } from '@repo/backend-common'
import { useState } from "react"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { useAuthStore } from "@/store/Auth"
import { ApiResponse } from '@/types/responses.type'
import { useNavigateToDashboard } from '@/hooks/use-navigate-dashboard'
import { errormsg } from '@/types/responses.type'

export function SigninForm() {

  const [errors, setErrors] = useState<Record<string, string>[] | string[]>([])
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const status = useAuthStore((state) => (state.status))

  //custom hook to redirect to dashboard if status is true
  useNavigateToDashboard({status,router})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {

    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password')
    }
    // console.log(data)



    try {
      const response = await axios.post(`/users/register`, data) as AxiosResponse
      const res = response.data as ApiResponse
      toast.success(res.message)
   
      startTransition(() => {
        setTimeout(() => router.push('/login'), 1000);
      })


    } catch (err) {
      // console.log(err)
      const error = err as AxiosError
      const data = error?.response?.data as ApiError
      // console.log(error)
      setErrors(data.errors)
      if (errors.length === 0) {
        toast.error(data.message)
      }
    }

  }

  return (


    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} action="#" method="POST" className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
              Username
            </label>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                type="username"
                required
                autoComplete="username"
                className="block w-full rounded-md bg-white dark:bg-gray-900 px-3 py-1.5 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-600 sm:text-sm/6"
              />
            </div>
            {errors ? errors.map((msg: errormsg, index) => (
              msg.username ?
                (<span key={index} className="flex justify-center text-center p-1 text-red-500">
                  {msg.username}
                </span>) : ''
            )) : ''}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="block w-full rounded-md bg-white dark:bg-gray-900 px-3 py-1.5 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-600 sm:text-sm/6"
              />
            </div>
            {errors ? errors.map((msg: errormsg, index) => (
              msg.email ?
                (<span key={index} className="flex justify-center text-center p-1 text-red-500">
                  {msg.email}
                </span>) : ''
            )) : ''}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                Password
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="block w-full rounded-md bg-white dark:bg-gray-900 px-3 py-1.5 text-base text-gray-900 dark:text-white outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-600 sm:text-sm/6"
              />
            </div>
            {errors ? errors.map((msg: errormsg, index) => (
              msg.password ?
                (<span key={index} className="flex justify-center text-center p-1 text-red-500">
                  {msg.password}
                </span>) : ''
            )) : ''}
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-orange-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            >
              {isPending ? 'Loading...' : 'Sign in'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500 dark:text-gray-400">
          Already have an account?{'  '}
          <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-500 dark:hover:text-orange-400">
            Log in instead
          </Link>
        </p>
      </div>

      <Toaster richColors position="top-center" />
    </div>


  )
}

