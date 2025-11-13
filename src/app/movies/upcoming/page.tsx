import { Metadata } from "next";

import { MovieCategorySection } from "@/app/movies/category-section";
import { getMovieCategory } from "@/lib/tmdb";
import { mapMovieSummary } from "@/lib/mappers";

export const metadata: Metadata = {
  title: "Upcoming Movies",
  description:
    "Future releases worth adding to your watchlist before they hit theaters.",
};

export default async function UpcomingMoviesPage() {
  const upcoming = await getMovieCategory("upcoming", 1);
  const items = upcoming.results.map(mapMovieSummary);
  const hasMore = upcoming.page < upcoming.total_pages;

  return (
    <div className="space-y-14" aria-labelledby="upcoming-movies-heading">
      <MovieCategorySection
        title="Upcoming Movies"
        description="Stay ahead with soon-to-be-released films."
        initialItems={items}
        category="upcoming"
        hasMore={hasMore}
      />
    </div>
  );
}

