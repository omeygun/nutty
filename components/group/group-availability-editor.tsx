"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { CalendarDays, Grid3X3, Loader2, Rows4, Save } from "lucide-react"

import { AvailabilityGridEditor } from "@/components/availability/availability-grid-editor"
import { ClassicAvailabilityEditor } from "@/components/availability/classic-availability-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DateAvailability } from "@/types/availability"

interface GroupAvailabilityEditorProps {
  startDate: string
  endDate: string
  timezone: string
  initialAvailability: DateAvailability[]
  isSaving: boolean
  onSave: (entries: DateAvailability[]) => Promise<void>
}

function toDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`)
}

export function GroupAvailabilityEditor({
  startDate,
  endDate,
  timezone,
  initialAvailability,
  isSaving,
  onSave,
}: GroupAvailabilityEditorProps) {
  const [availability, setAvailability] = useState<DateAvailability[]>(initialAvailability)

  const minDate = useMemo(() => toDate(startDate), [startDate])
  const maxDate = useMemo(() => toDate(endDate), [endDate])

  useEffect(() => {
    setAvailability(initialAvailability)
  }, [initialAvailability])

  return (
    <Card className="rounded-3xl border-border/70 bg-card/90 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarDays className="mr-2 h-5 w-5" />
          Share Your Availability
        </CardTitle>
        <CardDescription>
          Pick dates between {format(minDate, "MMM d")} and {format(maxDate, "MMM d")} in {timezone}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="grid" className="space-y-4">
          <TabsList className="h-11 rounded-xl bg-muted/50 p-1">
            <TabsTrigger value="grid" className="rounded-lg px-4">
              <Grid3X3 className="mr-2 h-4 w-4" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="classic" className="rounded-lg px-4">
              <Rows4 className="mr-2 h-4 w-4" />
              Classic
            </TabsTrigger>
          </TabsList>
          <TabsContent value="grid" className="mt-0">
            <AvailabilityGridEditor
              startDate={startDate}
              endDate={endDate}
              timezone={timezone}
              availability={availability}
              onChange={setAvailability}
            />
          </TabsContent>
          <TabsContent value="classic" className="mt-0">
            <ClassicAvailabilityEditor
              availability={availability}
              timezone={timezone}
              onChange={setAvailability}
              minDate={minDate}
              maxDate={maxDate}
            />
          </TabsContent>
        </Tabs>

        <Button className="h-11 w-full rounded-xl" disabled={isSaving} onClick={() => onSave(availability)}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save My Availability"}
        </Button>
      </CardContent>
    </Card>
  )
}
