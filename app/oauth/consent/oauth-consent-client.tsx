"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DEFAULT_POST_AUTH_PATH, normalizeNextPath } from "@/lib/oauth"
import { supabase } from "@/lib/supabase"

const ERROR_COPY: Record<string, string> = {
  oauth_callback_failed: "Google sign-in could not be completed. Try again after checking your Supabase OAuth configuration.",
  access_denied: "Google sign-in was canceled or denied.",
}

export function OauthConsentClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoading, signInOauth } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExchangingCode, setIsExchangingCode] = useState(false)
  const [hasAttemptedExchange, setHasAttemptedExchange] = useState(false)

  const nextPath = useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : undefined)
    return normalizeNextPath(searchParams.get("next"), baseUrl)
  }, [searchParams])
  const code = searchParams.get("code")
  const callbackError = searchParams.get("error")
  const callbackErrorDescription = searchParams.get("error_description")
  const errorMessage =
    submitError ||
    callbackErrorDescription ||
    (callbackError ? ERROR_COPY[callbackError] ?? "Google sign-in failed." : null)

  useEffect(() => {
    if (!code || !supabase || isExchangingCode || hasAttemptedExchange) {
      return
    }

    const authClient = supabase
    let isActive = true

    const completeOauth = async () => {
      setIsExchangingCode(true)
      setHasAttemptedExchange(true)
      setSubmitError(null)

      const { error } = await authClient.auth.exchangeCodeForSession(code)

      if (!isActive) {
        return
      }

      if (error) {
        setSubmitError(error.message)
        setIsExchangingCode(false)
        return
      }

      router.replace(nextPath || DEFAULT_POST_AUTH_PATH)
    }

    completeOauth()

    return () => {
      isActive = false
    }
  }, [code, hasAttemptedExchange, isExchangingCode, nextPath, router])

  const handleContinue = async () => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      const { data, error } = await signInOauth(nextPath)

      if (error) {
        throw error
      }

      if (data?.url) {
        window.location.assign(data.url)
        return
      }

      setSubmitError("Google sign-in did not return an authorization URL.")
      setIsSubmitting(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred."
      setSubmitError(message)
      setIsSubmitting(false)
    }
  }

  if (isLoading || isExchangingCode) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-3">
          <CardTitle className="text-3xl">Connect Google Calendar</CardTitle>
          <CardDescription className="text-base leading-6">
            Nutty uses Google Calendar access to create confirmed meeting events for you. Google will also include your basic
            profile and email identity scopes as part of the OAuth session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
            <p>This flow requests:</p>
            <p className="mt-2 font-mono text-xs text-foreground">https://www.googleapis.com/auth/calendar.events</p>
            <p className="mt-3">
              Access is requested with offline refresh support and an explicit consent prompt so calendar event creation can work
              reliably when you confirm a group time later.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button variant="outline" asChild>
            <Link href={nextPath || DEFAULT_POST_AUTH_PATH}>Cancel</Link>
          </Button>
          <Button onClick={handleContinue} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to Google...
              </>
            ) : (
              "Continue with Google"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
