import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingMoviesPage() {
  return (
    <div className="space-y-10">
      <Skeleton className="h-12 w-56 rounded-lg bg-white/15" />
      {Array.from({ length: 4 }).map((_, section) => (
        <div key={section} className="space-y-4">
          <Skeleton className="h-8 w-44 rounded-lg bg-white/10" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, card) => (
              <Skeleton
                key={card}
                className="h-[360px] w-full rounded-2xl bg-white/10"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

