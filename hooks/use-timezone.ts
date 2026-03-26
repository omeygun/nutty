"use client"

import { useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "nutty.timezone"

const FALLBACK_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "Europe/London",
  "Europe/Paris",
  "Asia/Bangkok",
  "Asia/Tokyo",
  "Australia/Sydney",
]

function detectBrowserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
}

function getSupportedTimezones() {
  if (typeof Intl.supportedValuesOf === "function") {
    return Intl.supportedValuesOf("timeZone")
  }

  return FALLBACK_TIMEZONES
}

function formatTimezoneLabel(timezone: string) {
  const parts = timezone.split("/")
  return parts[parts.length - 1].replace(/_/g, " ")
}

export function useTimezone() {
  const [timezone, setTimezone] = useState("UTC")
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    const storedTimezone = window.localStorage.getItem(STORAGE_KEY)
    const detectedTimezone = detectBrowserTimezone()
    const nextTimezone = storedTimezone || detectedTimezone

    setTimezone(nextTimezone)
    setHasLoaded(true)
  }, [])

  const setAndPersistTimezone = (nextTimezone: string) => {
    setTimezone(nextTimezone)
    window.localStorage.setItem(STORAGE_KEY, nextTimezone)
  }

  const timezoneOptions = useMemo(() => getSupportedTimezones(), [])
  const detectedTimezone = useMemo(() => detectBrowserTimezone(), [])

  return {
    timezone,
    detectedTimezone,
    hasLoaded,
    timezoneOptions,
    timezoneLabel: formatTimezoneLabel(timezone),
    setTimezone: setAndPersistTimezone,
  }
}
