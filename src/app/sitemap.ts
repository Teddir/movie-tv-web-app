import type { MetadataRoute } from "next";
import { getMovieCategory, getTvCategory, getPopularPeople } from "@/lib/tmdb";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://elemescinema.vercel.app";
  const now = new Date();

  // Fetch popular content (limit to first 2 pages to keep sitemap manageable)
  const [popularMovies, topRatedMovies, popularTv, topRatedTv, popularPeople] =
    await Promise.all([
      getMovieCategory("popular", 1),
      getMovieCategory("top_rated", 1),
      getTvCategory("popular", 1),
      getTvCategory("top_rated", 1),
      getPopularPeople(1),
    ]);

  // Combine and deduplicate movies
  const movieIds = new Set<number>();
  const movies = [
    ...popularMovies.results.slice(0, 50),
    ...topRatedMovies.results.slice(0, 50),
  ]
    .filter((movie) => {
      if (movieIds.has(movie.id)) return false;
      movieIds.add(movie.id);
      return true;
    })
    .map((movie) => ({
      url: `${baseUrl}/movies/${movie.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  // Combine and deduplicate TV shows
  const tvIds = new Set<number>();
  const tvShows = [
    ...popularTv.results.slice(0, 50),
    ...topRatedTv.results.slice(0, 50),
  ]
    .filter((show) => {
      if (tvIds.has(show.id)) return false;
      tvIds.add(show.id);
      return true;
    })
    .map((show) => ({
      url: `${baseUrl}/tv/${show.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  // Get popular people
  const people = popularPeople.results.slice(0, 100).map((person) => ({
    url: `${baseUrl}/people/${person.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/movies`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tv`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/people`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...movies,
    ...tvShows,
    ...people,
  ];
}

