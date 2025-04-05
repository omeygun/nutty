import { Calendar, Users, BookOpen, Sparkles } from "lucide-react"

const features = [
  {
    icon: Calendar,
    title: "Sync with Google Calendar (WIP)",
    description: "Seamlessly integrate your existing schedule.",
  },
  {
    icon: Users,
    title: "Invite and Connect with Friends",
    description: "Easily add friends and find common free time.",
  },
  {
    icon: BookOpen,
    title: "Smart Scheduling with University Timetables (WIP)",
    description: "Automatically consider your academic commitments.",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <feature.icon className="w-12 h-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

