"use client";

import { useState, useTransition } from "react";

import { loadMoreMovies } from "@/app/movies/actions";
import type { FilterableMediaItem } from "@/types/media";
import { MediaCard } from "@/components/media-card";
import { Button } from "@/components/ui/button";

interface MovieCategorySectionProps {
  title: string;
  description: string;
  initialItems: FilterableMediaItem[];
  category: "now-playing" | "popular" | "top-rated" | "upcoming" | null;
  hasMore: boolean;
}

export function MovieCategorySection({
  title,
  description,
  initialItems,
  category,
  hasMore,
}: MovieCategorySectionProps) {
  const headingId = `${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}-heading`;
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [canLoadMore, setCanLoadMore] = useState(hasMore);
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = () => {
    if (!category || !canLoadMore) return;
    startTransition(async () => {
      const nextPage = page + 1;
      const result = await loadMoreMovies(category, nextPage);
      setItems((prev) => {
        const map = new Map<number, FilterableMediaItem>();
        [...prev, ...result.items].forEach((item) => {
          map.set(item.id, item);
        });
        return Array.from(map.values());
      });
      setPage(nextPage);
      setCanLoadMore(result.hasMore);
    });
  };

  return (
    <section className="space-y-6" aria-labelledby={headingId}>
      <div className="space-y-2">
        <h2 id={headingId} className="text-2xl font-semibold text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <MediaCard key={`movie-${item.id}`} {...item} />
        ))}
      </div>
      {category && canLoadMore ? (
        <div className="flex justify-center">
          <Button
            onClick={handleLoadMore}
            disabled={isPending}
            variant="ghost"
            className="rounded-full border border-white/10 px-6"
          >
            {isPending ? "Loading…" : "Load more"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}

