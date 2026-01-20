import { Skeleton } from "@/components/ui/skeleton"

export default function ContactLoading() {
  return (
    <div className="container px-4 py-8 mx-auto max-w-6xl">
      <Skeleton className="h-6 w-48 mb-8" />

      <div className="flex flex-col items-center text-center mb-12 mt-8">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-5 w-full max-w-2xl" />
        <Skeleton className="h-5 w-full max-w-xl mt-2" />
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>

      <Skeleton className="h-64 w-full rounded-lg mb-12" />

      <div className="grid gap-8 md:grid-cols-2 mb-12">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>

      <div className="text-center mb-8">
        <Skeleton className="h-8 w-64 mx-auto mb-4" />
        <Skeleton className="h-12 w-48 mx-auto" />
      </div>
    </div>
  )
}
