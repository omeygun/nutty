"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth-provider"
import { useEffect, useState } from "react"

export function AuthButtons() {
  const { user, signOut, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Only show the UI after the component has mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until the component has mounted
  if (!mounted) {
    return null
  }

  if (isLoading) {
    return (
      <Button variant="ghost" disabled>
        Loading...
      </Button>
    )
  }

  if (user) {
    return (
      <Button variant="ghost" onClick={signOut}>
        Sign Out
      </Button>
    )
  }

  return (
    <div className="flex space-x-2">
      <Button variant="ghost" asChild>
        <Link href="/login">Login</Link>
      </Button>
      <Button asChild>
        <Link href="/signup">Sign Up</Link>
      </Button>
    </div>
  )
}

