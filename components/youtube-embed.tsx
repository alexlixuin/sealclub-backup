"use client"

import { useState, useRef, useEffect } from "react"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface YouTubeEmbedProps {
  videoId: string
  title: string
  className?: string
  aspectRatio?: "16/9" | "4/3"
}

export function YouTubeEmbed({ 
  videoId, 
  title, 
  className,
  aspectRatio = "16/9" 
}: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handlePlay = () => {
    setIsLoaded(true)
  }

  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-xl bg-black",
        aspectRatio === "16/9" ? "aspect-video" : "aspect-[4/3]",
        className
      )}
    >
      {!isLoaded ? (
        <>
          {/* Thumbnail - only load when in viewport */}
          {isIntersecting && (
            <img
              src={thumbnailUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          )}
          
          {/* Play button overlay */}
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
            aria-label={`Play ${title}`}
          >
            <div className="bg-red-600 hover:bg-red-700 rounded-full p-4 transition-all duration-200 group-hover:scale-110 shadow-lg">
              <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
            </div>
          </button>

          {/* Loading placeholder */}
          {!isIntersecting && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="bg-red-600 rounded-full p-4">
                <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
              </div>
            </div>
          )}
        </>
      ) : (
        /* YouTube iframe - only loaded when play is clicked */
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      )}
    </div>
  )
}
