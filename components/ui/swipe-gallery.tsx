"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SwipeGalleryProps {
  images: string[]
  alt: string
  className?: string
  showThumbnails?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
}

export function SwipeGallery({ 
  images, 
  alt, 
  className,
  showThumbnails = true,
  autoPlay = false,
  autoPlayInterval = 5000
}: SwipeGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  const minSwipeDistance = 50

  const handleNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const handlePrevious = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  useEffect(() => {
    if (autoPlay && images.length > 1) {
      autoPlayRef.current = setInterval(() => {
        handleNext()
      }, autoPlayInterval)

      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current)
        }
      }
    }
  }, [autoPlay, autoPlayInterval, images.length, handleNext])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentIndex < images.length - 1) {
      handleNext()
    }
    if (isRightSwipe && currentIndex > 0) {
      handlePrevious()
    }

    // Reset auto-play if enabled
    if (autoPlay && images.length > 1) {
      autoPlayRef.current = setInterval(() => {
        handleNext()
      }, autoPlayInterval)
    }
  }

  if (images.length === 0) return null

  return (
    <div className={cn("relative w-full", className)}>
      {/* Main Image Container */}
      <div 
        ref={containerRef}
        className="relative aspect-square overflow-hidden rounded-lg bg-muted"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Images */}
        <div 
          className="flex transition-transform duration-300 ease-out h-full"
          style={{ 
            transform: `translateX(-${currentIndex * 100}%)`,
            width: `${images.length * 100}%`
          }}
        >
          {images.map((image, index) => (
            <div key={index} className="relative w-full h-full flex-shrink-0">
              <Image
                src={image}
                alt={`${alt} ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows - Desktop */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm hidden md:flex"
              onClick={handlePrevious}
              disabled={isTransitioning}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm hidden md:flex"
              onClick={handleNext}
              disabled={isTransitioning}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  index === currentIndex 
                    ? "bg-white scale-125" 
                    : "bg-white/50 hover:bg-white/75"
                )}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
              />
            ))}
          </div>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-200",
                index === currentIndex 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-transparent hover:border-muted-foreground/50"
              )}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
            >
              <Image
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
