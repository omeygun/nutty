import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CallToAction() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Simplify Your Schedule?</h2>
        <p className="text-xl mb-8">Join Nutty today and start making the most of your time.</p>
        <Button asChild size="lg">
          <Link href="/signup">Sign Up Free</Link>
        </Button>
      </div>
    </section>
  )
}

