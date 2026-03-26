export default function TermsPage() {
  const inlineLinkClassName = "font-medium text-sky-700 underline underline-offset-4 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"

  return (
    <div className="bg-background min-h-screen py-12 px-4 text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Nutty</p>
          <h1 className="text-4xl font-semibold">Terms of Service</h1>
          <p className="text-lg text-muted-foreground">
            Last updated March 25, 2026. These Terms apply to Nutty services accessed at https://nutty-chi.vercel.app/ and any
            related applications or APIs.
          </p>
        </header>

        <section className="space-y-3 rounded-3xl border border-border/70 bg-card/70 p-6">
          <h2 className="text-2xl font-semibold">1. Acceptance</h2>
          <p className="text-sm text-muted-foreground">
            By creating an account or otherwise using Nutty, you agree to these Terms and the <a className={inlineLinkClassName} href="/privacy">Privacy Policy</a>.
            If you disagree with any part of the Terms, do not use the Services.
          </p>
        </section>

        <section className="space-y-3 rounded-3xl border border-border/70 bg-card/70 p-6">
          <h2 className="text-2xl font-semibold">2. Account eligibility and data</h2>
          <p className="text-sm text-muted-foreground">
            Nutty is intended for persons who are at least 16 years old. You agree to provide accurate information during
            registration, maintain the security of your credentials, and notify us of any unauthorized use. You are responsible
            for all activity that occurs under your account.
          </p>
        </section>

        <section className="space-y-3 rounded-3xl border border-border/70 bg-card/70 p-6">
          <h2 className="text-2xl font-semibold">3. Use of the Services</h2>
          <p className="text-sm text-muted-foreground">
            Nutty helps you coordinate availability, manage friends, and run group scheduling workflows. You may not misuse the
            Services, interfere with others’ use, upload malicious code, or impersonate another person.
          </p>
          <p className="text-sm text-muted-foreground">
            When you share group links or invite friends, you consent to storing availability data, friendship links, and event metadata.
          </p>
        </section>

        <section className="space-y-3 rounded-3xl border border-border/70 bg-card/70 p-6">
          <h2 className="text-2xl font-semibold">4. Google Calendar & OAuth</h2>
          <p className="text-sm text-muted-foreground">
            Nutty uses Supabase’s OAuth flow to request Google profile data and the
            <span className="font-mono"> https://www.googleapis.com/auth/calendar.events</span> scope so it can create confirmed
            events inside your Google Calendar. Supabase holds the tokens Google issues until you disconnect the integration or delete your account.
          </p>
          <p className="text-sm text-muted-foreground">
            We pass confirmed meeting details (title, date, time, timezone, participant email) to Google when you choose to publish an event.
          </p>
        </section>

        <section className="space-y-3 rounded-3xl border border-border/70 bg-card/70 p-6">
          <h2 className="text-2xl font-semibold">5. Intellectual property</h2>
          <p className="text-sm text-muted-foreground">
            Nutty and its content (design, code, trademarks, documentation) are owned by Nutty. You receive a limited,
            non-exclusive license to access and interact with the Services for personal scheduling and coordination purposes only.
          </p>
        </section>

        <section className="space-y-3 rounded-3xl border border-border/70 bg-card/70 p-6">
          <h2 className="text-2xl font-semibold">6. Termination</h2>
          <p className="text-sm text-muted-foreground">
            We may suspend or terminate your access if you violate these Terms, disrupt the Services, or create legal risk.
            You can delete your account from the dashboard or email <a className={inlineLinkClassName} href="mailto:matinkositchutima@gmail.com">matinkositchutima@gmail.com</a>.
          </p>
        </section>

        <section className="space-y-3 rounded-3xl border border-border/70 bg-card/70 p-6">
          <h2 className="text-2xl font-semibold">7. Disclaimers</h2>
          <p className="text-sm text-muted-foreground">
            The Services are provided “as is” with no warranty of uninterrupted or error-free operation. We do not promise
            any specific outcome from scheduling, confirmations, or calendar exports.
          </p>
        </section>

        <section className="space-y-3 rounded-3xl border border-border/70 bg-card/70 p-6">
          <h2 className="text-2xl font-semibold">8. Limitation of liability</h2>
          <p className="text-sm text-muted-foreground">
            To the fullest extent permitted by law, Nutty will not be liable for indirect, incidental, special, consequential,
            or punitive damages arising from your use of the Services.
          </p>
        </section>

        <section className="space-y-3 rounded-3xl border border-border/70 bg-card/70 p-6">
          <h2 className="text-2xl font-semibold">9. Governing law</h2>
          <p className="text-sm text-muted-foreground">
            These Terms are governed by the laws of the State of New York, without regard to conflicts of law principles.
          </p>
        </section>

        <section className="space-y-3 rounded-3xl border border-border/70 bg-card/70 p-6">
          <h2 className="text-2xl font-semibold">10. Changes and questions</h2>
          <p className="text-sm text-muted-foreground">
            We may update the Terms at any time; continuing to use Nutty after the update means you accept the new Terms.
            When we update, we will note the new effective date on this page.
          </p>
          <p className="text-sm text-muted-foreground">
            Questions? Contact <a className={inlineLinkClassName} href="mailto:matinkositchutima@gmail.com">matinkositchutima@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
