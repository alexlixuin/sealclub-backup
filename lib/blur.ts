// Lightweight blur placeholder utilities
// Use shimmer SVG for instant placeholder, fallback to tiny transparent pixel if needed

export function shimmer(width: number, height: number) {
  return `\n<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">\n  <defs>\n    <linearGradient id="g">\n      <stop stop-color="#f6f7f8" offset="20%" />\n      <stop stop-color="#edeef1" offset="50%" />\n      <stop stop-color="#f6f7f8" offset="70%" />\n    </linearGradient>\n  </defs>\n  <rect width="${width}" height="${height}" fill="#f6f7f8" />\n  <rect id="r" width="${width}" height="${height}" fill="url(#g)" />\n  <animate xlink:href="#r" attributeName="x" from="-${width}" to="${width}" dur="1.2s" repeatCount="indefinite"  />\n</svg>`
}

export function toBase64(str: string) {
  if (typeof window === 'undefined') {
    return Buffer.from(str).toString('base64')
  } else {
    // btoa works in browsers
    return window.btoa(str)
  }
}

// Convenience: returns a blurDataURL for next/image placeholder
export function shimmerDataURL(width = 700, height = 700) {
  return `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`
}
