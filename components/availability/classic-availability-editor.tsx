"use client"

import { useState } from "react"
import type { DateRange } from "react-day-picker"

import { DateRangePicker } from "@/components/availability/date-range-picker"
import { DateAvailabilityList } from "@/components/availability/date-availability-list"
import { TimeRangePicker } from "@/components/availability/time-range-picker"
import { Button } from "@/components/ui/button"
import type { DateAvailability, DayOfWeek } from "@/types/availability"
import { eachDayOfInterval, format } from "date-fns"

interface ClassicAvailabilityEditorProps {
  availability: DateAvailability[]
  timezone: string
  onChange: (nextAvailability: DateAvailability[]) => void
  minDate?: Date
  maxDate?: Date
  addButtonLabel?: string
}

export function ClassicAvailabilityEditor({
  availability,
  timezone,
  onChange,
  minDate,
  maxDate,
  addButtonLabel = "Add Availability Window",
}: ClassicAvailabilityEditorProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")

  const addDateRange = () => {
    if (!dateRange?.from || !dateRange?.to || startTime >= endTime) {
      return
    }

    const dates = eachDayOfInterval({
      start: dateRange.from,
      end: dateRange.to,
    })

    const nextEntries = dates.map((date) => ({
      date: format(date, "yyyy-MM-dd"),
      dayOfWeek: date.getDay() as DayOfWeek,
      startTime,
      endTime,
    }))

    const dedupe = new Set(
      availability.map((entry) => `${entry.date}|${entry.startTime}|${entry.endTime}`)
    )

    onChange([
      ...availability,
      ...nextEntries.filter((entry) => !dedupe.has(`${entry.date}|${entry.startTime}|${entry.endTime}`)),
    ])
    setDateRange(undefined)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.9fr)]">
        <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
          <h3 className="text-sm font-medium">Choose dates</h3>
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            fromDate={minDate}
            toDate={maxDate}
          />
        </div>
        <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
          <h3 className="text-sm font-medium">Choose a time window</h3>
          <TimeRangePicker
            startTime={startTime}
            endTime={endTime}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="h-11 flex-1 rounded-xl" onClick={addDateRange} disabled={!dateRange?.from || !dateRange?.to}>
          {addButtonLabel}
        </Button>
        <Button
          variant="outline"
          className="h-11 rounded-xl"
          onClick={() => onChange([])}
          disabled={availability.length === 0}
        >
          Clear All
        </Button>
      </div>

      <DateAvailabilityList
        availabilityList={availability}
        onRemoveEntry={(entry) =>
          onChange(
            availability.filter(
              (current) =>
                !(
                  current.date === entry.date &&
                  current.startTime === entry.startTime &&
                  current.endTime === entry.endTime
                )
            )
          )
        }
        timezone={timezone}
      />
    </div>
  )
}
