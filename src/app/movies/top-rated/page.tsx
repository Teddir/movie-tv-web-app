import { Metadata } from "next";

import { MovieCategorySection } from "@/app/movies/category-section";
import { getMovieCategory } from "@/lib/tmdb";
import { mapMovieSummary } from "@/lib/mappers";

export const metadata: Metadata = {
  title: "Top Rated Movies",
  description:
    "Essential films recognized by audiences and critics alike, sourced directly from TMDB.",
};

export default async function TopRatedMoviesPage() {
  const topRated = await getMovieCategory("top_rated", 1);
  const items = topRated.results.map(mapMovieSummary);
  const hasMore = topRated.page < topRated.total_pages;

  return (
    <div className="space-y-14" aria-labelledby="top-rated-heading">
      <MovieCategorySection
        title="Top Rated"
        description="Critically acclaimed favorites delivering unforgettable performances."
        initialItems={items}
        category="top-rated"
        hasMore={hasMore}
      />
    </div>
  );
}

