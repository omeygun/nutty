"use client"

import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Clock } from "lucide-react"
import type { DateAvailability } from "@/types/availability"

interface DateAvailabilityListProps {
  availabilityList: DateAvailability[]
  onRemoveDate: (date: string) => void
}

export function DateAvailabilityList({ availabilityList, onRemoveDate }: DateAvailabilityListProps) {
  if (availabilityList.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No dates selected yet. Use the calendar to select your available dates.
      </div>
    )
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  return (
    <div className="space-y-3">
      {availabilityList
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((item) => (
          <Card key={item.date} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">
                      {format(new Date(item.date), "EEE")}
                    </Badge>
                    <span className="font-medium">{format(new Date(item.date), "MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveDate(item.date)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
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

