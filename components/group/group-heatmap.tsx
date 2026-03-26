"use client"

import { useMemo, useState } from "react"
import { CalendarRange, CheckCircle2, Flame, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatDateLabel, formatTimeLabel } from "@/lib/date-time"
import { BestWindow, buildGroupHeatmap, GroupSubmission, HeatmapCell } from "@/lib/group-events"

interface GroupHeatmapProps {
  title: string
  description?: string
  submissions: GroupSubmission[]
  startDate: string
  endDate: string
  timezone: string
  totalParticipants: number
  showParticipantDetails?: boolean
}

function bestWindowLabel(window: BestWindow) {
  return `${formatTimeLabel(window.startTime)} - ${formatTimeLabel(window.endTime)}`
}

export function GroupHeatmap({
  title,
  description,
  submissions,
  startDate,
  endDate,
  timezone,
  totalParticipants,
  showParticipantDetails = false,
}: GroupHeatmapProps) {
  const { dates, times, cells, bestWindows } = buildGroupHeatmap(
    startDate,
    endDate,
    submissions,
    totalParticipants
  )

  const cellMap = new Map(cells.map((cell) => [`${cell.date}-${cell.time}`, cell]))
  const [selectedCellKey, setSelectedCellKey] = useState<string | null>(null)
  const selectedCell = useMemo(
    () => (selectedCellKey ? cellMap.get(selectedCellKey) ?? null : null),
    [cellMap, selectedCellKey]
  )

  const handleCellSelect = (cell: HeatmapCell | undefined) => {
    if (!showParticipantDetails || !cell) {
      return
    }

    setSelectedCellKey(`${cell.date}-${cell.time}`)
  }

  return (
    <Card className="rounded-3xl border-border/70 bg-card/90 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {description ?? "Darker cells indicate higher overlap across the group."}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full border-border/70 bg-background/80 px-3 py-1">
              <Users className="mr-2 h-3.5 w-3.5" />
              {totalParticipants} participant{totalParticipants === 1 ? "" : "s"}
            </Badge>
            <Badge variant="outline" className="rounded-full border-border/70 bg-background/80 px-3 py-1">
              <CalendarRange className="mr-2 h-3.5 w-3.5" />
              {timezone}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {totalParticipants === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 p-8 text-center text-muted-foreground">
            No submissions yet. Share the link and wait for participants to add their availability.
          </div>
        ) : (
          <>
            <div className={cn("space-y-6", showParticipantDetails && "xl:grid xl:grid-cols-[minmax(0,1.35fr)_360px] xl:items-start xl:gap-6 xl:space-y-0")}>
              <div className="overflow-auto rounded-2xl border border-border/70 xl:max-h-[70vh]">
                <div className="min-w-[720px]">
                  <div
                    className="sticky top-0 z-10 grid border-b border-border/70 bg-muted/95 backdrop-blur"
                    style={{ gridTemplateColumns: `120px repeat(${dates.length}, minmax(120px, 1fr))` }}
                  >
                    <div className="p-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Time
                    </div>
                    {dates.map((date) => (
                      <div key={date} className="border-l border-border/70 p-3 text-sm font-medium">
                        {formatDateLabel(date, timezone)}
                      </div>
                    ))}
                  </div>

                  {times.map((time) => (
                    <div
                      key={time}
                      className="grid"
                      style={{ gridTemplateColumns: `120px repeat(${dates.length}, minmax(120px, 1fr))` }}
                    >
                      <div className="border-b border-border/70 bg-background/90 p-3 text-sm text-muted-foreground">
                        {formatTimeLabel(time)}
                      </div>
                      {dates.map((date) => {
                        const cell = cellMap.get(`${date}-${time}`)
                        const opacity = cell ? 0.08 + cell.intensity * 0.75 : 0.08
                        const isSelected = selectedCellKey === `${date}-${time}`

                        return (
                          <button
                            type="button"
                            key={`${date}-${time}`}
                            className={cn(
                              "border-b border-l border-border/70 p-3 text-left text-sm transition-colors",
                              showParticipantDetails && "cursor-pointer hover:ring-2 hover:ring-primary/30 hover:ring-inset",
                              isSelected && "ring-2 ring-primary/40 ring-inset"
                            )}
                            style={{ backgroundColor: `hsl(var(--primary) / ${opacity})` }}
                            onClick={() => handleCellSelect(cell)}
                            disabled={!showParticipantDetails}
                          >
                            <div className="font-medium">
                              {cell?.availableCount ?? 0}/{totalParticipants}
                            </div>
                            <div className="text-xs text-muted-foreground">free</div>
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {showParticipantDetails ? (
                <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 xl:sticky xl:top-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Slot Details
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tap a cell to see exactly who is free in that 30-minute slot.
                    </p>
                  </div>
                  {selectedCell ? (
                    <Badge variant="outline" className="rounded-full border-border/70 bg-background/80 px-3 py-1">
                      {selectedCell.availableCount}/{selectedCell.totalParticipants} free
                    </Badge>
                  ) : null}
                </div>

                {!selectedCell ? (
                  <div className="rounded-2xl border border-dashed border-border/80 bg-background/70 p-4 text-sm text-muted-foreground">
                    No slot selected yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                      <div className="font-medium">{formatDateLabel(selectedCell.date, timezone)}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{formatTimeLabel(selectedCell.time)}</div>
                    </div>

                    {selectedCell.participants.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border/80 bg-background/70 p-4 text-sm text-muted-foreground">
                        No one is free in this slot.
                      </div>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-2">
                        {selectedCell.participants.map((participant) => (
                          <div
                            key={participant.id}
                            className="flex items-center rounded-2xl border border-border/70 bg-background/80 p-4"
                          >
                            <CheckCircle2 className="mr-3 h-4 w-4 text-primary" />
                            <span className="font-medium">{participant.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Best Windows
                </h3>
              </div>
              {bestWindows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 p-4 text-sm text-muted-foreground">
                  No overlapping windows yet.
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {bestWindows.map((window) => (
                    <div
                      key={`${window.date}-${window.startTime}-${window.endTime}`}
                      className="rounded-2xl border border-border/70 bg-muted/30 p-4"
                    >
                      <div className="font-medium">{formatDateLabel(window.date, timezone)}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{bestWindowLabel(window)}</div>
                      <div className="mt-3 inline-flex rounded-full bg-background px-3 py-1 text-xs text-muted-foreground">
                        {window.availableCount}/{window.totalParticipants} participants free
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
