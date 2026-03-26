"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Hand, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DateAvailability } from "@/types/availability"
import {
  buildTimeBuckets,
  cellKey,
  expandAvailabilityToCells,
  listDatesInRange,
  mergeCellsToAvailability,
  replaceAvailabilityWithinRange,
  timeToMinutes,
} from "@/lib/availability-grid"
import { formatDateLabel, formatDayLabel, formatTimeLabel } from "@/lib/date-time"

interface AvailabilityGridEditorProps {
  startDate: string
  endDate: string
  timezone: string
  availability: DateAvailability[]
  onChange: (nextAvailability: DateAvailability[]) => void
  visibleStartTime?: string
  visibleEndTime?: string
}

type DragMode = "fill" | "erase" | null

export function AvailabilityGridEditor({
  startDate,
  endDate,
  timezone,
  availability,
  onChange,
  visibleStartTime,
  visibleEndTime,
}: AvailabilityGridEditorProps) {
  const dates = useMemo(() => listDatesInRange(startDate, endDate), [endDate, startDate])
  const buckets = useMemo(() => {
    const startMinutes = visibleStartTime ? timeToMinutes(visibleStartTime) : 0
    const endMinutes = visibleEndTime ? timeToMinutes(visibleEndTime) : 24 * 60

    return buildTimeBuckets().filter((time) => {
      const minutes = timeToMinutes(time)
      return minutes >= startMinutes && minutes < endMinutes
    })
  }, [visibleEndTime, visibleStartTime])
  const visibleCells = useMemo(
    () => expandAvailabilityToCells(availability, startDate, endDate),
    [availability, endDate, startDate]
  )

  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState<DragMode>(null)
  const [lastCellKey, setLastCellKey] = useState<string | null>(null)
  const dragPointerRef = useRef<{ x: number; y: number } | null>(null)
  const dragScrollFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const stopDragging = () => {
      setIsDragging(false)
      setDragMode(null)
      setLastCellKey(null)
      dragPointerRef.current = null
      if (dragScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(dragScrollFrameRef.current)
        dragScrollFrameRef.current = null
      }
    }

    window.addEventListener("pointerup", stopDragging)
    return () => window.removeEventListener("pointerup", stopDragging)
  }, [])

  useEffect(() => {
    if (!isDragging || !dragMode) {
      return
    }

    const scrollThreshold = 88
    const scrollStep = 18

    const updateFromPoint = (clientX: number, clientY: number) => {
      const target = document.elementFromPoint(clientX, clientY)
      const cell = target instanceof HTMLElement ? target.closest<HTMLElement>("[data-grid-cell='true']") : null
      const date = cell?.dataset.date
      const time = cell?.dataset.time

      if (date && time) {
        paintCell(date, time, dragMode)
      }
    }

    const handlePointerMove = (event: PointerEvent) => {
      dragPointerRef.current = { x: event.clientX, y: event.clientY }
      updateFromPoint(event.clientX, event.clientY)
    }

    const tickAutoScroll = () => {
      if (!dragPointerRef.current) {
        dragScrollFrameRef.current = window.requestAnimationFrame(tickAutoScroll)
        return
      }

      const { x, y } = dragPointerRef.current
      let scrollDelta = 0

      if (y < scrollThreshold) {
        scrollDelta = -Math.ceil(((scrollThreshold - y) / scrollThreshold) * scrollStep)
      } else if (window.innerHeight - y < scrollThreshold) {
        scrollDelta = Math.ceil(((scrollThreshold - (window.innerHeight - y)) / scrollThreshold) * scrollStep)
      }

      if (scrollDelta !== 0) {
        window.scrollBy({ top: scrollDelta, behavior: "auto" })
        updateFromPoint(x, y)
      }

      dragScrollFrameRef.current = window.requestAnimationFrame(tickAutoScroll)
    }

    window.addEventListener("pointermove", handlePointerMove)
    dragScrollFrameRef.current = window.requestAnimationFrame(tickAutoScroll)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      if (dragScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(dragScrollFrameRef.current)
        dragScrollFrameRef.current = null
      }
    }
  }, [dragMode, isDragging, lastCellKey, visibleCells])

  const paintCell = (date: string, time: string, nextMode: Exclude<DragMode, null>) => {
    const currentKey = cellKey(date, time)
    if (lastCellKey === currentKey && isDragging) {
      return
    }

    const nextFilled = new Set(visibleCells)
    if (nextMode === "fill") {
      nextFilled.add(currentKey)
    } else {
      nextFilled.delete(currentKey)
    }

    const nextRangeEntries = mergeCellsToAvailability(nextFilled, startDate, endDate)
    onChange(replaceAvailabilityWithinRange(availability, startDate, endDate, nextRangeEntries))
    setLastCellKey(currentKey)
  }

  const startDrag = (date: string, time: string, clientX: number, clientY: number) => {
    const currentKey = cellKey(date, time)
    const mode: Exclude<DragMode, null> = visibleCells.has(currentKey) ? "erase" : "fill"
    dragPointerRef.current = { x: clientX, y: clientY }
    setIsDragging(true)
    setDragMode(mode)
    paintCell(date, time, mode)
  }

  const continueDrag = (date: string, time: string) => {
    if (!isDragging || !dragMode) {
      return
    }

    paintCell(date, time, dragMode)
  }

  const selectedCellCount = visibleCells.size

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Hand className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Drag To Paint
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Drag across the grid to mark when you are free. Start on a filled cell to erase.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-full border-border/70 bg-background/80 px-3 py-1">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            {selectedCellCount} half-hour slot{selectedCellCount === 1 ? "" : "s"}
          </Badge>
          <Badge variant="outline" className="rounded-full border-border/70 bg-background/80 px-3 py-1">
            {timezone}
          </Badge>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card/80">
        <div className="max-h-[32rem] overflow-y-auto">
          <div className="min-w-[960px]">
            <div
              className="sticky top-0 z-10 grid border-b border-border/70 bg-muted/90 backdrop-blur"
              style={{ gridTemplateColumns: `92px repeat(${dates.length}, minmax(120px, 1fr))` }}
            >
              <div className="p-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Time
              </div>
              {dates.map((date) => (
                <div key={date} className="border-l border-border/70 p-3">
                  <div className="text-sm font-medium">{formatDayLabel(date, timezone)}</div>
                  <div className="text-xs text-muted-foreground">{formatDateLabel(date, timezone)}</div>
                </div>
              ))}
            </div>

            {buckets.map((time) => (
              <div
                key={time}
                className="grid"
                style={{ gridTemplateColumns: `92px repeat(${dates.length}, minmax(120px, 1fr))` }}
              >
                <div className="border-b border-border/70 bg-background/95 p-2 text-xs text-muted-foreground">
                  {formatTimeLabel(time)}
                </div>
                {dates.map((date) => {
                  const filled = visibleCells.has(cellKey(date, time))

                  return (
                    <button
                      key={`${date}-${time}`}
                      type="button"
                      data-grid-cell="true"
                      data-date={date}
                      data-time={time}
                      className={cn(
                        "h-8 border-b border-l border-border/70 transition-colors",
                        filled
                          ? "bg-primary/80 hover:bg-primary text-primary-foreground"
                          : "bg-background hover:bg-muted/60"
                      )}
                      onPointerDown={(event) => startDrag(date, time, event.clientX, event.clientY)}
                      onPointerEnter={() => continueDrag(date, time)}
                      aria-label={`${filled ? "Filled" : "Empty"} slot for ${date} at ${time}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
