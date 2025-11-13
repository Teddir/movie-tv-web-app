"use server";

import { getMovieCategory } from "@/lib/tmdb";
import { mapMovieSummary } from "@/lib/mappers";
import type { FilterableMediaItem } from "@/types/media";

const categorySlugMap = {
  "now-playing": "now_playing",
  popular: "popular",
  "top-rated": "top_rated",
  upcoming: "upcoming",
} as const;

export async function loadMoreMovies(
  category: keyof typeof categorySlugMap,
  nextPage: number,
): Promise<{ items: FilterableMediaItem[]; hasMore: boolean }> {
  const slug = categorySlugMap[category];
  if (!slug) {
    throw new Error(`Unsupported movie category: ${category}`);
  }

  const response = await getMovieCategory(slug, nextPage);
  const items = response.results.map((movie) => mapMovieSummary(movie));
  return {
    items,
    hasMore: nextPage < response.total_pages,
  };
}

export async function loadMoreCatalogueMovies(
  nextPage: number,
): Promise<{ items: FilterableMediaItem[]; hasMore: boolean }> {
  const response = await getMovieCategory("popular", nextPage);
  const items = response.results.map((movie) => mapMovieSummary(movie));
  return {
    items,
    hasMore: nextPage < response.total_pages,
  };
}

