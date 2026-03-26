"use client"
import { Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TimeRangePickerProps {
  startTime: string
  endTime: string
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
  className?: string
}

export function TimeRangePicker({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  className,
}: TimeRangePickerProps) {
  return (
    <div className={cn("flex flex-col space-y-3", className)}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm">
          <Label htmlFor="start-time" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Start Time
          </Label>
          <Input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className="h-11 w-full rounded-xl border-border/70 bg-background"
          />
        </div>
        <div className="space-y-2 rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm">
          <Label htmlFor="end-time" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            End Time
          </Label>
          <Input
            id="end-time"
            type="time"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            className="h-11 w-full rounded-xl border-border/70 bg-background"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Times are stored as local scheduling windows and displayed using your selected timezone context.
      </p>
    </div>
  )
}
