'use client'

import { Button } from "@/components/ui/button"

export function SeeReviewsButton() {
  const handleClick = () => {
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Button 
      size="lg" 
      variant="outline" 
      className="w-full"
      onClick={handleClick}
    >
      See All Reviews
    </Button>
  );
}
