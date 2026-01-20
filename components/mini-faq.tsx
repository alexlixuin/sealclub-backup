import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowRight } from "lucide-react"

const faqItems = [
  {
    question: "What are SARMs?",
    answer:
      "Selective Androgen Receptor Modulators (SARMs) are a class of compounds that bind to androgen receptors in certain tissues with varying degrees of selectivity. They are designed for research purposes only and are not intended for human consumption.",
  },
  {
    question: "Are your products In-house tested?",
    answer:
      "Yes, all our products undergo rigorous In-house testing to ensure purity and quality. Certificates of Analysis (COA) are available upon request.",
  },
  {
    question: "What are your shipping times?",
    answer:
      "We offer 2-day shipping within Australia and New Zealand, and 10-day worldwide shipping. All orders are processed within 1 business day.",
  },
  {
    question: "How should I store my products?",
    answer:
      "Most products should be stored in a cool, dry place away from direct sunlight. For optimal stability, many products should be stored at -20°C, protected from light. Specific storage instructions are provided on each product page.",
  },
]

export function MiniFAQ() {
  return (
    <div className="py-16 bg-secondary/30">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          <Button variant="outline" asChild>
            <Link href="/faq">
              View All FAQs <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  )
}
