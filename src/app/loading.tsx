import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/70 p-8">
        <Skeleton className="absolute inset-0" />
        <div className="relative z-10 space-y-4">
          <Skeleton className="h-4 w-24 rounded-full bg-white/40" />
          <Skeleton className="h-10 w-1/2 rounded-lg bg-white/40" />
          <Skeleton className="h-24 w-3/4 rounded-lg bg-white/30" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 rounded-full bg-white/30" />
            <Skeleton className="h-10 w-28 rounded-full bg-white/20" />
          </div>
        </div>
      </section>

      <SkeletonShelf />
      <SkeletonShelf />
      <SkeletonShelf />
    </div>
  );
}

function SkeletonShelf() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-56 rounded-lg bg-white/20" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-72 w-56 rounded-2xl bg-white/10" />
        ))}
      </div>
    </div>
  );
}

