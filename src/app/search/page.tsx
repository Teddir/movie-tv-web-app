import Link from "next/link";
import type { ComponentProps } from "react";
import type { Metadata } from "next";

import { searchMulti, getImageUrl, type MultiSearchResult } from "@/lib/tmdb";
import { MediaCard } from "@/components/media-card";
import { PersonCard } from "@/components/person-card";
import { Badge } from "@/components/ui/badge";

interface SearchPageProps {
  searchParams: {
    q?: string | string[];
    page?: string | string[];
  };
}

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search movies, TV shows, and people by keyword. Find your favorite titles, actors, and directors on ElemesCinema.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://elemescinema.vercel.app/search",
  },
};

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page } = await searchParams;
  const query = Array.isArray(q) ? q[0] : q;
  const pageNumber = Number(Array.isArray(page) ? page[0] : page) || 1;

  if (!query) {
    return (
      <div className="space-y-8" aria-labelledby="search-heading">
        <header className="space-y-3">
          <h1 id="search-heading" className="text-4xl font-bold text-foreground">
            Search
          </h1>
          <p className="text-base text-muted-foreground">
            Start typing above to discover movies, TV shows, or people. Your results will appear here.
          </p>
        </header>
        <EmptyState message="Try searching for your favorite titles, genres, or actors." />
      </div>
    );
  }

  const results = await searchMulti(query, pageNumber);
  const movies = results.results.filter(
    (item): item is Extract<MultiSearchResult, { media_type: "movie" }> =>
      item.media_type === "movie",
  );
  const shows = results.results.filter(
    (item): item is Extract<MultiSearchResult, { media_type: "tv" }> =>
      item.media_type === "tv",
  );
  const people = results.results.filter(
    (item): item is Extract<MultiSearchResult, { media_type: "person" }> =>
      item.media_type === "person",
  );

  const hasResults = movies.length + shows.length + people.length > 0;

  const recommendations = {
    movies: movies.slice(0, 4).map((movie) => ({
      id: movie.id,
      title: movie.title,
      subtitle: movie.release_date
        ? new Date(movie.release_date).getFullYear().toString()
        : "",
      href: `/movies/${movie.id}`,
    })),
    shows: shows.slice(0, 4).map((show) => ({
      id: show.id,
      title: show.name,
      subtitle: show.first_air_date
        ? new Date(show.first_air_date).getFullYear().toString()
        : show.origin_country?.join(" • ") ?? "",
      href: `/tv/${show.id}`,
    })),
    people: people.slice(0, 4).map((person) => ({
      id: person.id,
      title: person.name,
      subtitle: person.known_for_department ?? "",
      href: `/people`,
    })),
  };

  return (
    <div className="space-y-10" aria-labelledby="search-heading">
      <header className="space-y-3">
        <h1 id="search-heading" className="text-4xl font-bold text-foreground">
          Results for “{query}”
        </h1>
        <p className="text-base text-muted-foreground">
          Showing {results.total_results} matches across movies, TV shows, and people.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{movies.length} Movies</Badge>
          <Badge variant="secondary">{shows.length} TV Shows</Badge>
          <Badge variant="secondary">{people.length} People</Badge>
        </div>
      </header>

      {hasResults ? (
        <SearchRecommendations recommendations={recommendations} />
      ) : null}

      {hasResults ? (
        <div className="space-y-12">
          {movies.length ? (
            <SearchSection
              id="movie-results"
              title="Movies"
              items={movies.map((movie) => ({
                id: movie.id,
                title: movie.title,
                mediaType: "movie" as const,
                overview: movie.overview,
                posterUrl: getImageUrl(movie.poster_path, "w500"),
                score: movie.vote_average,
                releaseDate: movie.release_date,
                href: `/movies/${movie.id}`,
              }))}
            />
          ) : null}

          {shows.length ? (
            <SearchSection
              id="tv-results"
              title="TV Shows"
              items={shows.map((show) => ({
                id: show.id,
                title: show.name,
                mediaType: "tv" as const,
                overview: show.overview,
                posterUrl: getImageUrl(show.poster_path, "w500"),
                score: show.vote_average,
                releaseDate: show.first_air_date,
                supplementaryLabel: show.origin_country?.join(" • "),
                href: `/tv/${show.id}`,
              }))}
            />
          ) : null}

          {people.length ? (
            <section
              id="people-results"
              aria-labelledby="people-results-heading"
              className="space-y-4"
            >
              <div>
                <h2 id="people-results-heading" className="text-2xl font-semibold text-foreground">
                  People
                </h2>
                <p className="text-sm text-muted-foreground">
                  Actors, directors, and crew members matching your search.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {people.map((person) => (
                  <PersonCard key={person.id} person={person} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <EmptyState message="We couldn’t find anything matching your search. Try another keyword." />
      )}
    </div>
  );
}

function SearchRecommendations({
  recommendations,
}: {
  recommendations: {
    movies: Array<{ id: number; title: string; subtitle?: string; href: string }>;
    shows: Array<{ id: number; title: string; subtitle?: string; href: string }>;
    people: Array<{ id: number; title: string; subtitle?: string; href: string }>;
  };
}) {
  const groups = [
    { label: "Movies", items: recommendations.movies },
    { label: "TV Shows", items: recommendations.shows },
    { label: "People", items: recommendations.people },
  ];

  const hasAny = groups.some((group) => group.items.length > 0);
  if (!hasAny) return null;

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-card/60 p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Quick picks</h2>
        <p className="text-sm text-muted-foreground">
          Top matches across movies, series, and people.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {groups.map((group) =>
          group.items.length ? (
            <div key={group.label} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={`${group.label}-${item.id}`}>
                    <Link
                      href={item.href}
                      className="flex flex-col rounded-xl px-3 py-2 text-sm transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <span className="font-medium text-foreground">{item.title}</span>
                      {item.subtitle ? (
                        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null,
        )}
      </div>
    </section>
  );
}

interface SearchSectionProps {
  id: string;
  title: string;
  items: ComponentProps<typeof MediaCard>[];
}

function SearchSection({ id, title, items }: SearchSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="space-y-4">
      <div>
        <h2 id={`${id}-heading`} className="text-2xl font-semibold text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">
          {title === "Movies"
            ? "Feature-length films, documentaries, and more."
            : "Series and limited runs worth exploring."}
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <MediaCard key={`${item.mediaType}-${item.id}`} {...item} />
        ))}
      </div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/20 bg-card/40 p-12 text-center">
      <p className="text-lg font-semibold text-muted-foreground">{message}</p>
    </div>
  );
}

