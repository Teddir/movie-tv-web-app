"use client";

import { useMemo } from "react";
import { CheckIcon, PlusIcon, StarIcon } from "lucide-react";

import { formatDate } from "@/lib/utils";
import { useWatchlist } from "@/components/providers/watchlist-provider";
import { useTmdbSession } from "@/components/providers/tmdb-session-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MediaInteractionsProps {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  releaseDate?: string | null;
  posterUrl?: string | null;
  score?: number | null;
  supplementaryLabel?: string | null;
  className?: string;
  layout?: "stacked" | "inline";
  showRating?: boolean;
}

export function MediaInteractions({
  id,
  mediaType,
  title,
  releaseDate,
  posterUrl,
  score,
  supplementaryLabel,
  className,
  layout = "stacked",
  showRating = true,
}: MediaInteractionsProps) {
  const { toggleWatchlist, isInWatchlist, setRating, getRating, hydrated } =
    useWatchlist();
  const { ensureSession } = useTmdbSession();

  const meta = useMemo(
    () => ({
      id,
      mediaType,
    }),
    [id, mediaType],
  );

  const inWatchlist = hydrated ? isInWatchlist(meta.id, meta.mediaType) : false;
  const userRating = hydrated ? getRating(meta.id, meta.mediaType) : null;

  const handleToggleWatchlist = async () => {
    const sessionId = await ensureSession();
    if (!sessionId) return;
    toggleWatchlist({
      id,
      mediaType,
      title,
      subtitle: releaseDate ? formatDate(releaseDate) : supplementaryLabel ?? undefined,
      image: posterUrl ?? undefined,
      averageScore: score ?? undefined,
      releaseDate,
    });
  };

  const handleRate = async (value: number) => {
    const sessionId = await ensureSession();
    if (!sessionId) return;
    setRating(id, mediaType, value);
    try {
      await fetch("/api/tmdb/rate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mediaType,
          id,
          rating: value * 2,
          guestSessionId: sessionId,
        }),
      });
    } catch (error) {
      console.warn("Failed to submit TMDB rating", error);
    }
  };

  return (
    <div
      className={cn(
        "space-y-2",
        layout === "inline" && "flex flex-col gap-2 sm:flex-row sm:items-center sm:space-y-0",
        className,
      )}
    >
      <Button
        onClick={handleToggleWatchlist}
        variant={inWatchlist ? "secondary" : "default"}
        className={cn(
          layout === "inline" ? "sm:w-auto" : "w-full justify-center",
          "gap-2",
        )}
        aria-pressed={inWatchlist}
        aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      >
        {inWatchlist ? (
          <>
            <CheckIcon className="h-4 w-4" aria-hidden="true" />
            Saved
          </>
        ) : (
          <>
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Watchlist
          </>
        )}
      </Button>

      {showRating ? (
        <div
          className={cn(
            "flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2",
            layout === "inline" && "w-full sm:w-auto sm:justify-start sm:gap-4",
          )}
        >
          <span className="text-xs font-medium uppercase text-muted-foreground">
            Rate
          </span>
          <div
            className={cn(
              "flex items-center gap-1",
              layout === "inline" && "sm:gap-1.5",
            )}
            role="radiogroup"
            aria-label={`Rate ${title}`}
          >
            {[1, 2, 3, 4, 5].map((value) => {
              const active = (userRating ?? 0) >= value;
              return (
                <button
                  key={value}
                  type="button"
                  className="rounded-full p-1 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => handleRate(value)}
                  aria-checked={active}
                  role="radio"
                >
                  <StarIcon
                    className={cn(
                      "h-4 w-4",
                      active ? "fill-primary text-primary" : "text-muted-foreground",
                    )}
                    aria-hidden="true"
                  />
                  <span className="sr-only">
                    {value} star{value > 1 ? "s" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

