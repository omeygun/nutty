"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Calendar, Clock, Users } from "lucide-react"

export default function DashboardPage() {
  const { user, isLoading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in the useEffect
  }

  return (
    <div className="flex flex-col min-h-screen">
      

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Availability</CardTitle>
                <CardDescription>Manage your free time slots</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Set up your regular availability to help find common meeting times
                </p>
                <Button asChild>
                  <Link href="/availability">
                    <Clock className="mr-2 h-4 w-4" />
                    Manage Availability
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Find Common Time</CardTitle>
                <CardDescription>Find the best time to meet with friends</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Select friends and find overlapping free time slots</p>
                <Button asChild>
                  <Link href="/find-time">
                    <Calendar className="mr-2 h-4 w-4" />
                    Find Time
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Friends</CardTitle>
                <CardDescription>Manage your friends list</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Connect with your university peers</p>
                <Button asChild>
                  <Link href="/friends">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Friends
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

