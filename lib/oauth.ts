export const DEFAULT_POST_AUTH_PATH = "/dashboard"

export function normalizeNextPath(target?: string | null, baseUrl?: string): string {
  if (!target) {
    return DEFAULT_POST_AUTH_PATH
  }

  if (target.startsWith("/") && !target.startsWith("//")) {
    return target
  }

  if (!baseUrl) {
    return DEFAULT_POST_AUTH_PATH
  }

  try {
    const resolvedTarget = new URL(target, baseUrl)
    const resolvedBase = new URL(baseUrl)

    if (resolvedTarget.origin !== resolvedBase.origin) {
      return DEFAULT_POST_AUTH_PATH
    }

    return `${resolvedTarget.pathname}${resolvedTarget.search}${resolvedTarget.hash}`
  } catch {
    return DEFAULT_POST_AUTH_PATH
  }
}

export function buildConsentPath(
  next?: string | null,
  options?: {
    oauth?: "complete"
    error?: string
  },
): string {
  const params = new URLSearchParams()
  const normalizedNext = normalizeNextPath(next)

  if (normalizedNext !== DEFAULT_POST_AUTH_PATH) {
    params.set("next", normalizedNext)
  }

  if (options?.oauth) {
    params.set("oauth", options.oauth)
  }

  if (options?.error) {
    params.set("error", options.error)
  }

  const query = params.toString()
  return query ? `/oauth/consent?${query}` : "/oauth/consent"
}
