import { addDays } from "date-fns"

import { supabase } from "@/lib/supabase"

export type GroupEvent = {
  id: string
  slug: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  timezone: string
  results_visible: boolean
  status: string
  organizer_id: string
  confirmed_date: string | null
  confirmed_start_time: string | null
  confirmed_end_time: string | null
  confirmed_title: string | null
  confirmed_notes: string | null
  confirmed_google_event_id: string | null
  confirmed_google_event_url: string | null
  confirmed_at: string | null
  confirmed_by: string | null
  created_at: string
  updated_at: string
}

export type GroupParticipant = {
  id: string
  name: string
}

export type GroupAvailabilityEntry = {
  date: string
  startTime: string
  endTime: string
}

export type GroupSubmission = {
  participantId: string
  participantName: string
  date: string
  startTime: string
  endTime: string
}

export type GroupEventPublicData = {
  id: string
  slug: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  timezone: string
  results_visible: boolean
  can_view_results: boolean
  participant_count: number
  confirmed_date: string | null
  confirmed_start_time: string | null
  confirmed_end_time: string | null
  confirmed_title: string | null
  confirmed_notes: string | null
  confirmed_google_event_url: string | null
  confirmed_at: string | null
  participant: GroupParticipant | null
}

export type HeatmapCell = {
  date: string
  time: string
  availableCount: number
  totalParticipants: number
  intensity: number
  participants: GroupParticipant[]
}

export type BestWindow = {
  date: string
  startTime: string
  endTime: string
  availableCount: number
  totalParticipants: number
}

export type GroupConfirmationInput = {
  date: string
  startTime: string
  endTime: string
  title: string
  notes?: string
  googleEventId?: string | null
  googleEventUrl?: string | null
  confirmedBy: string
}

export type GoogleCalendarEventInput = {
  accessToken: string
  timezone: string
  title: string
  notes?: string
  date: string
  startTime: string
  endTime: string
}

export type GoogleCalendarEventResult = {
  id?: string
  htmlLink?: string
}

const DEFAULT_START_MINUTES = 8 * 60
const DEFAULT_END_MINUTES = 20 * 60
const TIME_BUCKET_MINUTES = 30

function toReadableError(error: unknown) {
  if (error instanceof Error) {
    return error
  }

  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>
    const parts = [record.message, record.details, record.hint].filter(
      (value): value is string => typeof value === "string" && value.trim().length > 0
    )

    if (parts.length > 0) {
      return new Error(parts.join(" "))
    }
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return new Error(error)
  }

  return new Error("Unknown Supabase error")
}

function ensureSupabase() {
  if (!supabase) {
    throw new Error("Supabase client not initialized")
  }

  return supabase
}

function minutesFromTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function timeFromMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

function toIsoDateTime(date: string, time: string) {
  return `${date}T${time.length === 5 ? `${time}:00` : time}`
}

function toGoogleCalendarStamp(date: string, time: string) {
  return `${date.replaceAll("-", "")}T${time.replace(":", "")}00`
}

function normalizeSubmission(row: any): GroupSubmission {
  return {
    participantId: row.participant_id,
    participantName: row.participant_name,
    date: row.date,
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
  }
}

function dateRange(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T12:00:00`)
  const end = new Date(`${endDate}T12:00:00`)
  const dates: string[] = []

  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    dates.push(cursor.toISOString().slice(0, 10))
  }

  return dates
}

function timeBuckets(submissions: GroupSubmission[]) {
  if (submissions.length === 0) {
    return Array.from(
      { length: (DEFAULT_END_MINUTES - DEFAULT_START_MINUTES) / TIME_BUCKET_MINUTES },
      (_, index) => timeFromMinutes(DEFAULT_START_MINUTES + index * TIME_BUCKET_MINUTES)
    )
  }

  const minMinutes = Math.min(...submissions.map((slot) => minutesFromTime(slot.startTime)))
  const maxMinutes = Math.max(...submissions.map((slot) => minutesFromTime(slot.endTime)))
  const normalizedStart = Math.max(0, Math.floor(minMinutes / TIME_BUCKET_MINUTES) * TIME_BUCKET_MINUTES)
  const normalizedEnd = Math.min(24 * 60, Math.ceil(maxMinutes / TIME_BUCKET_MINUTES) * TIME_BUCKET_MINUTES)
  const bucketCount = Math.max(1, (normalizedEnd - normalizedStart) / TIME_BUCKET_MINUTES)

  return Array.from(
    { length: bucketCount },
    (_, index) => timeFromMinutes(normalizedStart + index * TIME_BUCKET_MINUTES)
  )
}

export async function createGroupEvent(input: {
  title: string
  description?: string
  startDate: string
  endDate: string
  timezone: string
}) {
  const client = ensureSupabase()
  const { data, error } = await client.rpc("create_group_event", {
    p_title: input.title,
    p_description: input.description ?? "",
    p_start_date: input.startDate,
    p_end_date: input.endDate,
    p_timezone: input.timezone,
  })

  if (error) {
    throw toReadableError(error)
  }

  return data as GroupEvent
}

export async function getOrganizerGroupEvent(slug: string) {
  const client = ensureSupabase()
  const { data, error } = await client.from("group_events").select("*").eq("slug", slug).single()

  if (error) {
    throw toReadableError(error)
  }

  return data as GroupEvent
}

export async function getOrganizerGroupParticipantCount(eventId: string) {
  const client = ensureSupabase()
  const { count, error } = await client
    .from("group_participants")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)

  if (error) {
    throw toReadableError(error)
  }

  return count ?? 0
}

export async function toggleGroupResultsVisibility(slug: string, visible: boolean) {
  const client = ensureSupabase()
  const { data, error } = await client.rpc("toggle_group_results_visibility", {
    p_slug: slug,
    p_results_visible: visible,
  })

  if (error) {
    throw toReadableError(error)
  }

  return data as GroupEvent
}

export async function confirmGroupEvent(slug: string, input: GroupConfirmationInput) {
  const client = ensureSupabase()
  const { data, error } = await client
    .from("group_events")
    .update({
      confirmed_date: input.date,
      confirmed_start_time: input.startTime,
      confirmed_end_time: input.endTime,
      confirmed_title: input.title,
      confirmed_notes: input.notes?.trim() || null,
      confirmed_google_event_id: input.googleEventId ?? null,
      confirmed_google_event_url: input.googleEventUrl ?? null,
      confirmed_at: new Date().toISOString(),
      confirmed_by: input.confirmedBy,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug)
    .select("*")
    .single()

  if (error) {
    throw toReadableError(error)
  }

  return data as GroupEvent
}

export async function getGroupEventPublic(slug: string, editTokenHash?: string | null) {
  const client = ensureSupabase()
  const { data, error } = await client.rpc("get_group_event_public", {
    p_slug: slug,
    p_edit_token_hash: editTokenHash ?? null,
  })

  if (error) {
    throw toReadableError(error)
  }

  return data as GroupEventPublicData
}

export async function upsertGroupParticipant(slug: string, name: string, editTokenHash: string) {
  const client = ensureSupabase()
  const { data, error } = await client.rpc("upsert_group_participant", {
    p_slug: slug,
    p_name: name,
    p_edit_token_hash: editTokenHash,
  })

  if (error) {
    throw toReadableError(error)
  }

  return data as GroupParticipant
}

export async function getGroupParticipantAvailability(slug: string, editTokenHash: string) {
  const client = ensureSupabase()
  const { data, error } = await client.rpc("get_group_participant_availability", {
    p_slug: slug,
    p_edit_token_hash: editTokenHash,
  })

  if (error) {
    throw toReadableError(error)
  }

  return (data ?? []).map((row: any) => ({
    date: row.date,
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
  })) as GroupAvailabilityEntry[]
}

export async function replaceGroupParticipantAvailability(
  slug: string,
  editTokenHash: string,
  entries: GroupAvailabilityEntry[]
) {
  const client = ensureSupabase()
  const { data, error } = await client.rpc("replace_group_participant_availability", {
    p_slug: slug,
    p_edit_token_hash: editTokenHash,
    p_entries: entries.map((entry) => ({
      date: entry.date,
      start_time: entry.startTime,
      end_time: entry.endTime,
    })),
  })

  if (error) {
    throw toReadableError(error)
  }

  return data as { participant_id: string; count: number }
}

export async function getGroupEventSubmissions(slug: string) {
  const client = ensureSupabase()
  const { data, error } = await client.rpc("get_group_event_submissions", {
    p_slug: slug,
  })

  if (error) {
    throw toReadableError(error)
  }

  return (data ?? []).map(normalizeSubmission)
}

export async function createGoogleCalendarEvent(input: GoogleCalendarEventInput) {
  const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: input.title,
      description: input.notes?.trim() || undefined,
      start: {
        dateTime: toIsoDateTime(input.date, input.startTime),
        timeZone: input.timezone,
      },
      end: {
        dateTime: toIsoDateTime(input.date, input.endTime),
        timeZone: input.timezone,
      },
    }),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.error_description ||
      "Google Calendar event creation failed"
    throw new Error(message)
  }

  return {
    id: payload?.id as string | undefined,
    htmlLink: payload?.htmlLink as string | undefined,
  } satisfies GoogleCalendarEventResult
}

export async function deleteGoogleCalendarEvent(input: { accessToken: string; eventId: string }) {
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${input.eventId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
    },
  })

  const payload = await response.json().catch(() => null)
  const errorReason = payload?.error?.errors?.[0]?.reason

  // Treat deletion as idempotent. If the organizer already removed the event
  // directly in Google Calendar, there is nothing left for Nutty to clean up.
  if (response.ok || response.status === 404 || response.status === 410 || errorReason === "notFound") {
    return
  }

  const message =
    payload?.error?.message ||
    payload?.error_description ||
    "Google Calendar event deletion failed"

  throw new Error(message)
}

export function buildGoogleCalendarTemplateUrl(input: {
  title: string
  notes?: string | null
  date: string
  startTime: string
  endTime: string
  timezone: string
}) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: `${toGoogleCalendarStamp(input.date, input.startTime)}/${toGoogleCalendarStamp(input.date, input.endTime)}`,
    ctz: input.timezone,
  })

  if (input.notes?.trim()) {
    params.set("details", input.notes.trim())
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function buildGroupHeatmap(
  startDate: string,
  endDate: string,
  submissions: GroupSubmission[],
  totalParticipants: number
) {
  const dates = dateRange(startDate, endDate)
  const times = timeBuckets(submissions)

  const cells: HeatmapCell[] = dates.flatMap((date) =>
    times.map((time) => ({
      date,
      time,
      availableCount: 0,
      totalParticipants,
      intensity: 0,
      participants: [],
    }))
  )

  const cellMap = new Map(cells.map((cell) => [`${cell.date}-${cell.time}`, cell]))

  submissions.forEach((slot) => {
    const start = minutesFromTime(slot.startTime)
    const end = minutesFromTime(slot.endTime)

    times.forEach((time) => {
      const bucketMinutes = minutesFromTime(time)
      if (slot.date === undefined) return

      if (bucketMinutes >= start && bucketMinutes < end) {
        const target = cellMap.get(`${slot.date}-${time}`)
        if (target) {
          if (!target.participants.some((participant) => participant.id === slot.participantId)) {
            target.participants.push({
              id: slot.participantId,
              name: slot.participantName,
            })
            target.availableCount += 1
          }
        }
      }
    })
  })

  cells.forEach((cell) => {
    cell.participants.sort((a, b) => a.name.localeCompare(b.name))
    cell.intensity = totalParticipants > 0 ? cell.availableCount / totalParticipants : 0
  })

  const bestWindows = dates.flatMap((date) => {
    const dayCells = cells.filter((cell) => cell.date === date)
    const windows: BestWindow[] = []
    let activeWindow: BestWindow | null = null

    dayCells.forEach((cell, index) => {
      if (cell.availableCount === 0) {
        if (activeWindow) {
          windows.push(activeWindow)
          activeWindow = null
        }
        return
      }

      if (
        !activeWindow ||
        activeWindow.availableCount !== cell.availableCount ||
        minutesFromTime(cell.time) !== minutesFromTime(activeWindow.endTime)
      ) {
        if (activeWindow) {
          windows.push(activeWindow)
        }

        activeWindow = {
          date,
          startTime: cell.time,
          endTime: timeFromMinutes(minutesFromTime(cell.time) + TIME_BUCKET_MINUTES),
          availableCount: cell.availableCount,
          totalParticipants,
        }
      } else {
        activeWindow = {
          ...activeWindow,
          endTime: timeFromMinutes(minutesFromTime(cell.time) + TIME_BUCKET_MINUTES),
        }
      }

      if (index === dayCells.length - 1 && activeWindow) {
        windows.push(activeWindow)
      }
    })

    return windows
  })
    .sort((a, b) => {
      if (b.availableCount !== a.availableCount) {
        return b.availableCount - a.availableCount
      }

      if (a.date !== b.date) {
        return a.date.localeCompare(b.date)
      }

      return a.startTime.localeCompare(b.startTime)
    })
    .slice(0, 6)

  return { dates, times, cells, bestWindows }
}
