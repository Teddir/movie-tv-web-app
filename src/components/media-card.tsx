"use client";

import Image from "next/image";
import Link from "next/link";

import { formatDate, formatScore, getYear } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MediaInteractions } from "@/components/media-interactions";

interface MediaCardProps {
  id: number;
  title: string;
  overview?: string | null;
  mediaType: "movie" | "tv";
  posterUrl?: string | null;
  score?: number | null;
  releaseDate?: string | null;
  supplementaryLabel?: string | null;
  href?: string;
}

const fallbackPoster =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='750' viewBox='0 0 500 750'><rect width='500' height='750' fill='%231f2937'/><text x='50%' y='50%' fill='%23e5e7eb' font-family='Arial' font-size='26' text-anchor='middle'>No Image</text></svg>";

export function MediaCard({
  id,
  title,
  overview,
  mediaType,
  posterUrl,
  score,
  releaseDate,
  supplementaryLabel,
  href,
}: MediaCardProps) {
  const Poster = (
    <div className="relative aspect-2/3 w-full overflow-hidden">
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={`${title} poster`}
          fill
          sizes="(max-width: 768px) 40vw, (max-width: 1280px) 25vw, 15vw"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          priority={false}
        />
      ) : (
        <Image
          src={fallbackPoster}
          alt="Poster not available"
          fill
          sizes="(max-width: 768px) 40vw, (max-width: 1280px) 25vw, 15vw"
          className="h-full w-full object-cover opacity-80"
        />
      )}
      <Badge
        variant="secondary"
        className="absolute left-3 top-3 bg-black/70 text-xs uppercase tracking-wide text-white shadow"
      >
        {mediaType === "movie" ? "Movie" : "TV"}
      </Badge>
      {score !== undefined && score !== null ? (
        <div className="absolute right-3 top-3 rounded-full bg-black/75 px-2.5 py-1 text-xs font-semibold text-white shadow">
          {formatScore(score)}
        </div>
      ) : null}
    </div>
  );

  return (
    <Card className="group flex flex-col overflow-hidden border-border/40 bg-card/80 backdrop-blur transition-all hover:border-border hover:bg-card">
      {href ? (
        <Link href={href} className="relative block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          {Poster}
          <span className="sr-only">Open details for {title}</span>
        </Link>
      ) : (
        Poster
      )}
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-foreground">
            {href ? (
              <Link
                href={href}
                className="transition hover:text-primary focus:outline-none focus-visible:underline"
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            {supplementaryLabel ??
              (releaseDate ? formatDate(releaseDate) : "Date TBA")}
          </p>
        </div>
        <p className="line-clamp-3 text-sm text-muted-foreground/90">
          {overview || "No synopsis provided yet."}
        </p>
        <div className="mt-auto space-y-2">
          <MediaInteractions
            id={id}
            mediaType={mediaType}
            title={title}
            releaseDate={releaseDate}
            supplementaryLabel={supplementaryLabel}
            posterUrl={posterUrl}
            score={score}
          />
          <p className="text-xs text-muted-foreground">
            {releaseDate ? getYear(releaseDate) : "Year TBA"} · TMDB score{" "}
            {score != null ? formatScore(score) : "NR"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

