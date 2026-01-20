import Link from "next/link"
import { generateMetadata, generateFaqSchema } from "@/lib/seo"
import { FaqClient } from "./faq-client"

export const metadata = generateMetadata({
  title: "Frequently Asked Questions",
  description: "Find answers to common questions about our research chemicals, peptides, ordering, shipping, and more. OZPTides is your trusted source for high-purity compounds.",
  keywords: ["faq", "frequently asked questions", "ozptides faq", "research chemical questions", "peptide questions"],
});

const faqCategories = [
  {
    id: "products",
    name: "Products",
    questions: [
      {
        question: "What are SARMs?",
        answer:
          "Selective Androgen Receptor Modulators (SARMs) are a class of compounds that bind to androgen receptors in certain tissues with varying degrees of selectivity. They are designed for research purposes only and are not intended for human consumption.",
      },
      {
        question: "Are your products In-house tested?",
        answer:
          "Yes, all our products undergo rigorous In-house testing by independent laboratories to ensure purity and quality. Certificates of Analysis (COA) are available upon request.",
      },
      {
        question: "How should I store my products?",
        answer:
          "Most products should be stored in a cool, dry place away from direct sunlight. For optimal stability, many products should be stored at -20°C, protected from light. Specific storage instructions are provided on each product page.",
      },
      {
        question: "What is the shelf life of your products?",
        answer:
          "The shelf life varies by product, but most of our products have a shelf life of 2-3 years when stored properly according to the recommended storage conditions.",
      },
      {
        question: "Do you provide Certificates of Analysis (COA)?",
        answer:
          "Yes, we provide Certificates of Analysis for all our products upon request. These certificates verify the purity and identity of our research compounds.",
      },
      {
        question: "What is the difference between peptides and SARMs?",
        answer:
          "Peptides are short chains of amino acids that can have various research applications, while SARMs (Selective Androgen Receptor Modulators) are compounds that selectively bind to androgen receptors in specific tissues. Both are used for different research purposes in laboratory settings.",
      },
    ],
  },
  {
    id: "ordering",
    name: "Ordering & Shipping",
    questions: [
      {
        question: "What are your shipping times?",
        answer:
          "We offer 2-day shipping within Australia and New Zealand, and 10-day worldwide shipping to most countries. All orders are processed within 1 business day.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Yes, we ship to most countries worldwide. Please note that some countries may have restrictions on importing research chemicals. It is the customer's responsibility to ensure compliance with local laws and regulations.",
      },
      {
        question: "Is my order discreet?",
        answer:
          "Yes, all orders are shipped in plain, unmarked packaging with no indication of the contents. Your privacy is important to us.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards, including Visa, Mastercard, American Express, and Discover. All payments are processed securely through Stripe.",
      },
      {
        question: "How can I track my order?",
        answer:
          "Once your order has been shipped, you will receive a shipping confirmation email with tracking information. You can also track your order by logging into your account and viewing your order history.",
      },
      {
        question: "Do you offer free shipping?",
        answer:
          "We offer free shipping on orders over $200 within Australia and New Zealand. International shipping rates vary depending on the destination.",
      },
    ],
  },
  {
    id: "returns",
    name: "Returns & Refunds",
    questions: [
      {
        question: "What is your return policy?",
        answer:
          "Due to the nature of our products, we do not accept returns or offer refunds once an order has been shipped. If there is an issue with your order, please contact our customer support team to discuss a possible resolution.",
      },
      {
        question: "What if my order is damaged or incorrect?",
        answer:
          "In the rare event that your order arrives damaged or is incorrect, please contact us within 7 days of delivery with photos of the issue. We will work with you to resolve the problem promptly.",
      },
      {
        question: "Can I cancel my order?",
        answer:
          "Orders can be canceled within 1 hour of placement. After that, we begin processing orders and cannot guarantee cancellations. Please contact our customer support team as soon as possible if you need to make changes.",
      },
    ],
  },
  {
    id: "account",
    name: "Account & Orders",
    questions: [
      {
        question: "How do I track my order?",
        answer:
          "You can track your order status by logging into your account and viewing your order history. Once your order ships, you will receive a tracking number via email.",
      },
      {
        question: "Do I need an account to place an order?",
        answer:
          "No, you can check out as a guest. However, creating an account allows you to easily track your orders, view your order history, and save your shipping information for future purchases.",
      },
      {
        question: "How do I reset my password?",
        answer:
          "You can reset your password by clicking the 'Forgot Password' link on the login page. An email will be sent to you with instructions on how to create a new password.",
      },
      {
        question: "Is my personal information secure?",
        answer:
          "Yes, we take data security very seriously. All personal information is encrypted and stored securely. We never share your information with third parties without your consent.",
      },
    ],
  },
  {
    id: "research",
    name: "Research & Usage",
    questions: [
      {
        question: "Are your products for human consumption?",
        answer:
          "No. All products sold on this website are strictly for laboratory research purposes only. They are not intended for human consumption, veterinary use, or any other application outside of a controlled laboratory setting.",
      },
      {
        question: "What safety precautions should I take?",
        answer:
          "Always use appropriate laboratory safety equipment including gloves, lab coat, and safety glasses. Work in a well-ventilated area or under a fume hood if necessary. Avoid contact with skin, eyes, and clothing, and wash hands thoroughly after handling.",
      },
      {
        question: "Do you provide Material Safety Data Sheets (MSDS)?",
        answer:
          "Yes, Material Safety Data Sheets are available for all our products upon request. These documents provide important safety information for handling our research compounds.",
      },
    ],
  },
]

export default function FAQPage() {
  const allQuestions = faqCategories.flatMap(category => category.questions);
  const faqJsonLd = generateFaqSchema(allQuestions);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FaqClient categories={faqCategories} />
    </>
  )
}
