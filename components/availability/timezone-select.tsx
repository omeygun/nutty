"use client"

import { Globe } from "lucide-react"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface TimezoneSelectProps {
  timezone: string
  detectedTimezone: string
  timezoneOptions: string[]
  onTimezoneChange: (timezone: string) => void
  className?: string
}

export function TimezoneSelect({
  timezone,
  detectedTimezone,
  timezoneOptions,
  onTimezoneChange,
  className,
}: TimezoneSelectProps) {
  const curatedTimezones = Array.from(new Set([detectedTimezone, "UTC", ...timezoneOptions])).slice(0, 200)

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="timezone" className="flex items-center gap-2">
        <Globe className="h-4 w-4" />
        Timezone
      </Label>
      <Select value={timezone} onValueChange={onTimezoneChange}>
        <SelectTrigger
          id="timezone"
          className="h-11 rounded-xl border-border/70 bg-background/70 shadow-sm"
        >
          <SelectValue placeholder="Select a timezone" />
        </SelectTrigger>
        <SelectContent>
          {curatedTimezones.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Detected automatically from your browser. You can override it here for display.
      </p>
    </div>
  )
}
