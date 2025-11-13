"use client";

import Image from "next/image";
import Link from "next/link";
import { BookmarkIcon, FilmIcon, PlayIcon, StarIcon, TrashIcon } from "lucide-react";

import { formatDate, formatScore } from "@/lib/utils";
import { useWatchlist } from "@/components/providers/watchlist-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export function WatchlistDrawer() {
  const { items, removeFromWatchlist, getRating, hydrated, authenticated } =
    useWatchlist();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-white/30 hover:bg-white/10"
        >
          <BookmarkIcon className="h-4 w-4" aria-hidden="true" />
          Watchlist
          {hydrated && items.length > 0 ? (
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              {items.length}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="glass-panel flex h-full max-w-lg flex-col gap-4 overflow-hidden bg-background/95">
        <SheetHeader className="space-y-1">
          <SheetTitle className="text-2xl font-semibold text-foreground">
            Your Watchlist
          </SheetTitle>
          <SheetDescription className="text-base text-muted-foreground">
            Save titles to return to later and track your personal ratings.
          </SheetDescription>
        </SheetHeader>
        <Separator className="bg-border/60" />
        <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto pr-2">
          {!hydrated ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading your watchlist...
            </div>
          ) : !authenticated ? (
            <div className="py-12 text-center text-muted-foreground">
              Preparing your guest session...
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center text-muted-foreground">
              <BookmarkIcon className="h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
              <div>
                <p className="text-lg font-semibold text-foreground">
                  So empty. So many stories await.
                </p>
                <p className="text-sm text-muted-foreground">
                  Add movies or shows to build your queue.
                </p>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <article
                key={`${item.mediaType}-${item.id}`}
                className="group rounded-2xl border border-border/60 bg-card/70 p-4 transition hover:border-border hover:bg-card"
              >
                <div className="flex flex-row gap-4">
                  <div className="relative h-28 w-20 overflow-hidden rounded-xl border border-border/50 bg-muted/60">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={`${item.title} poster`}
                        fill
                        sizes="80px"
                        className="object-cover w-28 h-28 transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <header>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {item.mediaType === "movie" ? "Movie" : "TV Series"}
                      </p>
                      <h3 className="text-lg font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.subtitle ?? (item.releaseDate ? formatDate(item.releaseDate) : "Date TBA")}
                      </p>
                    </header>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <StarIcon className="h-4 w-4 text-primary" aria-hidden="true" />
                        {(() => {
                          const rating = getRating(item.id, item.mediaType);
                          return rating ? `${rating}/5` : "Unrated";
                        })()}
                      </span>
                      <span className="text-muted-foreground">
                        TMDB {item.averageScore ? formatScore(item.averageScore) : "NR"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-2"
                        asChild
                      >
                        <Link href={`/${item.mediaType === "movie" ? "movies" : "tv"}/${item.id}`}>
                          <FilmIcon className="h-3.5 w-3.5" aria-hidden="true" />
                          View details
                        </Link>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-2"
                        asChild
                      >
                        <Link
                          href={`https://www.themoviedb.org/${item.mediaType}/${item.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <PlayIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-destructive"
                        onClick={() => removeFromWatchlist(item.id, item.mediaType)}
                      >
                        <TrashIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

