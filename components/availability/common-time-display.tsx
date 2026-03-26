"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { findCommonFreeTime } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { Calendar, Clock, Globe } from "lucide-react"
import { formatDateLabel, formatTimeLabel } from "@/lib/date-time"
import { useTimezone } from "@/hooks/use-timezone"

interface CommonTimeSlot {
  date: string
  dayOfWeek: number
  startTime: string
  endTime: string
  users: string[]
}

interface CommonTimeDisplayProps {
  selectedFriends: string[]
}

export function CommonTimeDisplay({ selectedFriends }: CommonTimeDisplayProps) {
  const { user } = useAuth()
  const { timezone } = useTimezone()
  const [commonTimeSlots, setCommonTimeSlots] = useState<CommonTimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const findCommonTime = async () => {
      if (!user || selectedFriends.length === 0) {
        setCommonTimeSlots([])
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        // Include the current user in the search
        const userIds = [user.id, ...selectedFriends]
        const slots = await findCommonFreeTime(userIds)
        // console.log(slots)
        setCommonTimeSlots(slots || [])
      } catch (err) {
        console.error("Error finding common time:", err)
        setError("Failed to find common time. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    findCommonTime()

  }, [user, selectedFriends])
  // Group time slots by day
  const slotsByDay = commonTimeSlots.reduce(
    (acc, slot) => {

      if (!acc[slot.date]) {
        acc[slot.date] = []
      }
      acc[slot.date].push(slot)
      return acc
    },
    {} as Record<string, CommonTimeSlot[]>,
  )
  // console.log(slotsByDay)

  return (
    <Card className="rounded-3xl border-border/70 bg-card/90 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Common Free Time</CardTitle>
          <span className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs text-muted-foreground">
            <Globe className="mr-2 h-3.5 w-3.5" />
            {timezone}
          </span>
        </div>
        <CardDescription>
          {selectedFriends.length === 0
            ? "Select friends to find common free time"
            : `Showing common free time for you and ${selectedFriends.length} friend${selectedFriends.length === 1 ? "" : "s"}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <p>Finding common time...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            <p>{error}</p>
          </div>
        ) : selectedFriends.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Select friends to see common free time</p>
          </div>
        ) : commonTimeSlots.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              No common free time found. Try selecting different friends or updating your availability.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(slotsByDay)
              .sort(([A, slotA], [B, slotB]) => {
                const dateA = new Date(A) // Assuming you have `date` field
                const dateB = new Date(B)

                if (dateA.getTime() !== dateB.getTime()) {
                  return dateA.getTime() - dateB.getTime() // Sort by full date first
                }

                return slotA[0].startTime.localeCompare(slotB[0].startTime) // Then by time
              })
              .map(([day, slots]) => (
                <div key={day} className="space-y-2">
                  <h3 className="flex items-center text-lg font-medium">
                    <Calendar className="mr-2 h-5 w-5" />
                    {formatDateLabel(day, timezone)}
                  </h3>
                  <div className="space-y-2">
                    {slots
                      .map((slot, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/50 p-3"
                        >
                          <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-primary" />
                          <span>
                            {formatTimeLabel(slot.startTime)} - {formatTimeLabel(slot.endTime)}
                          </span>
                          </div>
                          <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            {timezone}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
