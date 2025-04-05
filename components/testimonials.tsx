import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Alex Johnson",
    avatar: "AJ",
    role: "Computer Science Student",
    content: "Nutty has made coordinating study groups so much easier! No more back-and-forth messages.",
  },
  {
    name: "Samantha Lee",
    avatar: "SL",
    role: "Business Major",
    content: "I love how Nutty integrates with my university schedule. It's a game-changer for group projects!",
  },
  {
    name: "Michael Chen",
    avatar: "MC",
    role: "Engineering Student",
    content: "The AI suggestions are spot-on. Nutty helps me make the most of my free time between classes.",
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">What Students Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{testimonial.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p>"{testimonial.content}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

