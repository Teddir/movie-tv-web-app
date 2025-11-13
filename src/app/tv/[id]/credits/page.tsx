import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getTvDetails } from "@/lib/tmdb";
import { FullCredits } from "@/components/credits/full-credits";

interface TvCreditsPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: TvCreditsPageProps): Promise<Metadata> {
  const { id } = await params;
  const show = await getTvDetails(id);

  if (!show) {
    return {
      title: "Series credits not found",
    };
  }

  return {
    title: `${show.name} — Full Cast & Crew`,
    description: `Complete list of cast and crew for ${show.name}.`,
  };
}

export const revalidate = 900;

export default async function TvCreditsPage({ params }: TvCreditsPageProps) {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  const show = await getTvDetails(id);
  if (!show) {
    return notFound();
  }

  return (
    <div className="space-y-10" aria-labelledby="tv-credits-heading">
      <header className="space-y-2">
        <h1 id="tv-credits-heading" className="text-3xl font-bold text-foreground">
          {show.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Full cast and crew credits sourced from TMDB.
        </p>
      </header>

      <FullCredits
        cast={show.credits?.cast ?? []}
        crew={show.credits?.crew ?? []}
        mediaType="tv"
        title={show.name}
        tmdbId={show.id}
      />
    </div>
  );
}

