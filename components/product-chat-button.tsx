"use client"

import { Button } from "@/components/ui/button"
import { useCrisp } from "@/hooks/use-crisp"

interface ProductChatButtonProps {
  productName: string
}

export function ProductChatButton({ productName }: ProductChatButtonProps) {
  const { openChat } = useCrisp()

  const handleClick = () => {
    openChat()
    // Set initial message with product name
    if (typeof window !== "undefined" && window.$crisp) {
      window.$crisp.push(["set", "message:text", `I have a question about ${productName}`])
    }
  }

  return (
    <Button onClick={handleClick} size="lg" className="whitespace-nowrap">
      Chat with Support
    </Button>
  )
}
