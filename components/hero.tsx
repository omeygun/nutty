import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Hero() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 lg:pr-10">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            Find the Perfect Time to Meet with Friends
          </h1>
          <p className="text-xl mb-8">Effortlessly coordinate schedules and connect with your university peers.</p>
          <Button asChild size="lg">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
        {/* <div className="lg:w-1/2 mt-10 lg:mt-0">
          <Image
            src="/placeholder.svg?height=400&width=400"
            alt="Scheduling Illustration"
            width={400}
            height={400}
            className="mx-auto"
          />
        </div> */}
      </div>
    </section>
  )
}

