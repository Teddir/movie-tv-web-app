import Link from "next/link";

import { MediaCard } from "@/components/media-card";
import { Button } from "@/components/ui/button";

interface MediaShelfItem {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  overview?: string | null;
  posterUrl?: string | null;
  score?: number | null;
  releaseDate?: string | null;
  supplementaryLabel?: string | null;
  href?: string;
}

interface MediaShelfProps {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  items: MediaShelfItem[];
}

export function MediaShelf({
  title,
  subtitle,
  ctaLabel = "See all",
  ctaHref,
  items,
}: MediaShelfProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {ctaHref ? (
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href={ctaHref} aria-label={`${ctaLabel} ${title}`}>
              {ctaLabel}
            </Link>
          </Button>
        ) : null}
      </div>
      <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <div key={`${item.mediaType}-${item.id}`} className="w-56 shrink-0">
            <MediaCard {...item} />
          </div>
        ))}
      </div>
    </section>
  );
}

