import { NextResponse } from "next/server"

import { buildConsentPath, normalizeNextPath } from "@/lib/oauth"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const next = normalizeNextPath(searchParams.get("next"), origin)
  const destination = new URL(buildConsentPath(next), origin)

  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  if (code) {
    destination.searchParams.set("code", code)
  }

  if (error) {
    destination.searchParams.set("error", error)
  }

  if (errorDescription) {
    destination.searchParams.set("error_description", errorDescription)
  }

  const forwardedHost = request.headers.get("x-forwarded-host")
  const isLocalEnv = process.env.NODE_ENV === "development"

  if (isLocalEnv) {
    return NextResponse.redirect(destination)
  }

  if (forwardedHost) {
    destination.protocol = "https:"
    destination.host = forwardedHost
  }

  return NextResponse.redirect(destination)
}
