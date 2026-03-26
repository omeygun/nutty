"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import type { DateRange } from "react-day-picker"
import { addDays } from "date-fns"
import type { DateAvailability } from "@/types/availability"
import { AvailabilityGridEditor } from "@/components/availability/availability-grid-editor"
import { ClassicAvailabilityEditor } from "@/components/availability/classic-availability-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/availability/date-range-picker"
import { DateAvailabilityList } from "@/components/availability/date-availability-list"
import { TimezoneSelect } from "@/components/availability/timezone-select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserDateAvailability, saveDateAvailability } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useTimezone } from "@/hooks/use-timezone"
import { Loader2, CalendarDays, Clock, Save, LucideX, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AvailabilityPage() {
  const { user, isLoading: isLoadingUser } = useAuth()
  const { toast } = useToast()
  const { timezone, detectedTimezone, hasLoaded, timezoneOptions, setTimezone } = useTimezone()
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [dateAvailability, setDateAvailability] = useState<DateAvailability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.push("/login")
    }
  }, [user, isLoadingUser, router])

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

        if (!dateRange) {
          if (slots.length > 0) {
            const sortedDates = slots.map((slot) => slot.date).sort()
            setDateRange({
              from: new Date(`${sortedDates[0]}T12:00:00`),
              to: new Date(`${sortedDates[sortedDates.length - 1]}T12:00:00`),
            })
          } else {
            const start = new Date()
            const end = addDays(start, 6)
            setDateRange({ from: start, to: end })
          }
        }
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

  const handleClearDate = () => {
    setDateAvailability([]);
    toast({
      title: "Date Cleared",
      description: `Removed All Dates`,
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
      <div className="mb-8 rounded-3xl border border-border/70 bg-gradient-to-br from-background via-background to-muted/50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Scheduling Workspace
            </span>
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">Manage Your Availability</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Build your schedule once, keep it readable in light and dark mode, and review it in the timezone that matches how you plan your week.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Current timezone</p>
              <p className="mt-2 text-sm font-medium">{hasLoaded ? timezone : "Loading..."}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Detected from browser</p>
              <p className="mt-2 text-sm font-medium">{hasLoaded ? detectedTimezone : "Loading..."}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Saved date windows</p>
              <p className="mt-2 text-sm font-medium">{dateAvailability.length}</p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <Card className="rounded-3xl border-border/70 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDays className="mr-2 h-5 w-5" />
                Build Availability
              </CardTitle>
              <CardDescription>
                Choose a date range, assign a time window, and review everything in your preferred timezone context.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]">
                <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
                  <h3 className="text-sm font-medium">Visible Date Range</h3>
                  <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
                </div>

                <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/30 p-4">
                  <h3 className="text-sm font-medium">Timezone</h3>
                  <TimezoneSelect
                    timezone={timezone}
                    detectedTimezone={detectedTimezone}
                    timezoneOptions={timezoneOptions}
                    onTimezoneChange={setTimezone}
                  />
                </div>
              </div>

              {dateRange?.from && dateRange?.to ? (
                <Tabs defaultValue="grid" className="space-y-4">
                  <TabsList className="h-11 rounded-xl bg-muted/50 p-1">
                    <TabsTrigger value="grid" className="rounded-lg px-4">
                      Grid
                    </TabsTrigger>
                    <TabsTrigger value="classic" className="rounded-lg px-4">
                      Classic
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="grid" className="mt-0">
                    <AvailabilityGridEditor
                      startDate={dateRange.from.toISOString().slice(0, 10)}
                      endDate={dateRange.to.toISOString().slice(0, 10)}
                      timezone={timezone}
                      availability={dateAvailability}
                      onChange={setDateAvailability}
                    />
                  </TabsContent>
                  <TabsContent value="classic" className="mt-0">
                    <ClassicAvailabilityEditor
                      availability={dateAvailability}
                      timezone={timezone}
                      onChange={setDateAvailability}
                    />
                  </TabsContent>
                </Tabs>
              ) : null}

              <div className="flex justify-end">
                <Button
                  onClick={handleClearDate}
                  disabled={isSaving || dateAvailability.length === 0}
                  variant="outline"
                  className="h-11 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <LucideX className="mr-2 h-4 w-4" />
                  Clear Selection
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/70 bg-card/90 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                  Your Available Dates
                </CardTitle>
                <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs text-muted-foreground">
                  {timezone}
                </span>
              </div>
              <CardDescription>
                {dateAvailability.length === 0
                  ? "No dates added yet"
                  : `${dateAvailability.length} date window${dateAvailability.length === 1 ? "" : "s"} ready to save`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                Times are shown with your selected timezone label for planning consistency. Your saved availability remains date-based and can be updated at any time.
              </div>
              <div className="max-h-[420px] overflow-y-auto pr-1">
                <DateAvailabilityList
                  availabilityList={dateAvailability}
                  onRemoveEntry={(entry) =>
                    setDateAvailability((current) =>
                      current.filter(
                        (item) =>
                          !(
                            item.date === entry.date &&
                            item.startTime === entry.startTime &&
                            item.endTime === entry.endTime
                          )
                      )
                    )
                  }
                  timezone={timezone}
                />
              </div>
            </CardContent>
          </Card>

          <div className="xl:col-span-2 flex justify-end">
            <Button
              onClick={handleSaveAvailability}
              disabled={isSaving || !hasLoaded}
              className="h-11 min-w-48 rounded-xl"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Availability"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
