"use client";
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import dynamic from "next/dynamic"

// Dynamically import AuthButtons with no SSR
const AuthButtons = dynamic(() => import("@/components/auth/auth-buttons").then((mod) => mod.AuthButtons), {
  ssr: false,
})

export default function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Nutty | นัดที่
        </Link>
        <nav className="hidden md:flex space-x-4">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/availability" className="hover:underline">
            Availability
          </Link>
          <Link href="/find-time" className="hover:underline">
            Find Time
          </Link>
          <Link href="/friends" className="hover:underline">
            Friends
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <AuthButtons />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

