"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Calendar, Clock, Users } from "lucide-react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {
  const { user, isLoading, signOut } = useAuth()
  const router = useRouter()

  const [displayName, setDisplayName] = useState<string>("")
  const [firstName, setFirstName] = useState<string>("")
  const [lastName, setLastName] = useState<string>("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    console.log(user)
    if (user) {
      const meta = user.user_metadata || {}
      setDisplayName(meta.full_name || "")
      setFirstName(meta.first_name || "")
      setLastName(meta.last_name || "")
      setAvatarUrl(meta.avatar_url || null)
    }
  }, [user])

  const handleSave = async () => {
    if (!user || !supabase) return
    setIsSaving(true)
    setErrorMessage(null)

    try {
      let newAvatarUrl = avatarUrl

      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop()
        const filePath = `public/${user.id}.${fileExt}`

        await supabase.storage.from("avatars").remove([filePath])

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, {
            cacheControl: "3600",
            upsert: true,
            contentType: avatarFile.type,
          })

        if (uploadError) throw uploadError
        const { data } = await supabase.storage.from("avatars").getPublicUrl(filePath)
        newAvatarUrl = data.publicUrl
        setAvatarUrl(newAvatarUrl)
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: displayName,
          first_name: firstName,
          last_name: lastName,
          avatar_url: newAvatarUrl,
        },
      })
      if (updateError) throw updateError

      // Update or insert into the public.profiles table
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        avatar_url: newAvatarUrl,
      })
      if (profileError) throw profileError

    } catch (err: any) {
      console.error(err)
      setErrorMessage(err.message ?? "Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

          <div className="mb-8">
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
                <div>
                  <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>See what you're up to</CardDescription>
                  </CardHeader>

                  <CardContent>
                    {avatarUrl && (
                      <div className="mb-4 aspect-square relative w-[100px]">
                        <Image
                          src={avatarUrl}
                          alt="Profile Picture"
                          // width={96}
                          // height={96}
                          fill={true}
                          className="rounded-full"
                          style={{
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    )}
                    <p className="font-bold text-3xl md:mb-4 break-all">
                      {displayName || `${firstName} ${lastName}` || "Unnamed"}
                    </p>
                  </CardContent>
                </div>

                <Card className="m-2 md:m-6 p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar">Profile image</Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.length) {
                          setAvatarFile(e.target.files[0])
                        }
                      }}
                    />
                  </div>

                  {errorMessage && (
                    <p className="text-destructive text-sm">{errorMessage}</p>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={isSaving || (!avatarFile && !displayName && !firstName && !lastName)}>
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button variant="secondary" onClick={() => signOut()}>
                      Sign out
                    </Button>
                  </div>
                </Card>
              </div>
            </Card>
          </div>

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
                <p className="text-muted-foreground mb-4">
                  Select friends and find overlapping free time slots
                </p>
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
                <p className="text-muted-foreground mb-4">
                  Connect with your university peers
                </p>
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
