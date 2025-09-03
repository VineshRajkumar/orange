'use client'

import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {  useState } from "react"

export default function PopupBanner() {
  const [open, setOpen] = useState(true)
  const router = useRouter()

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">👋 Looks like you enjoyed Orange Board!</AlertDialogTitle>
          <AlertDialogDescription className="text-sm mt-2 text-muted-foreground">
            You have already tried guest mode. To continue creating rooms and saving your work, please create a free account. It takes less than a minute!
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-orange-400 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900"
          >
            Maybe later
          </Button>
          <Button
            className="bg-orange-500 text-white hover:bg-orange-600"
            onClick={() => {
              setOpen(false)
              router.push('/signup')
            }}
          >
            Register Now
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
