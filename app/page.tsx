import Hero from "@/components/hero"
import Features from "@/components/features"
import HowItWorks from "@/components/how-it-works"
import Testimonials from "@/components/testimonials"
import CallToAction from "@/components/call-to-action"
import Footer from "@/components/footer"
import Header from "@/components/header"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <Header /> */}
      <main className="flex-grow">
        <Hero />
        <Features />
        <HowItWorks />
        {/* <Testimonials /> */}
        <CallToAction />
      </main>
      {/* <Footer /> */}
    </div>
  )
}

