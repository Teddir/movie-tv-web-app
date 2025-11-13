import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getMovieDetails } from "@/lib/tmdb";
import { FullCredits } from "@/components/credits/full-credits";

interface MovieCreditsPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: MovieCreditsPageProps): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovieDetails(id);

  if (!movie) {
    return {
      title: "Movie credits not found",
    };
  }

  return {
    title: `${movie.title} — Full Cast & Crew`,
    description: `Complete list of cast and crew for ${movie.title}.`,
  };
}

export const revalidate = 900;

export default async function MovieCreditsPage({ params }: MovieCreditsPageProps) {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  const movie = await getMovieDetails(id);
  if (!movie) {
    return notFound();
  }

  return (
    <div className="space-y-10" aria-labelledby="movie-credits-heading">
      <header className="space-y-2">
        <h1 id="movie-credits-heading" className="text-3xl font-bold text-foreground">
          {movie.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Full cast and crew credits sourced from TMDB.
        </p>
      </header>

      <FullCredits
        cast={movie.credits?.cast ?? []}
        crew={movie.credits?.crew ?? []}
        mediaType="movie"
        title={movie.title}
        tmdbId={movie.id}
      />
    </div>
  );
}

