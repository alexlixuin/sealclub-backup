"use client"

import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { shimmerDataURL } from "@/lib/blur"

interface PerformanceOptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
}

export function PerformanceOptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  priority = false,
  sizes,
  quality = 85,
}: PerformanceOptimizedImageProps) {
  const [isInView, setIsInView] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: "50px",
        threshold: 0.1,
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  return (
    <div ref={imgRef} className={`relative ${fill ? "w-full h-full" : ""}`}>
      {isInView && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          className={`${className} ${
            hasLoaded ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          quality={quality}
          sizes={sizes}
          placeholder="blur"
          blurDataURL={shimmerDataURL(width || 400, height || 400)}
          onLoad={() => setHasLoaded(true)}
        />
      )}
      {!hasLoaded && (
        <div
          className={`${className} bg-muted animate-pulse`}
          style={{
            width: fill ? "100%" : width,
            height: fill ? "100%" : height,
          }}
        />
      )}
    </div>
  )
}
