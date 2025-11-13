"use server";

import { getTvCategory } from "@/lib/tmdb";
import { mapTvSummary } from "@/lib/mappers";
import type { FilterableMediaItem } from "@/types/media";

const categorySlugMap = {
  "airing-today": "airing_today",
  "on-the-air": "on_the_air",
  popular: "popular",
  "top-rated": "top_rated",
} as const;

export async function loadMoreTv(
  category: keyof typeof categorySlugMap,
  nextPage: number,
): Promise<{ items: FilterableMediaItem[]; hasMore: boolean }> {
  const slug = categorySlugMap[category];
  if (!slug) {
    throw new Error(`Unsupported TV category: ${category}`);
  }

  const response = await getTvCategory(slug, nextPage);
  const items = response.results.map((show) => mapTvSummary(show));
  return {
    items,
    hasMore: nextPage < response.total_pages,
  };
}

export async function loadMoreCatalogueTv(
  nextPage: number,
): Promise<{ items: FilterableMediaItem[]; hasMore: boolean }> {
  const response = await getTvCategory("popular", nextPage);
  const items = response.results.map((show) => mapTvSummary(show));
  return {
    items,
    hasMore: nextPage < response.total_pages,
  };
}

