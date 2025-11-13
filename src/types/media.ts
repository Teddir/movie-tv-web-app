export interface MediaListItem {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  overview?: string | null;
  posterUrl?: string | null;
  score?: number | null;
  releaseDate?: string | null;
  supplementaryLabel?: string | null;
  href?: string;
}

export interface FilterableMediaItem extends MediaListItem {
  genreIds: number[];
  popularity: number;
}

