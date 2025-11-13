import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPeoplePage() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-12 w-56 rounded-lg bg-white/15" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-[420px] w-full rounded-2xl bg-white/10"
          />
        ))}
      </div>
    </div>
  );
}

