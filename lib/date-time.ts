function safeDateFromParts(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number)
  return new Date(year, month - 1, day, 12, 0, 0)
}

export function formatDateLabel(dateString: string, timezone?: string) {
  return safeDateFromParts(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    ...(timezone ? { timeZone: timezone } : {}),
  })
}

export function formatDayLabel(dateString: string, timezone?: string) {
  return safeDateFromParts(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    ...(timezone ? { timeZone: timezone } : {}),
  })
}

export function formatTimeLabel(time: string) {
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours, 10)
  const suffix = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12

  return `${hour12}:${minutes} ${suffix}`
}
