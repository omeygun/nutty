"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { normalizeNextPath } from "@/lib/oauth"
import { supabase } from "@/lib/supabase"

type AuthResponse = {
  error: any | null
  data: any | null
}

const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events"

function getClientOrigin() {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin
  }

  return process.env.NEXT_PUBLIC_BASE_URL
}

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<AuthResponse>
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signOut: () => Promise<void>
  signInOauth: (next?: string) => Promise<AuthResponse>
  resetPassword: (email: string) => Promise<AuthResponse>
}



// Create a default context value with no-op functions
const defaultContextValue: AuthContextType = {
  user: null,
  session: null,
  isLoading: true,
  signUp: async () => ({ error: new Error("Not implemented"), data: null }),
  signIn: async () => ({ error: new Error("Not implemented"), data: null }),
  signOut: async () => { },
  signInOauth: async () => ({ error: new Error("Not implemented"), data: null }),
  resetPassword:async () => ({ error: new Error("Not implemented"), data: null }),
}

const AuthContext = createContext<AuthContextType>(defaultContextValue)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [supabaseInitialized, setSupabaseInitialized] = useState(false)

  useEffect(() => {
    // Try to initialize Supabase
    try {
      if (!supabase) {
        console.error("Supabase client not initialized")
        setIsLoading(false)
        return
      }

      setSupabaseInitialized(true)

      // Get session from storage
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      })

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error("Failed to initialize Supabase:", error)
      setIsLoading(false)
    }
  }, [])

  async function resetPassword(email: string) {
    if (!supabase) {
      return { error: new Error("Supabase client not initialized"), data: null }
    }

    const redirectOrigin = getClientOrigin()

    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectOrigin ? `${redirectOrigin}/reset-password` : undefined,
    })
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      if (!supabase) {
        return { error: new Error("Supabase client not initialized"), data: null }
      }

      return await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })
    } catch (error) {
      console.error("Sign up error:", error)
      return { error, data: null }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      if (!supabase) {
        return { error: new Error("Supabase client not initialized"), data: null }
      }

      return await supabase.auth.signInWithPassword({
        email,
        password,
      })
      // return await supabase.auth.signInWithOAuth({
      //   provider: "google",
      //   options: {
      //     redirectTo: 'http://localhost:3000'
      //   }

      // })
    } catch (error) {
      console.error("Sign in error:", error)
      return { error, data: null }
    }
  }

  const signInOauth = async (next?: string) => {
    try {
      if (!supabase) {
        return { error: new Error("Supabase client not initialized"), data: null }
      }

      const baseUrl = getClientOrigin()
      const normalizedNext = normalizeNextPath(next, baseUrl)
      const consentUrl = new URL("/oauth/consent", baseUrl ?? window.location.origin)
      consentUrl.searchParams.set("next", normalizedNext)

      return await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: consentUrl.toString(),
          scopes: GOOGLE_CALENDAR_SCOPE,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        }

      })
    } catch (error) {
      console.error("Sign in error:", error)
      return { error, data: null }
    }
  }

  const signOut = async () => {
    try {
      if (!supabase) {
        console.error("Supabase client not initialized")
        return
      }

      await supabase.auth.signOut()
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const value = {
    user,
    session,
    isLoading: isLoading || !supabaseInitialized,
    signUp,
    signIn,
    signOut,
    signInOauth,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  return context
}
