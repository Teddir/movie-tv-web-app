import { Metadata } from "next";

import { FilterableMediaGallery } from "@/components/filters/filterable-media-gallery";
import { getTvCategory, getTvGenres } from "@/lib/tmdb";
import { mapTvSummary } from "@/lib/mappers";
import { TvCategorySection } from "@/app/tv/category-section";
import { loadMoreCatalogueTv } from "@/app/tv/actions";

export const metadata: Metadata = {
  title: "TV",
  description:
    "Discover the latest, most popular, and top-rated television series sourced from TMDB.",
};

export const revalidate = 600;

type TvPageProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

const categoryKeys = [
  "catalogue",
  "airing-today",
  "on-the-air",
  "popular",
  "top-rated",
] as const;

const copy: Record<
  (typeof categoryKeys)[number],
  { title: string; description: string }
> = {
  catalogue: {
    title: "Browse Catalogue",
    description:
      "Explore by genre, release era, and popularity to find your next binge-worthy series.",
  },
  "airing-today": {
    title: "Airing Today",
    description: "Catch episodes broadcast within the next 24 hours.",
  },
  "on-the-air": {
    title: "Currently On Air",
    description: "Shows mid-season and releasing new episodes right now.",
  },
  popular: {
    title: "Popular",
    description: "Series trending with audiences around the globe.",
  },
  "top-rated": {
    title: "Top Rated",
    description: "Critically acclaimed television that keeps viewers hooked.",
  },
};

export default async function TvPage({ searchParams }: TvPageProps) {
  const [{ category }] = await Promise.all([searchParams]);
  const categoryParam = Array.isArray(category) ? category[0] : category;
  const activeCategory = categoryKeys.includes(
    (categoryParam ?? "catalogue") as (typeof categoryKeys)[number],
  )
    ? ((categoryParam ?? "catalogue") as (typeof categoryKeys)[number])
    : "catalogue";

  const [airingToday, onTheAir, popular, topRated, tvGenres] = await Promise.all([
    getTvCategory("airing_today"),
    getTvCategory("on_the_air"),
    getTvCategory("popular"),
    getTvCategory("top_rated"),
    getTvGenres(),
  ]);

  const transform = (collection: Awaited<ReturnType<typeof getTvCategory>>) =>
    collection.results.map((show) => mapTvSummary(show));

  const collections = {
    "airing-today": transform(airingToday),
    "on-the-air": transform(onTheAir),
    popular: transform(popular),
    "top-rated": transform(topRated),
  } as const;
  const totals = {
    "airing-today": airingToday.total_pages,
    "on-the-air": onTheAir.total_pages,
    popular: popular.total_pages,
    "top-rated": topRated.total_pages,
  } as const;

  const aggregatedItems = Array.from(
    new Map(
      [
        ...collections["airing-today"],
        ...collections["on-the-air"],
        ...collections.popular,
        ...collections["top-rated"],
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
    <div className="space-y-14" aria-labelledby="tv-heading">
      <header className="space-y-3">
        <h1 id="tv-heading" className="text-4xl font-bold text-foreground">
          TV Shows
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          From returning seasons to tonight&apos;s premieres, explore the television stories
          keeping audiences hooked. Add standouts to your watchlist or track your ratings
          season-over-season.
        </p>
      </header>

      {isCatalogue ? (
        <FilterableMediaGallery
          title={copy.catalogue.title}
          description={copy.catalogue.description}
          genres={tvGenres?.genres ?? []}
          initialItems={aggregatedItems}
          mediaType="tv"
          initialHasMore={catalogueHasMore}
          loadMore={loadMoreCatalogueTv}
        />
      ) : (
        <TvCategorySection
          title={copy[activeCategory].title}
          description={copy[activeCategory].description}
          initialItems={initialCategoryItems}
          category={apiCategory}
          hasMore={hasMore}
        />
      )}
    </div>
  );
}

