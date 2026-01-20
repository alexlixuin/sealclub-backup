"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Star, StarHalf, User } from "lucide-react"
import type { Review } from "@/lib/types"

interface ProductReviewsProps {
  productId: string
}

// Mock reviews data - in a real app, this would come from a database
export const mockReviews: Record<string, Review[]> = {
  "rad-140-testolone": [
    {
      id: "1",
      author: "John D.",
      rating: 5,
      date: "2023-04-15",
      title: "Excellent for Research",
      content:
        "High quality product for my laboratory research. The purity is excellent and the results have been consistent across multiple experiments.",
      verified: true,
    },
    {
      id: "2",
      author: "Michael R.",
      rating: 4.5,
      date: "2023-03-22",
      title: "Good Quality",
      content:
        "I've been using this in my research for several months now. The quality is good and it dissolves well. Would recommend for research purposes.",
      verified: true,
    },
  ],
  "mk-2866-ostarine": [
    {
      id: "1",
      author: "Sarah L.",
      rating: 5,
      date: "2023-05-10",
      title: "Perfect for My Research",
      content:
        "This product has been instrumental in my research. The quality is top-notch and the results have been very promising.",
      verified: true,
    },
  ],
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(mockReviews[productId] || [])
  const [isWritingReview, setIsWritingReview] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    content: "",
  })
  const { toast } = useToast()

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!newReview.title.trim() || !newReview.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    // Create new review
    const review: Review = {
      id: Date.now().toString(),
      author: "You",
      rating: newReview.rating,
      date: new Date().toISOString().split("T")[0],
      title: newReview.title,
      content: newReview.content,
      verified: true,
    }

    // Add to reviews
    setReviews([review, ...reviews])

    // Reset form
    setNewReview({
      rating: 5,
      title: "",
      content: "",
    })
    setIsWritingReview(false)

    toast({
      title: "Review submitted",
      description: "Thank you for your review!",
    })
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="fill-primary text-primary h-4 w-4" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="fill-primary text-primary h-4 w-4" />)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-muted-foreground h-4 w-4" />)
    }

    return stars
  }

  return (
    <div className="space-y-6">
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No reviews yet. Be the first to review this product!</p>
          <Button onClick={() => setIsWritingReview(true)}>Write a Review</Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Customer Reviews ({reviews.length})</h3>
            <Button onClick={() => setIsWritingReview(true)}>Write a Review</Button>
          </div>

          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{review.author}</p>
                      <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(review.date).toLocaleDateString()}
                    {review.verified && (
                      <span className="ml-2 text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
                <h4 className="font-medium mt-3">{review.title}</h4>
                <p className="text-muted-foreground mt-1">{review.content}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {isWritingReview && (
        <div className="border rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= newReview.rating ? "fill-primary text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="review-title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <Input
                id="review-title"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                placeholder="Summarize your experience"
                required
              />
            </div>
            <div>
              <label htmlFor="review-content" className="block text-sm font-medium mb-1">
                Review
              </label>
              <Textarea
                id="review-content"
                value={newReview.content}
                onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                placeholder="Share your research experience with this product"
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsWritingReview(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Review</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
