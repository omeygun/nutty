"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { Badge } from "@/components/ui/badge"
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
import { formatDateLabel, formatTimeLabel } from "@/lib/date-time"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/supabase"
import { Calendar, Clock, Link2, Loader2, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

type GroupEventRow = Database["public"]["Tables"]["group_events"]["Row"]

type DashboardActivity = {
  id: string
  slug: string
  title: string
  description: string | null
  timezone: string
  confirmedDate: string | null
  confirmedStartTime: string | null
  confirmedEndTime: string | null
  startDate: string
  endDate: string
  updatedAt: string
  participantCount: number
  status: "confirmed" | "planning"
}

function toLocalIsoDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function sortIncomingActivities(a: DashboardActivity, b: DashboardActivity) {
  if (a.status !== b.status) {
    return a.status === "confirmed" ? -1 : 1
  }

  if (a.status === "confirmed" && b.status === "confirmed") {
    const aStamp = `${a.confirmedDate ?? ""}${a.confirmedStartTime ?? ""}`
    const bStamp = `${b.confirmedDate ?? ""}${b.confirmedStartTime ?? ""}`
    return aStamp.localeCompare(bStamp)
  }

  return b.updatedAt.localeCompare(a.updatedAt)
}

function sortRecentActivities(a: DashboardActivity, b: DashboardActivity) {
  return b.updatedAt.localeCompare(a.updatedAt)
}

function ActivityCard({ activity }: { activity: DashboardActivity }) {
  const isConfirmed = activity.status === "confirmed"

  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{activity.title}</div>
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full">
              Organizer
            </Badge>
            <Badge variant={isConfirmed ? "default" : "secondary"} className="rounded-full">
              {isConfirmed ? "Confirmed" : "Planning"}
            </Badge>
          </div>
        </div>
        <Button asChild size="sm" className="rounded-xl">
          <Link href={`/groups/manage/${activity.slug}`}>Open Event</Link>
        </Button>
      </div>

      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        {isConfirmed && activity.confirmedDate && activity.confirmedStartTime && activity.confirmedEndTime ? (
          <div>
            {formatDateLabel(activity.confirmedDate, activity.timezone)} at{" "}
            {formatTimeLabel(activity.confirmedStartTime.slice(0, 5))} - {formatTimeLabel(activity.confirmedEndTime.slice(0, 5))}
          </div>
        ) : (
          <div>
            Planning window: {activity.startDate} to {activity.endDate}
          </div>
        )}
        <div>{activity.participantCount} participant{activity.participantCount === 1 ? "" : "s"}</div>
        <div>Timezone: {activity.timezone}</div>
        {activity.description ? <div className="line-clamp-2">{activity.description}</div> : null}
      </div>
    </div>
  )
}

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
  const [activities, setActivities] = useState<DashboardActivity[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)
  const [activityError, setActivityError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      const meta = user.user_metadata || {}
      setDisplayName(meta.full_name || "")
      setFirstName(meta.first_name || "")
      setLastName(meta.last_name || "")
      setAvatarUrl(meta.avatar_url || null)
    }
  }, [user])

  useEffect(() => {
    const loadActivities = async () => {
      if (!user || !supabase) {
        return
      }

      try {
        setIsLoadingActivities(true)
        setActivityError(null)

        const { data: events, error: eventsError } = await supabase
          .from("group_events")
          .select("*")
          .eq("organizer_id", user.id)
          .order("updated_at", { ascending: false })

        if (eventsError) {
          throw eventsError
        }

        const eventRows = (events ?? []) as GroupEventRow[]
        const eventIds = eventRows.map((event) => event.id)

        const participantCounts = new Map<string, number>()

        if (eventIds.length > 0) {
          const { data: participants, error: participantsError } = await supabase
            .from("group_participants")
            .select("event_id")
            .in("event_id", eventIds)

          if (participantsError) {
            throw participantsError
          }

          for (const participant of participants ?? []) {
            const currentCount = participantCounts.get(participant.event_id) ?? 0
            participantCounts.set(participant.event_id, currentCount + 1)
          }
        }

        setActivities(
          eventRows.map((event) => ({
            id: event.id,
            slug: event.slug,
            title: event.confirmed_title || event.title,
            description: event.confirmed_notes || event.description,
            timezone: event.timezone,
            confirmedDate: event.confirmed_date,
            confirmedStartTime: event.confirmed_start_time,
            confirmedEndTime: event.confirmed_end_time,
            startDate: event.start_date,
            endDate: event.end_date,
            updatedAt: event.updated_at,
            participantCount: participantCounts.get(event.id) ?? 0,
            status: event.confirmed_date ? "confirmed" : "planning",
          }))
        )
      } catch (error) {
        console.error(error)
        setActivityError(error instanceof Error ? error.message : "Could not load your activity.")
      } finally {
        setIsLoadingActivities(false)
      }
    }

    loadActivities()
  }, [user])

  const incomingActivities = useMemo(() => {
    const today = toLocalIsoDate()
    return activities
      .filter((activity) => !activity.confirmedDate || activity.confirmedDate >= today)
      .sort(sortIncomingActivities)
  }, [activities])

  const recentActivities = useMemo(() => {
    const today = toLocalIsoDate()
    return activities
      .filter((activity) => activity.confirmedDate && activity.confirmedDate < today)
      .sort(sortRecentActivities)
  }, [activities])

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
    <div className="flex min-h-screen flex-col">
      <main className="flex-grow px-4 py-8 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

          <div className="mb-8">
            <Card>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-[250px_1fr]">
                <div>
                  <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>See what you're up to</CardDescription>
                  </CardHeader>

                  <CardContent>
                    {avatarUrl && (
                      <div className="relative mb-4 aspect-square w-[100px]">
                        <Image
                          src={avatarUrl}
                          alt="Profile Picture"
                          fill
                          className="rounded-full"
                          style={{
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    )}
                    <p className="break-all text-3xl font-bold md:mb-4">
                      {displayName || `${firstName} ${lastName}` || "Unnamed"}
                    </p>
                  </CardContent>
                </div>

                <Card className="m-2 space-y-4 p-4 md:m-6">
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

                  {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

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

          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <Card className="rounded-3xl border-border/70 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle>Your Activity</CardTitle>
                <CardDescription>Incoming scheduling work and recently confirmed events you organized.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Incoming</div>
                  {isLoadingActivities ? (
                    <div className="flex items-center rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading activity...
                    </div>
                  ) : activityError ? (
                    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                      {activityError}
                    </div>
                  ) : incomingActivities.length > 0 ? (
                    <div className="space-y-3">
                      {incomingActivities.map((activity) => (
                        <ActivityCard key={activity.id} activity={activity} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-4 text-sm text-muted-foreground">
                      No incoming organizer activity yet. Create a group link to start collecting availability.
                    </div>
                  )}
                </div>

                <div>
                  <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Recent</div>
                  {recentActivities.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivities.map((activity) => (
                        <ActivityCard key={activity.id} activity={activity} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-4 text-sm text-muted-foreground">
                      Recent confirmed activity will show up here after your meetings pass.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/70 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump back into the scheduling tools you use most.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>My Availability</CardTitle>
                    <CardDescription>Manage your free time slots</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-muted-foreground">
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
                    <p className="mb-4 text-muted-foreground">
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
                    <p className="mb-4 text-muted-foreground">
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

                <Card>
                  <CardHeader>
                    <CardTitle>Group Links</CardTitle>
                    <CardDescription>Create one-click scheduling pages</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-muted-foreground">
                      Share a link with any group and collect availability in one place.
                    </p>
                    <Button asChild>
                      <Link href="/groups/new">
                        <Link2 className="mr-2 h-4 w-4" />
                        Create Group Link
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
