"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { DateRange } from "react-day-picker"
import { Link2, Loader2, Sparkles } from "lucide-react"

import { DateRangePicker } from "@/components/availability/date-range-picker"
import { TimezoneSelect } from "@/components/availability/timezone-select"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTimezone } from "@/hooks/use-timezone"
import { useToast } from "@/hooks/use-toast"
import { createGroupEvent } from "@/lib/group-events"

export default function CreateGroupEventPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: isLoadingUser } = useAuth()
  const { timezone, detectedTimezone, timezoneOptions, setTimezone } = useTimezone()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.push("/login")
    }
  }, [isLoadingUser, router, user])

  const handleCreate = async () => {
    if (!dateRange?.from || !dateRange?.to || !title.trim()) {
      toast({
        title: "Missing event details",
        description: "Add a title and choose a start and end date before creating the link.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreating(true)
      const event = await createGroupEvent({
        title: title.trim(),
        description: description.trim(),
        startDate: dateRange.from.toISOString().slice(0, 10),
        endDate: dateRange.to.toISOString().slice(0, 10),
        timezone,
      })

      router.push(`/groups/manage/${event.slug}`)
    } catch (error) {
      console.error(error)
      toast({
        title: "Could not create group link",
        description:
          error instanceof Error
            ? error.message
            : "Please try again after checking your Supabase setup.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8 rounded-3xl border border-border/70 bg-gradient-to-br from-background via-background to-muted/40 p-6 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Group Scheduling
          </span>
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">Create a Group Availability Link</h1>
            <p className="mt-2 text-muted-foreground">
              Set a date range, choose the planning timezone, and generate a one-click link anyone can use to submit availability.
            </p>
          </div>
        </div>
      </div>

      <Card className="rounded-3xl border-border/70 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link2 className="mr-2 h-5 w-5" />
            Event Setup
          </CardTitle>
          <CardDescription>
            Anonymous participants will submit availability inside this event window.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group-title">Event title</Label>
                <Input
                  id="group-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Weekend brunch, team retro, housewarming..."
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-description">Description</Label>
                <Textarea
                  id="group-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Optional context, location notes, or scheduling constraints."
                  className="min-h-32 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                <h3 className="mb-3 text-sm font-medium">Date range</h3>
                <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                <TimezoneSelect
                  timezone={timezone}
                  detectedTimezone={detectedTimezone}
                  timezoneOptions={timezoneOptions}
                  onTimezoneChange={setTimezone}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button className="h-11 min-w-52 rounded-xl" onClick={handleCreate} disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Share Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
