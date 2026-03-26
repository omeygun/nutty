"use client"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import dynamic from "next/dynamic"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Space_Grotesk } from "next/font/google"

const headerFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
})

// Dynamically import AuthButtons with no SSR
const AuthButtons = dynamic(() => import("@/components/auth/auth-buttons").then((mod) => mod.AuthButtons), {
  ssr: false,
})

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className={`${headerFont.className} text-2xl font-bold tracking-tight`}>
          Nutty | นัดที่
        </Link>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Desktop nav */}
        <nav className={`${headerFont.className} hidden items-center space-x-5 text-[0.95rem] font-medium tracking-tight md:flex`}>
          <Link href="/dashboard" className="transition-colors hover:text-foreground/70">
            Dashboard
          </Link>
          <Link href="/availability" className="transition-colors hover:text-foreground/70">
            Availability
          </Link>
          <Link href="/find-time" className="transition-colors hover:text-foreground/70">
            Find Time
          </Link>
          <Link href="/groups/new" className="transition-colors hover:text-foreground/70">
            Groups
          </Link>
          <Link href="/friends" className="transition-colors hover:text-foreground/70">
            Friends
          </Link>
        </nav>

        {/* Auth buttons & theme toggle */}
        <div className="hidden md:flex items-center space-x-4">
          <AuthButtons />
          <ModeToggle />
        </div>
      </div>

      {/* Animated Mobile nav */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className={`${headerFont.className} mt-2 space-y-2 px-8 pb-4 text-base font-medium tracking-tight`}>
          <Link href="/dashboard" className="block transition-colors hover:text-foreground/70">
            {'>'} Dashboard
          </Link>
          <Link href="/availability" className="block transition-colors hover:text-foreground/70">
            {'>'} Availability
          </Link>
          <Link href="/find-time" className="block transition-colors hover:text-foreground/70">
            {'>'} Find Time
          </Link>
          <Link href="/groups/new" className="block transition-colors hover:text-foreground/70">
            {'>'} Groups
          </Link>
          <Link href="/friends" className="block transition-colors hover:text-foreground/70">
            {'>'} Friends
          </Link>
          <div className="mt-4 flex items-center space-x-4">
            <AuthButtons />
            <ModeToggle />
          </div>
        </nav>
      </div>
    </header>
  )
}
