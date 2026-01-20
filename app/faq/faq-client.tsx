"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"

// Define the type for the categories prop
interface FaqCategory {
  id: string;
  name: string;
  questions: { question: string; answer: string }[];
}

interface FaqClientProps {
  categories: FaqCategory[];
}

export function FaqClient({ categories }: FaqClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredFaqs = categories
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          (searchQuery.trim() === "" ||
            q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.answer.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (activeTab === "all" || activeTab === category.id),
      ),
    }))
    .filter((category) => category.questions.length > 0)

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-center mb-8">
          Find answers to common questions about our products, ordering, shipping, and more.
        </p>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search FAQs..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="w-full flex flex-wrap justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {filteredFaqs.length > 0 ? (
          filteredFaqs.map(
            (category, index) =>
              category.questions.length > 0 && (
                <div key={index} className="mb-8">
                  {activeTab === "all" && <h2 className="text-xl font-semibold mb-4">{category.name}</h2>}
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`${index}-${faqIndex}`}>
                        <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ),
          )
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No FAQs found matching your search.</p>
            <Button variant="ghost" className="mt-4" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">Can't find what you're looking for? Contact our support team.</p>
          <Button asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
