import { Metadata } from "next";

import { loadMoreCatalogueMovies } from "@/app/movies/actions";
import { FilterableMediaGallery } from "@/components/filters/filterable-media-gallery";
import { getMovieCategory, getMovieGenres } from "@/lib/tmdb";
import { mapMovieSummary } from "@/lib/mappers";

export const metadata: Metadata = {
  title: "Movies",
  description:
    "Browse top rated, popular, and upcoming films curated from TMDB. Discover the best movies, filter by genre, and add favorites to your watchlist.",
  keywords: [
    "movies",
    "films",
    "cinema",
    "movie database",
    "popular movies",
    "top rated movies",
    "upcoming movies",
    "movie ratings",
  ],
  alternates: {
    canonical: "https://elemescinema.vercel.app/movies",
  },
};

export const dynamic = "force-dynamic";

export default async function MoviesPage() {
  const [popular, topRated, upcoming, movieGenres] = await Promise.all([
    getMovieCategory("popular"),
    getMovieCategory("top_rated"),
    getMovieCategory("upcoming"),
    getMovieGenres(),
  ]);

  const aggregatedItems = dedupeMediaItems([
    ...popular.results.map(mapMovieSummary),
    ...topRated.results.map(mapMovieSummary),
    ...upcoming.results.map(mapMovieSummary),
  ]);

  const catalogueHasMore = popular.total_pages > 1;

  return (
    <div className="space-y-14" aria-labelledby="movies-heading">
      <header className="space-y-3">
        <h1 id="movies-heading" className="text-4xl font-bold text-foreground">
          Movies
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          An ever-updating catalogue of cinema. Filter by what&apos;s trending,
          award-winning, or arriving soon—and add favorites to your watchlist.
        </p>
      </header>

      <FilterableMediaGallery
        title="Browse Catalogue"
        description="Use the filters on the left to refine movies by release date, genre, and sort order."
        genres={movieGenres?.genres ?? []}
        initialItems={aggregatedItems}
        mediaType="movie"
        initialHasMore={catalogueHasMore}
        loadMore={loadMoreCatalogueMovies}
      />
    </div>
  );
}

function dedupeMediaItems(items: ReturnType<typeof mapMovieSummary>[]) {
  const map = new Map<number, ReturnType<typeof mapMovieSummary>>();
  items.forEach((item) => {
    map.set(item.id, item);
  });
  return Array.from(map.values());
}

