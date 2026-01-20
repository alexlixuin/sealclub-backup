import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function PartnersLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Skeleton className="h-8 w-32 mx-auto mb-4 bg-slate-700" />
          <Skeleton className="h-16 w-full max-w-2xl mx-auto mb-6 bg-slate-700" />
          <Skeleton className="h-6 w-full max-w-3xl mx-auto mb-8 bg-slate-700" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="h-12 w-40 bg-slate-700" />
            <Skeleton className="h-12 w-40 bg-slate-700" />
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-16">
        {/* Content Skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-full max-w-3xl mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* More skeleton content */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
              <Skeleton className="h-6 w-32 mx-auto mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
