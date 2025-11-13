import { Metadata } from "next";

import { TvCategorySection } from "@/app/tv/category-section";
import { getTvCategory } from "@/lib/tmdb";
import { mapTvSummary } from "@/lib/mappers";

export const metadata: Metadata = {
  title: "Airing Today",
  description:
    "Episodes hitting the airwaves within the next 24 hours, tailored for your nightly schedule.",
};

export default async function AiringTodayPage() {
  const airingToday = await getTvCategory("airing_today", 1);
  const items = airingToday.results.map(mapTvSummary);
  const hasMore = airingToday.page < airingToday.total_pages;

  return (
    <div className="space-y-14" aria-labelledby="airing-today-heading">
      <TvCategorySection
        title="Airing Today"
        description="Catch episodes broadcasting in the next 24 hours."
        initialItems={items}
        category="airing-today"
        hasMore={hasMore}
      />
    </div>
  );
}

