 "use client";

import { startTransition, useEffect, useMemo, useState, useTransition } from "react";

import type { Genre } from "@/lib/tmdb";
import type { FilterableMediaItem } from "@/types/media";
import { cn } from "@/lib/utils";
import { MediaCard } from "@/components/media-card";
import { Button } from "@/components/ui/button";

type SortOption = (typeof sortOptions)[number]["value"];
type ReleaseOption = (typeof releaseFilters)[number]["value"];

interface LoadMoreResult {
  items: FilterableMediaItem[];
  hasMore: boolean;
}

interface FilterableMediaGalleryProps {
  title: string;
  description?: string;
  genres: Genre[];
  initialItems: FilterableMediaItem[];
  mediaType: "movie" | "tv";
  preset?: {
    sort?: SortOption;
    release?: ReleaseOption;
    genres?: number[];
  };
  loadMore?: (nextPage: number) => Promise<LoadMoreResult>;
  initialHasMore?: boolean;
}

const EMPTY_GENRES: number[] = [];

const sortOptions = [
  { value: "popularity", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "alphabetical", label: "A → Z" },
] as const;

const releaseFilters = [
  { value: "all", label: "All Dates" },
  { value: "upcoming", label: "Upcoming" },
  { value: "last-year", label: "Last Year" },
  { value: "last-five", label: "Last 5 Years" },
  { value: "older", label: "Older" },
] as const;

export function FilterableMediaGallery({
  title,
  description,
  genres,
  initialItems,
  mediaType,
  preset,
  loadMore,
  initialHasMore = false,
}: FilterableMediaGalleryProps) {
  const presetSort = preset?.sort ?? "popularity";
  const presetRelease = preset?.release ?? "all";
  const presetGenres = preset?.genres ?? EMPTY_GENRES;
  const presetGenresKey = useMemo(
    () => presetGenres.slice().sort((a, b) => a - b).join(","),
    [presetGenres],
  );

  const [sort, setSort] = useState<SortOption>("popularity");
  const [release, setRelease] = useState<ReleaseOption>("all");
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<FilterableMediaItem[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startLoadMoreTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      setAllItems(initialItems);
      setHasMore(initialHasMore);
      setPage(1);
    });
  }, [initialItems, initialHasMore]);

  useEffect(() => {
    startTransition(() => {
      setSort(presetSort);
      setRelease(presetRelease);
      setSelectedGenres(presetGenres);
    });
  }, [presetSort, presetRelease, presetGenresKey, presetGenres]);
  const toggleGenre = (id: number) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((genreId) => genreId !== id) : [...prev, id],
    );
  };

  const clearFilters = () => {
    setSort("popularity");
    setRelease("all");
    setSelectedGenres([]);
  };

  const filteredItems = useMemo(() => {
    const filtered = allItems.filter((item) => {
      const matchesGenre =
        selectedGenres.length === 0 ||
        selectedGenres.every((genreId) => item.genreIds?.includes(genreId));

      if (!matchesGenre) return false;

      if (release === "all") return true;

      const dateValue = item.releaseDate ? new Date(item.releaseDate) : null;
      if (!dateValue || Number.isNaN(dateValue.getTime())) {
        return release === "older";
      }

      const now = new Date();
      const difference = now.getTime() - dateValue.getTime();
      const yearInMs = 1000 * 60 * 60 * 24 * 365;

      switch (release) {
        case "upcoming":
          return dateValue.getTime() > now.getTime();
        case "last-year":
          return difference <= yearInMs;
        case "last-five":
          return difference <= yearInMs * 5;
        case "older":
          return difference > yearInMs * 5;
        default:
          return true;
      }
    });

    return filtered.sort((a, b) => compareItems(a, b, sort));
  }, [allItems, release, selectedGenres, sort]);

  const handleLoadMore = () => {
    if (!loadMore || !hasMore) return;
    startLoadMoreTransition(async () => {
      const nextPage = page + 1;
      const result = await loadMore(nextPage);
      setAllItems((prev) => {
        const map = new Map<number, FilterableMediaItem>();
        [...prev, ...result.items].forEach((item) => {
          map.set(item.id, item);
        });
        return Array.from(map.values());
      });
      setPage(nextPage);
      setHasMore(result.hasMore);
    });
  };

  return (
    <section className="space-y-6" aria-label={`${title} filters`}>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-8 rounded-3xl border border-border/60 bg-card/80 p-6 h-fit">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Sort & Filter</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground underline-offset-4 hover:text-foreground"
              onClick={clearFilters}
            >
              Reset
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sort
            </h4>
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSort(option.value)}
                  className={cn(
                    "w-full rounded-xl border border-transparent px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    sort === option.value
                      ? "bg-primary/10 text-primary"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                  )}
                  aria-pressed={sort === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

  <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Release Date
            </h4>
            <div className="space-y-2">
              {releaseFilters.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRelease(option.value)}
                  className={cn(
                    "w-full rounded-xl border border-transparent px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    release === option.value
                      ? "bg-primary/10 text-primary"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                  )}
                  aria-pressed={release === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Genres
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {genres.map((genre) => {
                const active = selectedGenres.includes(genre.id);
                return (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => toggleGenre(genre.id)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground",
                    )}
                    aria-pressed={active}
                  >
                    {genre.name}
                  </button>
                );
              })}
            </div>
            {genres.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Genres unavailable for this media type.
              </p>
            ) : null}
          </div>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing {filteredItems.length} of {allItems.length} titles
            </p>
            <p className="text-xs text-muted-foreground">
              Filters apply to {mediaType === "movie" ? "movies" : "TV shows"} sourced
              from TMDB categories.
            </p>
          </div>
          {filteredItems.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <MediaCard key={`${mediaType}-${item.id}`} {...item} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border/60 bg-card/60 p-12 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                No titles match the selected filters.
              </p>
            </div>
          )}
          {loadMore && hasMore ? (
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
        </div>
      </div>
    </section>
  );
}

function compareItems(
  a: FilterableMediaItem,
  b: FilterableMediaItem,
  sort: (typeof sortOptions)[number]["value"],
) {
  const getTime = (value: string | null | undefined) => {
    if (!value) return 0;
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
  };

  switch (sort) {
    case "rating":
      return (b.score ?? 0) - (a.score ?? 0);
    case "newest":
      return getTime(b.releaseDate) - getTime(a.releaseDate);
    case "oldest":
      return getTime(a.releaseDate) - getTime(b.releaseDate);
    case "alphabetical":
      return a.title.localeCompare(b.title);
    case "popularity":
    default:
      return (b.popularity ?? 0) - (a.popularity ?? 0);
  }
}

