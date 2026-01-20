import Image from "next/image"

// Static manifest of files under public/lab/ (kept explicit for build-time safety)
// Images
const labImages = [
  "/lab/setup_photo_1.jpg",
  "/lab/bac_birdseyeview.jpg",
  "/lab/bac_photo_printer.jpg",
  "/lab/black_top_ozptides.jpg",
  "/lab/glass_vials.jpg",
  "/lab/glass_vials_birdseyeview.jpg",
  "/lab/scale_image.jpg",
  "/lab/sf_400_scale_jug.jpg",
  "/lab/test_photo.jpg",
]

// Videos
const labVideos = [
  { src: "/lab/bac_video.mp4", poster: "/lab/bac_photo_printer.jpg" },
  { src: "/lab/test_video.mp4", poster: "/lab/test_photo.jpg" },
]

export const metadata = {
  title: "Australian Lab — OZPTides",
  description: "See where your peptides, oils, and bacteriostatic water are manufactured, packed, and shipped in Melbourne.",
}

export default function LabPage() {
  return (
    <main className="py-16">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Our Australian Lab</h1>
          <p className="text-muted-foreground max-w-2xl">
            Tour our Melbourne facility where products are carefully prepared, packed, and dispatched. Photos and videos
            below are captured directly from our workspace to give you full transparency.
          </p>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Images */}
          {labImages.map((src) => (
            <div key={src} className="relative w-full overflow-hidden rounded-lg border bg-card/40">
              <div className="relative aspect-[4/3]">
                <Image
                  src={src}
                  alt="OZPTides lab photo"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={false}
                />
              </div>
            </div>
          ))}

          {/* Videos */}
          {labVideos.map((v) => (
            <div key={v.src} className="relative w-full overflow-hidden rounded-lg border bg-card/40">
              <div className="relative aspect-[4/3]">
                <video
                  className="h-full w-full object-cover"
                  controls
                  preload="metadata"
                  poster={v.poster}
                >
                  <source src={v.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}