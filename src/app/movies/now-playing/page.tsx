import { Metadata } from "next";

import { MovieCategorySection } from "@/app/movies/category-section";
import { getMovieCategory } from "@/lib/tmdb";
import { mapMovieSummary } from "@/lib/mappers";

export const metadata: Metadata = {
  title: "Now Playing Movies",
  description:
    "Experience the films currently lighting up the big screen, refreshed straight from TMDB.",
};

export default async function NowPlayingPage() {
  const nowPlaying = await getMovieCategory("now_playing", 1);
  const items = nowPlaying.results.map(mapMovieSummary);
  const hasMore = nowPlaying.page < nowPlaying.total_pages;

  return (
    <div className="space-y-14" aria-labelledby="now-playing-heading">
      <MovieCategorySection
        title="Now Playing"
        description="The latest cinematic releases, curated from TMDB."
        initialItems={items}
        category="now-playing"
        hasMore={hasMore}
      />
    </div>
  );
}

