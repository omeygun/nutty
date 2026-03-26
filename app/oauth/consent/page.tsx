import { Suspense } from "react"

import { OauthConsentClient } from "./oauth-consent-client"

function ConsentFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
    </div>
  )
}

export default function OauthConsentPage() {
  return (
    <Suspense fallback={<ConsentFallback />}>
      <OauthConsentClient />
    </Suspense>
  )
}
