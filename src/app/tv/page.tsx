import { Metadata } from "next";

import { FilterableMediaGallery } from "@/components/filters/filterable-media-gallery";
import { loadMoreCatalogueTv } from "@/app/tv/actions";
import { getTvCategory, getTvGenres } from "@/lib/tmdb";
import { mapTvSummary } from "@/lib/mappers";

export const metadata: Metadata = {
  title: "TV Shows",
  description:
    "Browse popular and top rated series curated from TMDB.",
};

export const dynamic = "force-dynamic";

export default async function TvPage() {
  const [popular, tvGenres] = await Promise.all([
    getTvCategory("popular"),
    getTvGenres(),
  ]);

  const aggregatedItems = dedupeShows([
    ...popular.results.map(mapTvSummary),
  ]);

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

      <FilterableMediaGallery
        title="Browse Catalogue"
        description="Explore by genre, release era, and popularity to find your next binge-worthy series."
        genres={tvGenres?.genres ?? []}
        initialItems={aggregatedItems}
        mediaType="tv"
        initialHasMore={catalogueHasMore}
        loadMore={loadMoreCatalogueTv}
      />
    </div>
  );
}

function dedupeShows(items: ReturnType<typeof mapTvSummary>[]) {
  const map = new Map<number, ReturnType<typeof mapTvSummary>>();
  items.forEach((item) => {
    map.set(item.id, item);
  });
  return Array.from(map.values());
}

