"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, X, Clock } from "lucide-react"
import type { DateAvailability } from "@/types/availability"
import { formatDateLabel, formatDayLabel, formatTimeLabel } from "@/lib/date-time"

interface DateAvailabilityListProps {
  availabilityList: DateAvailability[]
  onRemoveEntry: (entry: DateAvailability) => void
  timezone: string
}

export function DateAvailabilityList({ availabilityList, onRemoveEntry, timezone }: DateAvailabilityListProps) {
  if (availabilityList.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 p-8 text-center text-muted-foreground">
        <Calendar className="mx-auto mb-3 h-8 w-8 opacity-70" />
        No dates selected yet. Use the calendar to build your availability plan.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {availabilityList
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((item) => (
          <Card
            key={`${item.date}-${item.startTime}-${item.endTime}`}
            className="overflow-hidden rounded-2xl border-border/70 bg-card/80 shadow-sm"
          >
            <CardContent className="p-0">
              <div className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="rounded-full border-border/70 bg-background/80">
                      {formatDayLabel(item.date, timezone)}
                    </Badge>
                    <span className="font-medium">{formatDateLabel(item.date, timezone)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatTimeLabel(item.startTime)} - {formatTimeLabel(item.endTime)}
                    </span>
                    <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground/80">
                      {timezone}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveEntry(item)}
                  className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
