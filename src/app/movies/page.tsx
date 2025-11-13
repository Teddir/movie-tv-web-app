import { Metadata } from "next";

import { loadMoreCatalogueMovies } from "@/app/movies/actions";
import { getMovieCategory, getMovieGenres } from "@/lib/tmdb";
import { FilterableMediaGallery } from "@/components/filters/filterable-media-gallery";
import { mapMovieSummary } from "@/lib/mappers";
import { MovieCategorySection } from "@/app/movies/category-section";

export const metadata: Metadata = {
  title: "Movies",
  description:
    "Browse top rated, popular, upcoming, and now playing movies curated from TMDB.",
};

export const dynamic = "force-dynamic";

type MoviesPageProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

const categoryKeys = [
  "catalogue",
  "now-playing",
  "popular",
  "top-rated",
  "upcoming",
] as const;

const categoryCopy: Record<
  (typeof categoryKeys)[number],
  { title: string; description: string }
> = {
  catalogue: {
    title: "Browse Catalogue",
    description:
      "Use the filters on the left to refine movies by release date, genre, and sort order.",
  },
  "now-playing": {
    title: "Now Playing",
    description: "In theaters and ready for the big screen experience.",
  },
  popular: {
    title: "Popular",
    description: "Currently captivating audiences worldwide.",
  },
  "top-rated": {
    title: "Top Rated",
    description: "Critical darlings and community favorites.",
  },
  upcoming: {
    title: "Upcoming",
    description: "Save these titles before they hit theaters.",
  },
};

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const [{ category }] = await Promise.all([searchParams]);
  const categoryParam = Array.isArray(category) ? category[0] : category;
  const activeCategory = categoryKeys.includes(
    (categoryParam ?? "catalogue") as (typeof categoryKeys)[number],
  )
    ? ((categoryParam ?? "catalogue") as (typeof categoryKeys)[number])
    : "catalogue";

  const [nowPlaying, popular, topRated, upcoming, movieGenres] =
    await Promise.all([
      getMovieCategory("now_playing"),
      getMovieCategory("popular"),
      getMovieCategory("top_rated"),
      getMovieCategory("upcoming"),
      getMovieGenres(),
    ]);

  const transform = (collection: Awaited<ReturnType<typeof getMovieCategory>>) =>
    collection.results.map((movie) => mapMovieSummary(movie));

  const collections = {
    "now-playing": transform(nowPlaying),
    popular: transform(popular),
    "top-rated": transform(topRated),
    upcoming: transform(upcoming),
  } as const;
  const totals = {
    "now-playing": nowPlaying.total_pages,
    popular: popular.total_pages,
    "top-rated": topRated.total_pages,
    upcoming: upcoming.total_pages,
  } as const;

  const aggregatedItems = Array.from(
    new Map(
      [
        ...collections["now-playing"],
        ...collections.popular,
        ...collections["top-rated"],
        ...collections.upcoming,
      ].map((item) => [item.id, item]),
    ).values(),
  );

  const isCatalogue = activeCategory === "catalogue";
  const apiCategory = isCatalogue
    ? null
    : (activeCategory as Exclude<(typeof categoryKeys)[number], "catalogue">);
  const initialCategoryItems = apiCategory ? collections[apiCategory] : [];
  const hasMore = apiCategory ? totals[apiCategory] > 1 : false;
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

      {isCatalogue ? (
        <FilterableMediaGallery
          title={categoryCopy.catalogue.title}
          description={categoryCopy.catalogue.description}
          genres={movieGenres?.genres ?? []}
          initialItems={aggregatedItems}
          mediaType="movie"
          initialHasMore={catalogueHasMore}
          loadMore={loadMoreCatalogueMovies}
        />
      ) : (
        <MovieCategorySection
          title={categoryCopy[activeCategory].title}
          description={categoryCopy[activeCategory].description}
          initialItems={initialCategoryItems}
          category={apiCategory}
          hasMore={hasMore}
        />
      )}
    </div>
  );
}

