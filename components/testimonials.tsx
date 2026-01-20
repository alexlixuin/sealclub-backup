import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Star } from "lucide-react"

interface Testimonial {
  name: string
  rating: number
  title: string
  content: string
  product: string
}

const testimonials: Testimonial[] = [
  {
    name: "Alex L.",
    rating: 5,
    title: "GLOW FROM WITHIN",
    content:
      "My skin looks calmer and brighter since adding the collagen + ceramide blend. The texture feels smoother and more even.",
    product: "Radiance Collagen",
  },
  {
    name: "Sarah L.",
    rating: 5,
    title: "BARRIER RESET",
    content:
      "The routine is gentle but effective. My skin feels less reactive and more hydrated throughout the day.",
    product: "Barrier Repair Serum",
  },
  {
    name: "Liam Y.",
    rating: 5,
    title: "GENTLE BUT EFFECTIVE",
    content:
      "Packaging, delivery, and results were all on point. The guidance card helped me build a simple, clean ritual.",
    product: "Clarifying Capsules",
  },
  {
    name: "Jennifer T.",
    rating: 5,
    title: "REAL LUMINOSITY",
    content:
      "My skin looks more luminous after two weeks. The formula feels luxe without being heavy.",
    product: "Luminous Skin Complex",
  },
  {
    name: "Michael R.",
    rating: 5,
    title: "NEXT-DAY ARRIVED",
    content: "Ordered in the afternoon and it landed the next day in Melbourne. Seamless service and beautiful packaging.",
    product: "Daily Glow Sachets",
  },
  {
    name: "Emma K.",
    rating: 5,
    title: "RITUAL READY",
    content: "Everything arrived quickly and the routine feels so considered. My skin feels balanced and calm.",
    product: "Hydra Balance Tonic",
  },
  {
    name: "David S.",
    rating: 5,
    title: "SLEEP + SKIN",
    content: "The night blend helps me wind down and I wake up looking fresher. Subtle but real change.",
    product: "Night Repair Capsules",
  },
  {
    name: "Emma K.",
    rating: 5,
    title: "SUBSCRIPTIONS ARE GREAT",
    content: "Monthly delivery keeps my routine consistent without thinking about reorders. Love the ease.",
    product: "Monthly Ritual Kit",
  },
  {
    name: "Rachel T.",
    rating: 5,
    title: "CALM DIGESTION, CALM SKIN",
    content: "The gut-skin support has been a game changer. My skin feels clearer and less inflamed.",
    product: "Gut-Skin Support",
  },
  {
    name: "Rachel T.",
    rating: 5,
    title: "TEXTURE SMOOTHER",
    content: "Noticed smoother texture and a softer glow after a few uses. It layers beautifully.",
    product: "Renewal Serum",
  },
  {
    name: "Luke E.",
    rating: 4.3,
    title: "PACKAGING IS ELEVATED",
    content: "Everything arrived in perfect condition and felt so premium. Love the attention to detail.",
    product: "Radiant Oil",
  },
  {
    name: "Josh L.",
    rating: 5,
    title: "AMAZING SUPPORT",
    content: "Customer care is fantastic. They helped tailor a routine that actually suits my skin.",
    product: "Sensitive Skin Set",
  },
  {
    name: "Mitab K.",
    rating: 5,
    title: "NICE PRICES",
    content: "Great value for the quality and fast delivery. Perfect everyday essentials.",
    product: "Everyday Essentials",
  },
]

export { testimonials }

export function Testimonials() {
  return (
    <div id="reviews-section" className="py-16">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Community Says</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-1 mb-2">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                </div>
                <h3 className="font-bold text-sm leading-tight">{testimonial.title}</h3>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">{testimonial.content}</p>
              </CardContent>
              <CardFooter className="flex flex-col items-start pt-2 border-t">
                <p className="font-medium text-sm">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">Purchased: {testimonial.product}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
