"use client"

import type * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"
import "react-day-picker/style.module.css"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = false, ...props }: CalendarProps) {
  return (
    <DayPicker

      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col gap-4 sm:flex-row sm:gap-6",
        month: "space-y-4",
        caption: "flex items-center justify-between",
        caption_label: "text-sm font-semibold",
        nav: "flex items-center gap-1",
        button_previous:
          "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-background text-foreground transition hover:bg-muted",
        button_next:
          "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-background text-foreground transition hover:bg-muted",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "w-9 text-xs font-medium text-muted-foreground",
        week: "mt-2 flex w-full",
        day: "h-9 w-9 p-0 text-sm",
        day_button:
          "h-9 w-9 rounded-md border border-transparent text-sm transition hover:border-border/70 hover:bg-accent hover:text-accent-foreground aria-selected:border-primary/30 aria-selected:bg-primary aria-selected:text-primary-foreground",
        range_start:
          "bg-primary text-primary-foreground rounded-md",
        range_middle:
          "bg-primary/15 text-foreground rounded-none",
        range_end:
          "bg-primary text-primary-foreground rounded-md",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "border border-primary/40 font-semibold text-foreground",
        outside: "text-muted-foreground opacity-40",
        disabled: "text-muted-foreground opacity-30",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
