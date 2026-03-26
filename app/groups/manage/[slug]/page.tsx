"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { CalendarCheck, CheckCircle2, Copy, ExternalLink, Eye, EyeOff, Link2, Loader2, PenSquare } from "lucide-react"

import { GroupHeatmap } from "@/components/group/group-heatmap"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { formatDateLabel, formatTimeLabel } from "@/lib/date-time"
import {
  BestWindow,
  buildGroupHeatmap,
  confirmGroupEvent,
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  getGroupEventSubmissions,
  getOrganizerGroupEvent,
  getOrganizerGroupParticipantCount,
  GroupEvent,
  GroupSubmission,
  toggleGroupResultsVisibility,
} from "@/lib/group-events"
import { buildConsentPath } from "@/lib/oauth"
import { cn } from "@/lib/utils"

type ConfirmationDraft = {
  date: string
  startTime: string
  endTime: string
  mode: "suggested" | "manual"
}

function isDateWithinRange(date: string, startDate: string, endDate: string) {
  return date >= startDate && date <= endDate
}

export default function ManageGroupEventPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user, session, isLoading: isLoadingUser } = useAuth()
  const [event, setEvent] = useState<GroupEvent | null>(null)
  const [participantCount, setParticipantCount] = useState(0)
  const [submissions, setSubmissions] = useState<GroupSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingReveal, setIsUpdatingReveal] = useState(false)
  const [isGoogleReconnectLoading, setIsGoogleReconnectLoading] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [confirmationDraft, setConfirmationDraft] = useState<ConfirmationDraft | null>(null)
  const [manualDate, setManualDate] = useState("")
  const [manualStartTime, setManualStartTime] = useState("")
  const [manualEndTime, setManualEndTime] = useState("")
  const [confirmationTitle, setConfirmationTitle] = useState("")
  const [confirmationNotes, setConfirmationNotes] = useState("")
  const [confirmationFormError, setConfirmationFormError] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  const shareUrl = useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
    return event ? `${baseUrl}/groups/${event.slug}` : ""
  }, [event])

  const providerToken = (session as { provider_token?: string | null } | null)?.provider_token ?? null
  const heatmap = useMemo(() => {
    if (!event) {
      return null
    }

    return buildGroupHeatmap(event.start_date, event.end_date, submissions, participantCount)
  }, [event, participantCount, submissions])

  const showConfirmationSuccess = searchParams.get("confirmed") === "1"
  const replacedPrevious = searchParams.get("replaced") === "1"
  const hasExistingConfirmation = Boolean(
    event?.confirmed_date && event?.confirmed_start_time && event?.confirmed_end_time && event?.confirmed_title
  )

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.push("/login")
    }
  }, [isLoadingUser, router, user])

  useEffect(() => {
    const load = async () => {
      if (!params.slug || !user) {
        return
      }

      try {
        setIsLoading(true)
        const groupEvent = await getOrganizerGroupEvent(params.slug)
        const [count, groupSubmissions] = await Promise.all([
          getOrganizerGroupParticipantCount(groupEvent.id),
          getGroupEventSubmissions(params.slug),
        ])

        setEvent(groupEvent)
        setParticipantCount(count)
        setSubmissions(groupSubmissions)
      } catch (error) {
        console.error(error)
        toast({
          title: "Could not load group event",
          description: "This link may be invalid or you may not own it.",
          variant: "destructive",
        })
        router.push("/groups/new")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [params.slug, router, toast, user])

  const copyLink = async () => {
    if (!shareUrl) return

    await navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Link copied",
      description: "You can send the group link to participants now.",
    })
  }

  const setReveal = async (nextValue: boolean) => {
    if (!event) return

    try {
      setIsUpdatingReveal(true)
      const updated = await toggleGroupResultsVisibility(event.slug, nextValue)
      setEvent(updated)
    } catch (error) {
      console.error(error)
      toast({
        title: "Could not update visibility",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingReveal(false)
    }
  }

  const seedConfirmationFields = () => {
    setConfirmationTitle(event?.confirmed_title || event?.title || "")
    setConfirmationNotes(event?.confirmed_notes || event?.description || "")
    setConfirmationFormError(null)
  }

  const openSuggestedConfirmDialog = (window: BestWindow) => {
    setConfirmationDraft({
      date: window.date,
      startTime: window.startTime,
      endTime: window.endTime,
      mode: "suggested",
    })
    setManualDate(window.date)
    setManualStartTime(window.startTime)
    setManualEndTime(window.endTime)
    seedConfirmationFields()
    setIsConfirmDialogOpen(true)
  }

  const openManualConfirmDialog = () => {
    setConfirmationDraft({
      date: event?.confirmed_date || event?.start_date || "",
      startTime: event?.confirmed_start_time?.slice(0, 5) || "09:00",
      endTime: event?.confirmed_end_time?.slice(0, 5) || "10:00",
      mode: "manual",
    })
    setManualDate(event?.confirmed_date || event?.start_date || "")
    setManualStartTime(event?.confirmed_start_time?.slice(0, 5) || "09:00")
    setManualEndTime(event?.confirmed_end_time?.slice(0, 5) || "10:00")
    seedConfirmationFields()
    setIsConfirmDialogOpen(true)
  }

  const handleReconnectGoogle = async () => {
    setIsGoogleReconnectLoading(true)
    router.push(buildConsentPath(window.location.pathname + window.location.search))
  }

  const getActiveConfirmationSlot = () => {
    if (!event || !confirmationDraft) {
      return { error: "Choose a slot before confirming." }
    }

    const slot =
      confirmationDraft.mode === "manual"
        ? {
            date: manualDate,
            startTime: manualStartTime,
            endTime: manualEndTime,
          }
        : {
            date: confirmationDraft.date,
            startTime: confirmationDraft.startTime,
            endTime: confirmationDraft.endTime,
          }

    if (!slot.date || !slot.startTime || !slot.endTime) {
      return { error: "Date, start time, and end time are required." }
    }

    if (!isDateWithinRange(slot.date, event.start_date, event.end_date)) {
      return { error: "Custom confirmations must stay inside the group event date range." }
    }

    if (slot.startTime >= slot.endTime) {
      return { error: "End time must be later than the start time." }
    }

    return { slot }
  }

  const closeConfirmDialog = (open: boolean) => {
    setIsConfirmDialogOpen(open)
    if (!open) {
      setConfirmationFormError(null)
      setConfirmationDraft(null)
    }
  }

  const handleConfirmTime = async () => {
    if (!event || !user) {
      return
    }

    const activeSlot = getActiveConfirmationSlot()
    if ("error" in activeSlot) {
      setConfirmationFormError(activeSlot.error ?? "Please choose a valid time.")
      return
    }

    if (!confirmationTitle.trim()) {
      setConfirmationFormError("Add a meeting title before confirming this time.")
      return
    }

    if (!providerToken) {
      toast({
        title: "Google Calendar access required",
        description: "Reconnect with Google so Nutty can create the event on your calendar.",
        variant: "destructive",
      })
      return
    }

    const replacingExistingConfirmation = Boolean(event.confirmed_google_event_id || event.confirmed_date)
    const previousGoogleEventId = event.confirmed_google_event_id
    let newGoogleEventId: string | null = null

    try {
      setIsConfirming(true)
      setConfirmationFormError(null)

      const googleEvent = await createGoogleCalendarEvent({
        accessToken: providerToken,
        timezone: event.timezone,
        title: confirmationTitle.trim(),
        notes: confirmationNotes,
        date: activeSlot.slot.date,
        startTime: activeSlot.slot.startTime,
        endTime: activeSlot.slot.endTime,
      })

      newGoogleEventId = googleEvent.id ?? null

      const updated = await confirmGroupEvent(event.slug, {
        date: activeSlot.slot.date,
        startTime: activeSlot.slot.startTime,
        endTime: activeSlot.slot.endTime,
        title: confirmationTitle.trim(),
        notes: confirmationNotes,
        googleEventId: googleEvent.id ?? null,
        googleEventUrl: googleEvent.htmlLink ?? null,
        confirmedBy: user.id,
      })

      setEvent(updated)
      setIsConfirmDialogOpen(false)
      setConfirmationDraft(null)

      if (previousGoogleEventId) {
        try {
          await deleteGoogleCalendarEvent({
            accessToken: providerToken,
            eventId: previousGoogleEventId,
          })
        } catch (cleanupError) {
          console.error("Failed to delete the previous confirmed calendar event", cleanupError)
          toast({
            title: "Old calendar event still exists",
            description: "The new confirmation succeeded, but the previous Google Calendar event could not be deleted automatically.",
            variant: "destructive",
          })
        }
      }

      router.push(`/groups/manage/${event.slug}?confirmed=1${replacingExistingConfirmation ? "&replaced=1" : ""}`)
    } catch (error) {
      if (newGoogleEventId && providerToken) {
        try {
          await deleteGoogleCalendarEvent({
            accessToken: providerToken,
            eventId: newGoogleEventId,
          })
        } catch (cleanupError) {
          console.error("Failed to clean up replacement calendar event", cleanupError)
        }
      }

      console.error(error)
      const description = error instanceof Error ? error.message : "Please try again."
      setConfirmationFormError(description)
      toast({
        title: "Could not confirm the meeting time",
        description,
        variant: "destructive",
      })
    } finally {
      setIsConfirming(false)
    }
  }

  const exitConfirmationSuccess = () => {
    if (!event) {
      return
    }

    router.replace(`/groups/manage/${event.slug}`)
  }

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!event) {
    return null
  }

  if (showConfirmationSuccess && hasExistingConfirmation) {
    return (
      <div className="container py-8">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/15 via-background to-primary/5 shadow-lg">
          <CardHeader className="space-y-4">
            <div className="inline-flex w-fit items-center rounded-full bg-primary/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Final Time Locked In
            </div>
            <CardTitle className="flex items-center gap-3 text-3xl">
              <CheckCircle2 className="h-7 w-7 text-primary" />
              {replacedPrevious ? "Confirmation Updated" : "Meeting Confirmed"}
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-6 text-foreground/80">
              {replacedPrevious
                ? "The previous confirmed meeting was replaced and the latest slot is now the official group time."
                : "The meeting has been added to your Google Calendar and is now the official time for this group."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-3xl border border-primary/30 bg-background/90 p-6">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Confirmed meeting</div>
              <div className="mt-3 text-2xl font-semibold">{event.confirmed_title}</div>
              <div className="mt-2 text-base text-muted-foreground">
                {formatDateLabel(event.confirmed_date!, event.timezone)} at {formatTimeLabel(event.confirmed_start_time!.slice(0, 5))} -{" "}
                {formatTimeLabel(event.confirmed_end_time!.slice(0, 5))}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">Timezone: {event.timezone}</div>
              {event.confirmed_notes ? (
                <div className="mt-4 rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                  {event.confirmed_notes}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              {event.confirmed_google_event_url ? (
                <a href={event.confirmed_google_event_url} target="_blank" rel="noreferrer">
                  <Button className="h-11 rounded-xl">
                    Open Google Calendar Event
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              ) : null}
              <Button variant="outline" className="h-11 rounded-xl" onClick={copyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Group Link
              </Button>
              <Button variant="ghost" className="h-11 rounded-xl" onClick={exitConfirmationSuccess}>
                Back to Organizer Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <Card className="rounded-3xl border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>{event.title}</CardTitle>
            <CardDescription>
              {event.description || "Manage your share link, watch submissions arrive, and reveal the heatmap when you’re ready."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Share link</div>
              <div className="mt-2 break-all text-sm">{shareUrl}</div>
            </div>
            <Button className="h-11 rounded-xl" onClick={copyLink}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Group Link
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Link2 className="mr-2 h-5 w-5" />
              Organizer Controls
            </CardTitle>
            <CardDescription>Participants can submit immediately, but results stay hidden until you reveal them.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Participant count</div>
              <div className="mt-2 text-2xl font-semibold">{participantCount}</div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/30 p-4">
              <div>
                <div className="font-medium">Reveal results</div>
                <div className="text-sm text-muted-foreground">
                  {event.results_visible ? "Everyone with the link can see the heatmap." : "Only you can preview the heatmap right now."}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {event.results_visible ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                <Switch checked={event.results_visible} disabled={isUpdatingReveal} onCheckedChange={setReveal} />
              </div>
            </div>
            {!providerToken ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="font-medium">Google Calendar not connected</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Reconnect with Google to create the confirmed meeting directly on your calendar.
                </div>
                <Button
                  className="mt-4 h-10 rounded-xl"
                  variant="outline"
                  onClick={handleReconnectGoogle}
                  disabled={isGoogleReconnectLoading}
                >
                  {isGoogleReconnectLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Connect Google Calendar
                </Button>
              </div>
            ) : null}
            {hasExistingConfirmation ? (
              <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-background to-primary/5 p-5 shadow-sm">
                <div className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                  Confirmed Final Time
                </div>
                <div className="mt-4 text-xl font-semibold">{event.confirmed_title}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {formatDateLabel(event.confirmed_date!, event.timezone)} at {formatTimeLabel(event.confirmed_start_time!.slice(0, 5))} -{" "}
                  {formatTimeLabel(event.confirmed_end_time!.slice(0, 5))}
                </div>
                {event.confirmed_notes ? (
                  <div className="mt-4 rounded-2xl border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground">
                    {event.confirmed_notes}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-3">
                  {event.confirmed_google_event_url ? (
                    <a
                      href={event.confirmed_google_event_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                    >
                      Open Google Calendar Event
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <GroupHeatmap
        title="Availability Gradient"
        description="Organizer preview. Scroll the heatmap while keeping the selected slot details visible."
        submissions={submissions}
        startDate={event.start_date}
        endDate={event.end_date}
        timezone={event.timezone}
        totalParticipants={participantCount}
        showParticipantDetails
      />

      <Card className="mt-6 rounded-3xl border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5" />
              Confirm a Meeting Time
            </CardTitle>
            <CardDescription>
              Pick one of the strongest overlap windows below or set your own date and time, then create the event on your Google Calendar.
            </CardDescription>
          </div>
          <Button variant="outline" className="rounded-xl" onClick={openManualConfirmDialog}>
            <PenSquare className="mr-2 h-4 w-4" />
            Choose Custom Time
          </Button>
        </CardHeader>
        <CardContent>
          {!heatmap || heatmap.bestWindows.length === 0 ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 p-4 text-sm text-muted-foreground">
                No overlapping windows are available yet.
              </div>
              <Button variant="outline" className="rounded-xl" onClick={openManualConfirmDialog}>
                Confirm a Custom Time Anyway
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {heatmap.bestWindows.map((window) => {
                const isCurrentConfirmation =
                  event.confirmed_date === window.date &&
                  event.confirmed_start_time?.slice(0, 5) === window.startTime &&
                  event.confirmed_end_time?.slice(0, 5) === window.endTime

                return (
                  <div
                    key={`${window.date}-${window.startTime}-${window.endTime}`}
                    className={cn(
                      "rounded-2xl border p-4",
                      isCurrentConfirmation
                        ? "border-primary/40 bg-primary/10 shadow-sm"
                        : "border-border/70 bg-muted/30"
                    )}
                  >
                    <div className="font-medium">{formatDateLabel(window.date, event.timezone)}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {formatTimeLabel(window.startTime)} - {formatTimeLabel(window.endTime)}
                    </div>
                    <div className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {window.availableCount}/{window.totalParticipants} participants free
                    </div>
                    <Button className="mt-4 h-10 w-full rounded-xl" onClick={() => openSuggestedConfirmDialog(window)}>
                      {isCurrentConfirmation ? "Replace This Confirmation" : "Confirm This Time"}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isConfirmDialogOpen} onOpenChange={closeConfirmDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{confirmationDraft?.mode === "manual" ? "Confirm a Custom Meeting Time" : "Confirm Group Meeting"}</DialogTitle>
            <DialogDescription>
              {confirmationDraft
                ? confirmationDraft.mode === "manual"
                  ? "Choose any date within the event range and set the exact start and end time."
                  : `${formatDateLabel(confirmationDraft.date, event.timezone)} at ${formatTimeLabel(confirmationDraft.startTime)} - ${formatTimeLabel(confirmationDraft.endTime)}`
                : "Choose the title and notes that will be sent to Google Calendar."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {confirmationDraft?.mode === "manual" ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="manual-date">Date</Label>
                  <Input
                    id="manual-date"
                    type="date"
                    value={manualDate}
                    min={event.start_date}
                    max={event.end_date}
                    onChange={(currentEvent) => setManualDate(currentEvent.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-start-time">Start time</Label>
                  <Input
                    id="manual-start-time"
                    type="time"
                    value={manualStartTime}
                    onChange={(currentEvent) => setManualStartTime(currentEvent.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-end-time">End time</Label>
                  <Input
                    id="manual-end-time"
                    type="time"
                    value={manualEndTime}
                    onChange={(currentEvent) => setManualEndTime(currentEvent.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                {confirmationDraft
                  ? `${formatDateLabel(confirmationDraft.date, event.timezone)} at ${formatTimeLabel(confirmationDraft.startTime)} - ${formatTimeLabel(confirmationDraft.endTime)}`
                  : null}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="confirmation-title">Event title</Label>
              <Input
                id="confirmation-title"
                value={confirmationTitle}
                onChange={(currentEvent) => setConfirmationTitle(currentEvent.target.value)}
                placeholder="Coffee, project sync, dinner..."
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmation-notes">Notes</Label>
              <Textarea
                id="confirmation-notes"
                value={confirmationNotes}
                onChange={(currentEvent) => setConfirmationNotes(currentEvent.target.value)}
                placeholder="Optional agenda or location"
                className="min-h-[120px] rounded-2xl"
              />
            </div>
            {confirmationFormError ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {confirmationFormError}
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => closeConfirmDialog(false)}>
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={handleConfirmTime} disabled={isConfirming || !confirmationDraft}>
              {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {hasExistingConfirmation ? "Replace and Save Final Time" : "Confirm and Add to Google Calendar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
