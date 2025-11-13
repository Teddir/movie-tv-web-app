import { Metadata } from "next";

import { TvCategorySection } from "@/app/tv/category-section";
import { getTvCategory } from "@/lib/tmdb";
import { mapTvSummary } from "@/lib/mappers";

export const metadata: Metadata = {
  title: "Popular TV",
  description:
    "Series trending with audiences worldwide, updated in real time from TMDB.",
};

export default async function PopularTvPage() {
  const popular = await getTvCategory("popular", 1);
  const items = popular.results.map(mapTvSummary);
  const hasMore = popular.page < popular.total_pages;

  return (
    <div className="space-y-14" aria-labelledby="popular-tv-heading">
      <TvCategorySection
        title="Popular TV"
        description="See what viewers everywhere are watching right now."
        initialItems={items}
        category="popular"
        hasMore={hasMore}
      />
    </div>
  );
}

