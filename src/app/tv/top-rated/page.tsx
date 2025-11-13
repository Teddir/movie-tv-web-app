import { Metadata } from "next";

import { TvCategorySection } from "@/app/tv/category-section";
import { getTvCategory } from "@/lib/tmdb";
import { mapTvSummary } from "@/lib/mappers";

export const metadata: Metadata = {
  title: "Top Rated TV",
  description:
    "Critically acclaimed television that keeps audiences hooked.",
};

export default async function TopRatedTvPage() {
  const topRated = await getTvCategory("top_rated", 1);
  const items = topRated.results.map(mapTvSummary);
  const hasMore = topRated.page < topRated.total_pages;

  return (
    <div className="space-y-14" aria-labelledby="top-rated-tv-heading">
      <TvCategorySection
        title="Top Rated TV"
        description="Critically acclaimed series delivering unforgettable seasons."
        initialItems={items}
        category="top-rated"
        hasMore={hasMore}
      />
    </div>
  );
}

