"use client"

import { useState } from "react"
import type { TimeSlot, DayOfWeek } from "@/types/availability"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { X, Plus } from "lucide-react"

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
]

interface TimeSlotPickerProps {
  value: TimeSlot[]
  onChange: (value: TimeSlot[]) => void
}

export function TimeSlotPicker({ value, onChange }: TimeSlotPickerProps) {
  const [newSlot, setNewSlot] = useState<Partial<TimeSlot>>({
    dayOfWeek: 1, // Default to Monday
    startTime: "09:00",
    endTime: "17:00",
  })

  const handleAddSlot = () => {
    if (!newSlot.dayOfWeek || !newSlot.startTime || !newSlot.endTime) {
      return
    }

    // Validate time range
    if (newSlot.startTime >= newSlot.endTime) {
      alert("Start time must be before end time")
      return
    }

    const slot: TimeSlot = {
      dayOfWeek: newSlot.dayOfWeek as DayOfWeek,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
    }

    onChange([...value, slot])
  }

  const handleRemoveSlot = (index: number) => {
    const newValue = [...value]
    newValue.splice(index, 1)
    onChange(newValue)
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Availability</CardTitle>
        <CardDescription>Add your free time slots for each day of the week</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="day">Day</Label>
            <Select
              value={newSlot.dayOfWeek?.toString()}
              onValueChange={(value) => setNewSlot({ ...newSlot, dayOfWeek: Number.parseInt(value) as DayOfWeek })}
            >
              <SelectTrigger id="day">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="start-time">Start Time</Label>
            <Input
              id="start-time"
              type="time"
              value={newSlot.startTime}
              onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="end-time">End Time</Label>
            <Input
              id="end-time"
              type="time"
              value={newSlot.endTime}
              onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
            />
          </div>
        </div>
        <Button onClick={handleAddSlot} className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Add Time Slot
        </Button>

        {value.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Your Time Slots</h3>
            <div className="space-y-2">
              {value
                .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
                .map((slot, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div>
                      <span className="font-medium">
                        {DAYS_OF_WEEK.find((d) => d.value === slot.dayOfWeek)?.label}:{" "}
                      </span>
                      <span>
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveSlot(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Add all your regular free time slots. You can always update these later.
        </p>
      </CardFooter>
    </Card>
  )
}

