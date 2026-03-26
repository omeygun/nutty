"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, Check, Clock3, Sparkles, Users2 } from "lucide-react"
import { Space_Grotesk } from "next/font/google"

import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

const guestPillars = [
  {
    title: "Shared availability",
    description: "Bring everyone's schedule into one calm view instead of chasing messages.",
    icon: Users2,
  },
  {
    title: "Fast decisions",
    description: "Surface the best overlap quickly, then move from maybe to confirmed.",
    icon: Clock3,
  },
  {
    title: "Minimal friction",
    description: "Clean flows for solo planning, group coordination, and repeat meetups.",
    icon: Sparkles,
  },
]

const memberPillars = [
  {
    title: "Dashboard first",
    description: "Jump straight into the workspace where your scheduling decisions actually happen.",
    icon: Sparkles,
  },
  {
    title: "Availability in motion",
    description: "Update time windows, compare overlap, and keep plans moving without extra admin.",
    icon: Clock3,
  },
  {
    title: "Built for your people",
    description: "Manage friends, group sessions, and recurring plans from one place.",
    icon: Users2,
  },
]

const pulses = [
  { day: "Mon", width: "w-[72%]" },
  { day: "Tue", width: "w-[46%]" },
  { day: "Wed", width: "w-[84%]" },
  { day: "Thu", width: "w-[58%]" },
  { day: "Fri", width: "w-[67%]" },
]

function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[-8rem] top-12 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-400/10" />
      <div className="absolute right-[-6rem] top-28 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-300/10" />
      <div className="absolute bottom-0 left-1/2 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-sky-100/70 blur-3xl dark:bg-slate-200/5" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.16]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,transparent_0,transparent_42%,hsl(var(--background))_85%)]" />
    </div>
  )
}

function HomeSurface({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  bullets,
  pulseBadge,
  pulseTitle,
  pulseCaption,
  pulseMetricLabel,
  pulseMetricValue,
  pulseMetricCaption,
  pulseSuggestionLabel,
  pulseSuggestionValue,
  pulseSuggestionCaption,
  pillars,
}: {
  eyebrow: string
  title: string
  description: string
  primaryHref: string
  primaryLabel: string
  secondaryHref: string
  secondaryLabel: string
  bullets: string[]
  pulseBadge: string
  pulseTitle: string
  pulseCaption: string
  pulseMetricLabel: string
  pulseMetricValue: string
  pulseMetricCaption: string
  pulseSuggestionLabel: string
  pulseSuggestionValue: string
  pulseSuggestionCaption: string
  pillars: Array<{
    title: string
    description: string
    icon: typeof Users2
  }>
}) {
  return (
    <>
      <section className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {eyebrow}
            </div>

            <h1 className={`${displayFont.className} max-w-[11ch] text-5xl font-medium leading-[0.94] tracking-[-0.06em] text-foreground sm:text-6xl lg:text-7xl`}>
              {title}
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-foreground px-6 text-sm font-semibold text-background hover:bg-foreground/90"
              >
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-border/80 bg-background/70 px-6 text-sm backdrop-blur hover:bg-accent"
              >
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {bullets.map((bullet) => (
                <div key={bullet} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  {bullet}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-10 hidden h-24 w-24 rounded-full border border-white/30 bg-white/50 blur-2xl dark:border-white/10 dark:bg-white/5 lg:block" />
            <div className="absolute -right-4 bottom-10 hidden h-28 w-28 rounded-full bg-cyan-200/50 blur-2xl dark:bg-cyan-300/10 lg:block" />

            <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-background/80 p-4 shadow-[0_30px_80px_-36px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:bg-card/80">
              <div className="rounded-[1.5rem] border border-border/70 bg-gradient-to-br from-white to-slate-50 p-5 dark:from-slate-950 dark:to-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">This week</p>
                    <h2 className={`${displayFont.className} mt-2 text-2xl font-medium tracking-[-0.04em]`}>
                      {pulseTitle}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">{pulseCaption}</p>
                  </div>
                  <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    {pulseBadge}
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {pulses.map((pulse) => (
                    <div
                      key={pulse.day}
                      className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 rounded-2xl border border-border/60 bg-background/70 px-3 py-3 dark:bg-background/40"
                    >
                      <span className="text-sm font-medium text-foreground/80">{pulse.day}</span>
                      <div className="h-2 rounded-full bg-muted">
                        <div className={`h-2 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-400 ${pulse.width}`} />
                      </div>
                      <span className="text-xs text-muted-foreground">best</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4 dark:bg-background/40">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{pulseMetricLabel}</p>
                    <p className={`${displayFont.className} mt-2 text-3xl font-medium tracking-[-0.05em]`}>{pulseMetricValue}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{pulseMetricCaption}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-slate-950 p-4 text-slate-50 dark:bg-slate-100 dark:text-slate-900">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{pulseSuggestionLabel}</p>
                    <p className={`${displayFont.className} mt-2 text-2xl font-medium tracking-[-0.05em]`}>{pulseSuggestionValue}</p>
                    <p className="mt-1 text-sm text-slate-300 dark:text-slate-600">{pulseSuggestionCaption}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map(({ title: pillarTitle, description: pillarDescription, icon: Icon }) => (
            <div
              key={pillarTitle}
              className="rounded-[1.75rem] border border-border/70 bg-background/70 p-6 backdrop-blur dark:bg-card/55"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background dark:bg-primary dark:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className={`${displayFont.className} mt-5 text-2xl font-medium tracking-[-0.04em] text-foreground`}>
                {pillarTitle}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{pillarDescription}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const firstName =
    typeof user?.user_metadata?.first_name === "string" && user.user_metadata.first_name.trim().length > 0
      ? user.user_metadata.first_name.trim()
      : null

  const isSignedIn = mounted && !isLoading && Boolean(user)

  return (
    <main className="relative overflow-hidden bg-background">
      <AmbientBackground />

      {!mounted || isLoading ? (
        <HomeSurface
          eyebrow="Preparing your schedule"
          title="A cleaner way to coordinate time."
          description="Nutty brings availability, overlap, and planning into one place so your next meetup takes less effort."
          primaryHref="/signup"
          primaryLabel="Start planning"
          secondaryHref="/login"
          secondaryLabel="Log in"
          bullets={["Friends and groups", "Shared time windows", "Simple final decisions"]}
          pulseBadge="Syncing"
          pulseTitle="Finding the best fit"
          pulseCaption="Loading your scheduling workspace."
          pulseMetricLabel="Signal"
          pulseMetricValue="..."
          pulseMetricCaption="Getting things ready."
          pulseSuggestionLabel="Next"
          pulseSuggestionValue="One moment"
          pulseSuggestionCaption="Checking your current session."
          pillars={guestPillars}
        />
      ) : isSignedIn ? (
        <HomeSurface
          eyebrow={firstName ? `${firstName} is back` : "Your workspace is ready"}
          title={firstName ? `Welcome back, ${firstName}.` : "You are already in."}
          description="Head straight into your planning workspace. Update availability, review overlaps, and move your next meetup forward without returning to the sign-up flow."
          primaryHref="/dashboard"
          primaryLabel="Go to dashboard"
          secondaryHref="/availability"
          secondaryLabel="Edit availability"
          bullets={["Open your dashboard", "Review live overlap", "Manage friends and groups"]}
          pulseBadge="Session active"
          pulseTitle="Your planning hub is live"
          pulseCaption="No need to sign up again once your account is active."
          pulseMetricLabel="Workspace"
          pulseMetricValue="Ready"
          pulseMetricCaption="Your scheduling tools are available now."
          pulseSuggestionLabel="Recommended"
          pulseSuggestionValue="Open dashboard"
          pulseSuggestionCaption="Pick up where you left off and keep plans moving."
          pillars={memberPillars}
        />
      ) : (
        <HomeSurface
          eyebrow="Scheduling without the noise"
          title="Meet sooner. Plan less."
          description="Nutty helps friends find the right time to meet with less back-and-forth. Share availability, compare overlap, and lock in a plan in a few clear steps."
          primaryHref="/signup"
          primaryLabel="Start planning"
          secondaryHref="/dashboard"
          secondaryLabel="Open dashboard"
          bullets={["Friends and groups", "Shared time windows", "Simple final decisions"]}
          pulseBadge="4 people free"
          pulseTitle="Friday works best"
          pulseCaption="The clearest overlap is already rising to the top."
          pulseMetricLabel="Group pulse"
          pulseMetricValue="88%"
          pulseMetricCaption="Overlap across your core group this week."
          pulseSuggestionLabel="Suggested slot"
          pulseSuggestionValue="Fri, 6:30 PM"
          pulseSuggestionCaption="Dinner after class, locked in fast."
          pillars={guestPillars}
        />
      )}
    </main>
  )
}
