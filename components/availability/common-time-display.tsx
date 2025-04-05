"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { findCommonFreeTime } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { Calendar, Clock } from "lucide-react"

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

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

function parseAndFormatDate(input: string) {
  const [year, month, day] = input.split("-").map(Number)
  const date = new Date(year, month - 1, day) // Month is 0-based
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function CommonTimeDisplay({ selectedFriends }: CommonTimeDisplayProps) {
  const { user } = useAuth()
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

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

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
    <Card>
      <CardHeader>
        <CardTitle>Common Free Time</CardTitle>
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
                    {/* {DAYS_OF_WEEK[Number.parseInt(day)]}  */}
                    {parseAndFormatDate(day)}
                  </h3>
                  <div className="space-y-2">
                    {slots
                      // .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((slot, index) => (
                        <div key={index} className="flex items-center p-3 bg-muted rounded-md">
                          <Clock className="mr-2 h-4 w-4 text-primary" />
                          <span>
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
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

