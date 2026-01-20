"use client"

import { Quote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ProductTestimonialProps {
  productName: string
}

const testimonials: Record<string, { text: string; author: string }> = {
  "CJC-1295 – Research-Grade Growth Hormone Secretagogue": {
    text: "When paired with ipamorelin it's crazy not only for the growth hormone but for the gym as well, my sleeps also improved for the better which is a bonus.",
    author: "Marcus T. - Sydney"
  },
  "Ipamorelin – Research-Grade GH Secretagogue": {
    text: "Ipamorelin helped me build lean muscle and feel more better overall! I love it so much and how pure the compound is.",
    author: "Sarah K. - Melbourne"
  },
  "HGH 191AA – Recombinant Research Peptide Hormone": {
    text: "HGH helped me gain serious muscle mass and can definitely see the bone density improvements! I love it so much and how reliable the results are.",
    author: "David R. - Brisbane"
  },
  "Retatrutide – (GIPR/GLP-1r Agonist)": {
    text: "Retatrutide helped me lose 15kg in 3 months! I love it so much and how consistent the quality is.",
    author: "Lori J. - Perth"
  },
  "Tirzepatide – GIP/GLP-1r Analog for Metabolic Research Use": {
    text: "Tirzepatide helped me drop 12kg and control my appetite perfectly! I love it so much and how well it works.",
    author: "Michael B. - Adelaide"
  },
  "GHK-CU - Regenerative Copper Peptide": {
    text: "GHK-Cu helped me get smoother skin and reduced fine lines! I love it so much and how easy to read the protocol guides are",
    author: "Emma L. - Canberra"
  },
  "GLOW – Skin Peptide Stack (BPC-157, GHK-Cu, TB500)": {
    text: "GLOW helped me heal acne scars and get glowing skin! I love it so much and how effective it is.",
    author: "Jessica M. - Gold Coast"
  }
}

export function ProductTestimonial({ productName }: ProductTestimonialProps) {
  if (!productName) {
    return null
  }
  
  const testimonial = testimonials[productName]
  
  if (!testimonial) {
    return null
  }

  return (
    <Card className="border-primary/10 bg-primary/5 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Quote className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <blockquote className="text-sm italic text-foreground/90 mb-2">
              "{testimonial.text}"
            </blockquote>
            <cite className="text-xs text-muted-foreground font-medium">
              — {testimonial.author}
            </cite>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
