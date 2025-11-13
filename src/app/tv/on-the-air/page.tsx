import { Metadata } from "next";

import { TvCategorySection } from "@/app/tv/category-section";
import { getTvCategory } from "@/lib/tmdb";
import { mapTvSummary } from "@/lib/mappers";

export const metadata: Metadata = {
  title: "Currently On Air",
  description:
    "Series mid-season and actively releasing new episodes, refreshed from TMDB.",
};

export default async function OnTheAirPage() {
  const onTheAir = await getTvCategory("on_the_air", 1);
  const items = onTheAir.results.map(mapTvSummary);
  const hasMore = onTheAir.page < onTheAir.total_pages;

  return (
    <div className="space-y-14" aria-labelledby="on-the-air-heading">
      <TvCategorySection
        title="Currently On Air"
        description="Stay on track with shows actively releasing episodes."
        initialItems={items}
        category="on-the-air"
        hasMore={hasMore}
      />
    </div>
  );
}

