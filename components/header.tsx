"use client"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import dynamic from "next/dynamic"
import { useState } from "react"
import { Menu, X } from "lucide-react"

// Dynamically import AuthButtons with no SSR
const AuthButtons = dynamic(() => import("@/components/auth/auth-buttons").then((mod) => mod.AuthButtons), {
  ssr: false,
})

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
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
        <nav className="mt-2 space-y-2 px-8 font-bold pb-4">
          <Link href="/dashboard" className="block hover:underline">
            {'>'} Dashboard
          </Link>
          <Link href="/availability" className="block hover:underline">
            {'>'} Availability
          </Link>
          <Link href="/find-time" className="block hover:underline">
            {'>'} Find Time
          </Link>
          <Link href="/friends" className="block hover:underline">
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
