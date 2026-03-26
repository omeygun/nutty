"use client"

const storageKey = (slug: string) => `nutty.group.${slug}.token`

export function getStoredGroupToken(slug: string) {
  if (typeof window === "undefined") {
    return null
  }

  return window.localStorage.getItem(storageKey(slug))
}

export function setStoredGroupToken(slug: string, token: string) {
  window.localStorage.setItem(storageKey(slug), token)
}

export function ensureGroupToken(slug: string) {
  const stored = getStoredGroupToken(slug)

  if (stored) {
    return stored
  }

  const token = crypto.randomUUID()
  setStoredGroupToken(slug, token)
  return token
}

export async function hashGroupToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token))
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
}
