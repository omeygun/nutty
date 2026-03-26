"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { CalendarPlus, Loader2, Lock, Users } from "lucide-react"

import { GroupAvailabilityEditor } from "@/components/group/group-availability-editor"
import { GroupHeatmap } from "@/components/group/group-heatmap"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { formatDateLabel, formatTimeLabel } from "@/lib/date-time"
import {
  buildGoogleCalendarTemplateUrl,
  getGroupEventPublic,
  getGroupEventSubmissions,
  getGroupParticipantAvailability,
  GroupEventPublicData,
  GroupSubmission,
  replaceGroupParticipantAvailability,
  upsertGroupParticipant,
} from "@/lib/group-events"
import { ensureGroupToken, getStoredGroupToken, hashGroupToken } from "@/lib/group-session"
import type { DateAvailability } from "@/types/availability"

export default function PublicGroupEventPage() {
  const params = useParams<{ slug: string }>()
  const { toast } = useToast()
  const [event, setEvent] = useState<GroupEventPublicData | null>(null)
  const [submissions, setSubmissions] = useState<GroupSubmission[]>([])
  const [availability, setAvailability] = useState<DateAvailability[]>([])
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const slug = useMemo(() => params.slug ?? "", [params.slug])
  const confirmedCalendarUrl = useMemo(() => {
    if (
      !event?.confirmed_date ||
      !event.confirmed_start_time ||
      !event.confirmed_end_time ||
      !event.confirmed_title
    ) {
      return null
    }

    return buildGoogleCalendarTemplateUrl({
      title: event.confirmed_title,
      notes: event.confirmed_notes,
      date: event.confirmed_date,
      startTime: event.confirmed_start_time.slice(0, 5),
      endTime: event.confirmed_end_time.slice(0, 5),
      timezone: event.timezone,
    })
  }, [event])

  const loadEvent = async () => {
    if (!slug) return

    const token = getStoredGroupToken(slug)
    const tokenHash = token ? await hashGroupToken(token) : null
    const publicEvent = await getGroupEventPublic(slug, tokenHash)

    setEvent(publicEvent)
    setName(publicEvent.participant?.name ?? "")

    if (publicEvent.participant && tokenHash) {
      const participantAvailability = await getGroupParticipantAvailability(slug, tokenHash)
      setAvailability(
        participantAvailability.map((entry) => ({
          date: entry.date,
          dayOfWeek: new Date(`${entry.date}T12:00:00`).getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6,
          startTime: entry.startTime,
          endTime: entry.endTime,
        }))
      )
    } else {
      setAvailability([])
    }

    if (publicEvent.can_view_results) {
      const groupSubmissions = await getGroupEventSubmissions(slug)
      setSubmissions(groupSubmissions)
    } else {
      setSubmissions([])
    }
  }

  useEffect(() => {
    const load = async () => {
      if (!slug) return

      try {
        setIsLoading(true)
        await loadEvent()
      } catch (error) {
        console.error(error)
        toast({
          title: "Could not load group link",
          description: "This group may no longer be available.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [slug, toast])

  const handleJoin = async () => {
    if (!slug || !name.trim()) {
      return
    }

    try {
      setIsJoining(true)
      const token = ensureGroupToken(slug)
      const tokenHash = await hashGroupToken(token)
      await upsertGroupParticipant(slug, name.trim(), tokenHash)
      await loadEvent()
    } catch (error) {
      console.error(error)
      toast({
        title: "Could not join this group",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  const handleSaveAvailability = async (entries: DateAvailability[]) => {
    if (!slug) return

    try {
      setIsSaving(true)
      const token = ensureGroupToken(slug)
      const tokenHash = await hashGroupToken(token)

      await replaceGroupParticipantAvailability(
        slug,
        tokenHash,
        entries.map((entry) => ({
          date: entry.date,
          startTime: entry.startTime,
          endTime: entry.endTime,
        }))
      )

      await loadEvent()
      toast({
        title: "Availability saved",
        description: "Your submission is now part of the group schedule.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Could not save availability",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container py-8">
        <Card className="rounded-3xl border-border/70 bg-card/90 shadow-sm">
          <CardContent className="p-8 text-center text-muted-foreground">
            This group link is unavailable.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {event.confirmed_date && event.confirmed_start_time && event.confirmed_end_time && event.confirmed_title ? (
        <Card className="mb-8 rounded-3xl border-primary/30 bg-gradient-to-br from-primary/15 via-background to-primary/5 shadow-lg">
          <CardHeader>
            <div className="inline-flex w-fit items-center rounded-full bg-primary/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Final Time Locked In
            </div>
            <CardTitle className="mt-3 flex items-center gap-2">
              <CalendarPlus className="h-5 w-5" />
              Confirmed Meeting Time
            </CardTitle>
            <CardDescription>The organizer has locked in the final slot for this group.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-primary/20 bg-background/90 p-5">
              <div className="text-xl font-semibold">{event.confirmed_title}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {formatDateLabel(event.confirmed_date, event.timezone)} at{" "}
                {formatTimeLabel(event.confirmed_start_time.slice(0, 5))} - {formatTimeLabel(event.confirmed_end_time.slice(0, 5))}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">Timezone: {event.timezone}</div>
            </div>
            {event.confirmed_notes ? (
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground">
                {event.confirmed_notes}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-3">
              {confirmedCalendarUrl ? (
                <a href={confirmedCalendarUrl} target="_blank" rel="noreferrer">
                  <Button className="h-11 rounded-xl">
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Add to Google Calendar
                  </Button>
                </a>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card className="rounded-3xl border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>{event.title}</CardTitle>
            <CardDescription>
              {event.description || "Submit your availability so the organizer can see where the group overlaps."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>Event range: {event.start_date} to {event.end_date}</div>
            <div>Planning timezone: {event.timezone}</div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Group Status
            </CardTitle>
            <CardDescription>{event.participant_count} participant{event.participant_count === 1 ? "" : "s"} have joined so far.</CardDescription>
          </CardHeader>
          <CardContent>
            {event.can_view_results ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-foreground">
                Results are live. You can review the gradient below while updating your own submission.
              </div>
            ) : (
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                <Lock className="mb-2 h-4 w-4" />
                The organizer has not revealed the shared heatmap yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {!event.participant ? (
        <Card className="mb-8 rounded-3xl border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>Join this scheduling link</CardTitle>
            <CardDescription>
              Enter your name once. This browser will remember your submission so you can come back and edit it later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="participant-name">Your name</Label>
              <Input
                id="participant-name"
                value={name}
                onChange={(currentEvent) => setName(currentEvent.target.value)}
                placeholder="Alex, Priya, Jordan..."
                className="h-11 rounded-xl"
              />
            </div>
            <Button className="h-11 rounded-xl" onClick={handleJoin} disabled={isJoining || !name.trim()}>
              {isJoining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Join and Add Availability
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mb-8">
          <GroupAvailabilityEditor
            startDate={event.start_date}
            endDate={event.end_date}
            timezone={event.timezone}
            initialAvailability={availability}
            isSaving={isSaving}
            onSave={handleSaveAvailability}
          />
        </div>
      )}

      {event.can_view_results ? (
        <GroupHeatmap
          title="Group Availability Gradient"
          submissions={submissions}
          startDate={event.start_date}
          endDate={event.end_date}
          timezone={event.timezone}
          totalParticipants={event.participant_count}
        />
      ) : null}
    </div>
  )
}
