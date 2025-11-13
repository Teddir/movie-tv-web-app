const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";

type ValidImageSize =
  | "w92"
  | "w154"
  | "w185"
  | "w342"
  | "w500"
  | "w780"
  | "original";

export type MediaType = "movie" | "tv" | "person";

export interface TmdbListResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface MovieSummary {
  name: string;
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
}

export interface TvSummary {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  origin_country: string[];
  genre_ids: number[];
}

export interface PersonSummary {
  id: number;
  name: string;
  known_for_department: string;
  profile_path: string | null;
  popularity: number;
  gender: number;
  known_for: Array<MovieSummary | TvSummary>;
}

export type MultiSearchResult =
  | (MovieSummary & { media_type: "movie" })
  | (TvSummary & { media_type: "tv" })
  | (PersonSummary & { media_type: "person" });

export interface PersonCombinedCredit {
  id: number;
  media_type: "movie" | "tv";
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  release_date?: string | null;
  first_air_date?: string | null;
  character?: string;
  job?: string;
  department?: string;
}

export interface PersonDetails {
  id: number;
  name: string;
  known_for_department: string;
  profile_path: string | null;
  popularity: number;
  gender: number;
  adult: boolean;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  also_known_as: string[];
  homepage: string | null;
  imdb_id: string | null;
  combined_credits: {
    cast: PersonCombinedCredit[];
    crew: PersonCombinedCredit[];
  };
  external_ids?: {
    imdb_id?: string | null;
    twitter_id?: string | null;
    instagram_id?: string | null;
    facebook_id?: string | null;
  };
  images?: {
    profiles: Array<{
      file_path: string;
      height: number;
      width: number;
      aspect_ratio: number;
    }>;
  };
}

export interface Genre {
  id: number;
  name: string;
}

export interface GenresResponse {
  genres: Genre[];
}

export interface VideoResult {
  id: string;
  name: string;
  key: string;
  site: "YouTube" | "Vimeo" | string;
  type: string;
  official: boolean;
  size: number;
  published_at: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  credit_id: string;
}

export interface CrewMember {
  id: number;
  name: string;
  department: string;
  job: string;
  profile_path: string | null;
}

export interface CreditsResponse {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface MovieDetails extends MovieSummary {
  tagline: string;
  runtime: number | null;
  status: string;
  genres: Genre[];
  budget: number;
  revenue: number;
  homepage: string | null;
  videos: { results: VideoResult[] };
  credits: CreditsResponse;
  recommendations: TmdbListResponse<MovieSummary>;
}

export interface TvDetails extends TvSummary {
  tagline: string;
  status: string;
  episode_run_time: number[];
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: Array<{
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
    air_date: string | null;
    poster_path: string | null;
  }>;
  genres: Genre[];
  videos: { results: VideoResult[] };
  credits: CreditsResponse;
  recommendations: TmdbListResponse<TvSummary>;
  created_by: Array<{ id: number; name: string; profile_path: string | null }>;
  homepage: string | null;
}

interface FetchOptions {
  query?: Record<string, string | number | undefined>;
  revalidate?: number;
  cache?: RequestCache;
}

function buildUrl(path: string, query?: Record<string, string | number | undefined>) {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url;
}

function getAuthHeaders(url: URL) {
  const headers: HeadersInit = {
    accept: "application/json",
  };

  const accessToken = process.env.TMDB_ACCESS_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  } else if (apiKey) {
    url.searchParams.set("api_key", apiKey);
  } else {
    throw new Error(
      "Missing TMDB credentials. Set TMDB_ACCESS_TOKEN (v4 auth) or TMDB_API_KEY (v3 auth) in your environment.",
    );
  }

  return headers;
}

export async function tmdbFetch<T>(
  path: string,
  { query, revalidate = 1800, cache }: FetchOptions = {},
): Promise<T> {
  const url = buildUrl(path, query);
  const headers = getAuthHeaders(url);

  const response = await fetch(url, {
    headers,
    cache,
    next: revalidate ? { revalidate } : undefined,
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function getMovieCategory(
  category: "popular" | "now_playing" | "top_rated" | "upcoming",
  page = 1,
) {
  const revalidate =
    category === "now_playing" || category === "upcoming" ? 600 : 3600;
  return tmdbFetch<TmdbListResponse<MovieSummary>>(`/movie/${category}`, {
    query: { page, language: "en-US" },
    revalidate,
  });
}

export async function getTvCategory(category: "popular" | "top_rated" | "on_the_air" | "airing_today", page = 1) {
  const revalidate = category === "airing_today" ? 300 : 2700;
  return tmdbFetch<TmdbListResponse<TvSummary>>(`/tv/${category}`, {
    query: { page, language: "en-US" },
    revalidate,
  });
}

export async function getPopularPeople(page = 1) {
  return tmdbFetch<TmdbListResponse<PersonSummary>>("/person/popular", {
    query: { page, language: "en-US" },
    revalidate: 900,
  });
}

export async function searchMulti(query: string, page = 1) {
  if (!query) {
    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    } satisfies TmdbListResponse<MultiSearchResult>;
  }

  const results = await tmdbFetch<TmdbListResponse<MultiSearchResult>>(
    "/search/multi",
    {
      query: {
        query,
        include_adult: "false",
        language: "en-US",
        page,
      },
      cache: "no-store",
      revalidate: 0,
    },
  );

  results.results = results.results.filter((item) =>
    ["movie", "tv", "person"].includes(item.media_type),
  ) as MultiSearchResult[];
  return results;
}

export async function getMovieGenres() {
  return tmdbFetch<GenresResponse>("/genre/movie/list", {
    query: { language: "en-US" },
    revalidate: 43200,
  });
}

export async function getTvGenres() {
  return tmdbFetch<GenresResponse>("/genre/tv/list", {
    query: { language: "en-US" },
    revalidate: 43200,
  });
}

export async function getMovieDetails(id: string | number) {
  try {
    return await tmdbFetch<MovieDetails>(`/movie/${id}`, {
      query: {
        language: "en-US",
        append_to_response: "videos,credits,recommendations",
      },
      revalidate: 600,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return null;
    }
    throw error;
  }
}

export async function getTvDetails(id: string | number) {
  try {
    return await tmdbFetch<TvDetails>(`/tv/${id}`, {
      query: {
        language: "en-US",
        append_to_response: "videos,credits,recommendations",
      },
      revalidate: 600,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return null;
    }
    throw error;
  }
}

export async function getPersonDetails(id: string | number) {
  try {
    return await tmdbFetch<PersonDetails>(`/person/${id}`, {
      query: {
        language: "en-US",
        append_to_response: "combined_credits,external_ids,images",
      },
      revalidate: 900,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return null;
    }
    throw error;
  }
}

export function getImageUrl(path: string | null | undefined, size: ValidImageSize = "w500") {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}${size}${path}`;
}

export function getProfileUrl(path: string | null | undefined, size: ValidImageSize = "w342") {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}${size}${path}`;
}

export function getBackdropUrl(path: string | null | undefined, size: ValidImageSize = "w780") {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}${size}${path}`;
}

