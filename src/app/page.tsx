import Image from "next/image";
import Link from "next/link";

import {
  getBackdropUrl,
  getImageUrl,
  getMovieCategory,
  getPopularPeople,
  getTvCategory,
} from "@/lib/tmdb";
import { formatDate, formatScore } from "@/lib/utils";
import { MediaShelf } from "@/components/sections/media-shelf";
import { PersonCard } from "@/components/person-card";
import { Button } from "@/components/ui/button";

export const revalidate = 900;

export default async function HomePage() {
  const [
    nowPlayingMovies,
    popularMovies,
    topRatedMovies,
    upcomingMovies,
    popularTvShows,
    topRatedTvShows,
    popularPeople,
  ] = await Promise.all([
    getMovieCategory("now_playing"),
    getMovieCategory("popular"),
    getMovieCategory("top_rated"),
    getMovieCategory("upcoming"),
    getTvCategory("popular"),
    getTvCategory("top_rated"),
    getPopularPeople(),
  ]);

  const heroMovie = nowPlayingMovies.results[0] ?? popularMovies.results[0];
  const heroBackdrop = getBackdropUrl(heroMovie?.backdrop_path, "w780");

  const mapMovies = (collection: typeof popularMovies) =>
    collection.results.slice(0, 10).map((movie) => ({
      id: movie.id,
      title: movie.title,
      mediaType: "movie" as const,
      overview: movie.overview,
      posterUrl: getImageUrl(movie.poster_path, "w500"),
      score: movie.vote_average,
      releaseDate: movie.release_date,
      href: `/movies/${movie.id}`,
    }));

  const mapTv = (collection: typeof popularTvShows) =>
    collection.results.slice(0, 10).map((show) => ({
      id: show.id,
      title: show.name,
      mediaType: "tv" as const,
      overview: show.overview,
      posterUrl: getImageUrl(show.poster_path, "w500"),
      score: show.vote_average,
      releaseDate: show.first_air_date,
      supplementaryLabel: show.origin_country?.[0],
      href: `/tv/${show.id}`,
    }));

  return (
    <div className="space-y-16">
      <section
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/70 p-8 text-white shadow-2xl"
        aria-labelledby="hero-heading"
      >
        {heroBackdrop ? (
          <Image
            src={heroBackdrop}
            alt={`${heroMovie?.title ?? heroMovie?.name ?? "Feature"} backdrop`}
            fill
            className="absolute inset-0 -z-10 h-full w-full object-cover"
            sizes="(max-width: 768px) 100vw, 75vw"
            priority
          />
        ) : null}
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-black/80 via-black/60 to-black/80" />
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-primary">
              Featured
            </p>
            <h1
              id="hero-heading"
              className="text-4xl font-bold tracking-tight sm:text-5xl text-primary"
            >
              {heroMovie?.title ?? heroMovie?.name ?? "Discover cinematic gems"}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground/90">
              {heroMovie?.release_date ? (
                <span>{formatDate(heroMovie.release_date)}</span>
              ) : null}
              {heroMovie?.vote_average ? (
                <span>TMDB {formatScore(heroMovie.vote_average)}</span>
              ) : null}
              {heroMovie?.genre_ids?.length ? (
                <span>
                  Genres&nbsp;
                  {heroMovie.genre_ids.slice(0, 3).join(" / ")}
                </span>
              ) : null}
            </div>
            <p className="max-w-xl text-base text-muted-foreground/90">
              {heroMovie?.overview ??
                "Streamlined discovery of top-rated, trending, and upcoming releases across film and television."}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="rounded-full bg-primary px-6 py-2 text-primary-foreground shadow-lg hover:bg-primary/90"
                asChild
              >
                <Link href="/movies" className="text-primary-foreground">Browse Movies</Link>
              </Button>
              {heroMovie ? (
                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-full border border-white/20 bg-white/10 px-6 py-2 text-gray-600"
                  asChild
                >
                  <Link
                    href={`/movies/${heroMovie.id}`}
                  >
                    View details
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
          {heroMovie?.poster_path ? (
            <div className="relative hidden h-64 w-48 overflow-hidden rounded-2xl border border-white/20 shadow-2xl md:block">
              <Image
                src={getImageUrl(heroMovie.poster_path, "w342") ?? ""}
                alt={`${heroMovie.title} poster`}
                fill
                className="object-cover"
                sizes="192px"
              />
            </div>
          ) : null}
        </div>
      </section>

      <MediaShelf
        title="Now Playing"
        subtitle="Fresh in theaters right now"
        ctaHref="/movies/now-playing"
        items={mapMovies(nowPlayingMovies)}
      />

      <MediaShelf
        title="Top Rated Movies"
        subtitle="Critically acclaimed stories worth your time"
        ctaHref="/movies/top-rated"
        items={mapMovies(topRatedMovies)}
      />

      <MediaShelf
        title="Popular on TV"
        subtitle="Series everyone is talking about"
        ctaHref="/tv"
        items={mapTv(popularTvShows)}
      />

      <MediaShelf
        title="Top Rated TV"
        subtitle="Fan favorites delivering every season"
        ctaHref="/tv/top-rated"
        items={mapTv(topRatedTvShows)}
      />

      <MediaShelf
        title="Upcoming Movies"
        subtitle="Add these to your watchlist before they drop"
        ctaHref="/movies/upcoming"
        items={mapMovies(upcomingMovies)}
      />

      <section
        className="space-y-6"
        aria-labelledby="popular-people-heading"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="popular-people-heading" className="text-2xl font-semibold sm:text-3xl">
              Popular People
            </h2>
            <p className="text-sm text-muted-foreground">
              The talent driving today&apos;s stories
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/people">Explore all</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {popularPeople.results.slice(0, 8).map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      </section>
    </div>
  );
}
