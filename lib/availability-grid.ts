import { addDays } from "date-fns"

import type { DateAvailability } from "@/types/availability"

const MINUTES_PER_DAY = 24 * 60
export const GRID_STEP_MINUTES = 30

function parseDate(date: string) {
  return new Date(`${date}T12:00:00`)
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function listDatesInRange(startDate: string, endDate: string) {
  const start = parseDate(startDate)
  const end = parseDate(endDate)
  const dates: string[] = []

  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    dates.push(formatDate(cursor))
  }

  return dates
}

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

export function minutesToTime(totalMinutes: number) {
  const normalized = Math.max(0, Math.min(totalMinutes, MINUTES_PER_DAY))
  const hours = Math.floor(normalized / 60)
  const minutes = normalized % 60

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

export function buildTimeBuckets(stepMinutes = GRID_STEP_MINUTES) {
  return Array.from({ length: MINUTES_PER_DAY / stepMinutes }, (_, index) =>
    minutesToTime(index * stepMinutes)
  )
}

export function cellKey(date: string, time: string) {
  return `${date}|${time}`
}

export function expandAvailabilityToCells(
  entries: DateAvailability[],
  startDate: string,
  endDate: string,
  stepMinutes = GRID_STEP_MINUTES
) {
  const visibleDates = new Set(listDatesInRange(startDate, endDate))
  const filled = new Set<string>()

  entries.forEach((entry) => {
    if (!visibleDates.has(entry.date)) {
      return
    }

    const start = timeToMinutes(entry.startTime)
    const end = timeToMinutes(entry.endTime)

    for (let minutes = start; minutes < end; minutes += stepMinutes) {
      filled.add(cellKey(entry.date, minutesToTime(minutes)))
    }
  })

  return filled
}

export function mergeCellsToAvailability(
  filled: Set<string>,
  startDate: string,
  endDate: string,
  stepMinutes = GRID_STEP_MINUTES
) {
  const dates = listDatesInRange(startDate, endDate)
  const buckets = buildTimeBuckets(stepMinutes)
  const merged: DateAvailability[] = []

  dates.forEach((date) => {
    let activeStart: string | null = null

    buckets.forEach((time, index) => {
      const filledNow = filled.has(cellKey(date, time))

      if (filledNow && !activeStart) {
        activeStart = time
      }

      const nextTime = minutesToTime(timeToMinutes(time) + stepMinutes)
      const nextFilled =
        index < buckets.length - 1 ? filled.has(cellKey(date, buckets[index + 1])) : false

      if (activeStart && (!filledNow || !nextFilled)) {
        const rangeEnd = filledNow ? nextTime : time
        merged.push({
          date,
          dayOfWeek: parseDate(date).getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6,
          startTime: activeStart,
          endTime: rangeEnd,
        })
        activeStart = null
      }
    })
  })

  return merged
}

export function replaceAvailabilityWithinRange(
  allEntries: DateAvailability[],
  startDate: string,
  endDate: string,
  nextRangeEntries: DateAvailability[]
) {
  const start = parseDate(startDate).getTime()
  const end = parseDate(endDate).getTime()

  const outsideRange = allEntries.filter((entry) => {
    const current = parseDate(entry.date).getTime()
    return current < start || current > end
  })

  return [...outsideRange, ...nextRangeEntries].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date)
    }

    return a.startTime.localeCompare(b.startTime)
  })
}
