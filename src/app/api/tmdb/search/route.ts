import { NextResponse } from "next/server";

import { searchMulti, getImageUrl, type MultiSearchResult } from "@/lib/tmdb";

const DEFAULT_LIMIT = 6;

function summarizeMovie(movie: Extract<MultiSearchResult, { media_type: "movie" }>) {
  return {
    id: movie.id,
    title: movie.title,
    subtitle: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "",
    href: `/movies/${movie.id}`,
    posterUrl: getImageUrl(movie.poster_path, "w185"),
  };
}

function summarizeTv(show: Extract<MultiSearchResult, { media_type: "tv" }>) {
  return {
    id: show.id,
    title: show.name,
    subtitle: show.first_air_date
      ? new Date(show.first_air_date).getFullYear().toString()
      : show.origin_country?.join(" • ") ?? "",
    href: `/tv/${show.id}`,
    posterUrl: getImageUrl(show.poster_path, "w185"),
  };
}

function summarizePerson(person: Extract<MultiSearchResult, { media_type: "person" }>) {
  return {
    id: person.id,
    title: person.name,
    subtitle: person.known_for_department ?? "",
    href: `/people`,
    posterUrl: getImageUrl(person.profile_path, "w185"),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const limit = Math.max(
    1,
    Math.min(DEFAULT_LIMIT, Number(searchParams.get("limit") ?? DEFAULT_LIMIT)),
  );

  if (!query) {
    return NextResponse.json({
      movies: [],
      shows: [],
      people: [],
    });
  }

  try {
    const results = await searchMulti(query, 1);
    const movies = results.results
      .filter(
        (item): item is Extract<MultiSearchResult, { media_type: "movie" }> =>
          item.media_type === "movie",
      )
      .slice(0, limit)
      .map(summarizeMovie);

    const shows = results.results
      .filter(
        (item): item is Extract<MultiSearchResult, { media_type: "tv" }> =>
          item.media_type === "tv",
      )
      .slice(0, limit)
      .map(summarizeTv);

    const people = results.results
      .filter(
        (item): item is Extract<MultiSearchResult, { media_type: "person" }> =>
          item.media_type === "person",
      )
      .slice(0, limit)
      .map(summarizePerson);

    return NextResponse.json({ movies, shows, people });
  } catch (error) {
    console.warn("Failed to fetch TMDB search suggestions", error);
    return NextResponse.json(
      { error: "Unable to fetch search suggestions" },
      { status: 500 },
    );
  }
}


