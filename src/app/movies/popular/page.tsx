import { Metadata } from "next";

import { MovieCategorySection } from "@/app/movies/category-section";
import { getMovieCategory } from "@/lib/tmdb";
import { mapMovieSummary } from "@/lib/mappers";

export const metadata: Metadata = {
  title: "Popular Movies",
  description:
    "Currently trending films with high audience engagement from around the world.",
};

export default async function PopularMoviesPage() {
  const popular = await getMovieCategory("popular", 1);
  const items = popular.results.map(mapMovieSummary);
  const hasMore = popular.page < popular.total_pages;

  return (
    <div className="space-y-14" aria-labelledby="popular-movies-heading">
      <MovieCategorySection
        title="Popular Movies"
        description="Films audiences are buzzing about right now."
        initialItems={items}
        category="popular"
        hasMore={hasMore}
      />
    </div>
  );
}

