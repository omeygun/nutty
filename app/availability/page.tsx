"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import type { DateRange } from "react-day-picker"
import { format, eachDayOfInterval } from "date-fns"
import type { DateAvailability, DayOfWeek } from "@/types/availability"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/availability/date-range-picker"
import { TimeRangePicker } from "@/components/availability/time-range-picker"
import { DateAvailabilityList } from "@/components/availability/date-availability-list"
import { getUserDateAvailability, saveDateAvailability } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CalendarDays, Clock, Save, LucideX } from "lucide-react"

export default function AvailabilityPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")
  const [dateAvailability, setDateAvailability] = useState<DateAvailability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadAvailability = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const availability = await getUserDateAvailability(user.id)

        // Convert from database format to our DateAvailability format
        const slots: DateAvailability[] = availability.map((slot) => ({
          id: slot.id,
          date: slot.date,
          dayOfWeek: slot.day_of_week,
          startTime: slot.start_time,
          endTime: slot.end_time,
        }))

        setDateAvailability(slots)
      } catch (error) {
        console.error("Error loading availability:", error)
        toast({
          title: "Error",
          description: "Failed to load your availability. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadAvailability()
  }, [user, toast])

  const handleAddDateRange = () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Missing date range",
        description: "Please select a start and end date.",
        variant: "destructive",
      })
      return
    }

    if (startTime >= endTime) {
      toast({
        title: "Invalid time range",
        description: "Start time must be before end time.",
        variant: "destructive",
      })
      return
    }

    // Generate an array of dates between the start and end date
    const dates = eachDayOfInterval({
      start: dateRange.from,
      end: dateRange.to,
    })

    // Create availability entries for each date
    const newAvailability = dates.map((date) => ({
      date: format(date, "yyyy-MM-dd"),
      dayOfWeek: date.getDay() as DayOfWeek,
      startTime,
      endTime,
    }))

    // Filter out any dates that already exist
    const existingDates = new Set(dateAvailability.map((item) => item.date))
    const filteredNewAvailability = newAvailability.filter((item) => !existingDates.has(item.date))

    if (filteredNewAvailability.length === 0) {
      toast({
        title: "Dates already added",
        description: "All selected dates have already been added.",
        variant: "default",
      })
      return
    }

    // Add the new availability to the existing list
    setDateAvailability([...dateAvailability, ...filteredNewAvailability])

    // Clear the date range
    setDateRange(undefined)

    toast({
      title: "Dates added",
      description: `Added ${filteredNewAvailability.length} new date(s) to your availability.`,
    })
  }

  const handleClearDate = () => {
    setDateAvailability([]);
    toast({
      title: "Date Cleared",
      description: `Removed All Dates`,
    })
  }


  const handleRemoveDate = (date: string) => {
    setDateAvailability(dateAvailability.filter((item) => item.date !== date))
    toast({
      title: "Date removed",
      description: `Removed ${format(new Date(date), "MMMM d, yyyy")} from your availability.`,
    })
  }

  const handleSaveAvailability = async () => {
    if (!user) return

    try {
      setIsSaving(true)
      await saveDateAvailability(user.id, dateAvailability)
      toast({
        title: "Success",
        description: "Your availability has been saved.",
      })
    } catch (error) {
      console.error("Error saving availability:", error)
      toast({
        title: "Error",
        description: "Failed to save your availability. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Your Availability</h1>
      <p className="text-muted-foreground mb-8">
        Add your available dates and times to help find common meeting times with friends.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDays className="mr-2 h-5 w-5" />
                Add Available Dates
              </CardTitle>
              <CardDescription>Select a date range and time to add to your availability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Select Date Range</h3>
                  <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Select Time Range</h3>
                  <TimeRangePicker
                    startTime={startTime}
                    endTime={endTime}
                    onStartTimeChange={setStartTime}
                    onEndTimeChange={setEndTime}
                  />
                </div>
              </div>

              <Button onClick={handleAddDateRange} className="w-full" disabled={!dateRange?.from || !dateRange?.to}>
                Add Date Range
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Your Available Dates
              </CardTitle>
              <CardDescription>
                {dateAvailability.length === 0 ? "No dates added yet" : `${dateAvailability.length} date(s) added`}
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <DateAvailabilityList availabilityList={dateAvailability} onRemoveDate={handleRemoveDate} />
            </CardContent>
          </Card>

          <div className="lg:col-span-2 flex gap-2 justify-end">
            <Button
              onClick={handleClearDate}
              disabled={isSaving || dateAvailability.length === 0}
              className="flex items-center"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <LucideX className="mr-2 h-4 w-4" />
              Clear Selection
            </Button>

            <Button
              onClick={handleSaveAvailability}
              disabled={isSaving}
              className="flex items-center"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Availability
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

