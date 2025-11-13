import {
  getImageUrl,
  type MovieSummary,
  type TvSummary,
} from "@/lib/tmdb";
import type { FilterableMediaItem } from "@/types/media";

export function mapMovieSummary(movie: MovieSummary): FilterableMediaItem {
  return {
    id: movie.id,
    title: movie.title || movie.name || "",
    mediaType: "movie",
    overview: movie.overview,
    posterUrl: getImageUrl(movie.poster_path, "w500"),
    score: movie.vote_average,
    releaseDate: movie.release_date,
    href: `/movies/${movie.id}`,
    genreIds: movie.genre_ids ?? [],
    popularity: movie.popularity ?? 0,
  };
}

export function mapTvSummary(show: TvSummary): FilterableMediaItem {
  return {
    id: show.id,
    title: show.name,
    mediaType: "tv",
    overview: show.overview,
    posterUrl: getImageUrl(show.poster_path, "w500"),
    score: show.vote_average,
    releaseDate: show.first_air_date,
    supplementaryLabel: show.origin_country?.join(" • "),
    href: `/tv/${show.id}`,
    genreIds: show.genre_ids ?? [],
    popularity: show.popularity ?? 0,
  };
}

