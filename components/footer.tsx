import Link from "next/link"
import { Facebook, Twitter, Instagram } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p>&copy; {new Date().getFullYear()} Nutty. All rights reserved.</p>
        </div>
        <nav className="flex flex-wrap justify-center md:justify-end space-x-4">
          {/* <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link> */}
        </nav>
        <div className="flex space-x-4 mt-4 md:mt-0">
          {/* <Link href="#" aria-label="Facebook">
            <Facebook className="w-6 h-6" />
          </Link>
          <Link href="#" aria-label="Twitter">
            <Twitter className="w-6 h-6" />
          </Link> */}
          <Link href="https://www.instagram.com/omeygunner/" aria-label="Instagram">
            <Instagram className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </footer>
  )
}

