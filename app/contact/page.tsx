import type { Metadata } from "next"
import ContactPage from "@/components/contact-page"

export const metadata: Metadata = {
  title: "Contact Us | OZPTides",
  description:
    "Get in touch with our customer support team for any questions or concerns about our research chemicals.",
}

export default function Contact() {
  return <ContactPage />
}
