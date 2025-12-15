import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import { MovieCategorySection } from "@/app/movies/category-section";
import {
  getBackdropUrl,
  getImageUrl,
  getMovieCategory,
  getMovieDetails,
  getProfileUrl,
} from "@/lib/tmdb";
import { mapMovieSummary } from "@/lib/mappers";
import { formatDate, formatRuntime, formatScore } from "@/lib/utils";
import { MediaInteractions } from "@/components/media-interactions";
import { MediaShelf } from "@/components/sections/media-shelf";
import { TrailerDialog } from "@/components/trailer-dialog";
import { Badge } from "@/components/ui/badge";
import { MovieStructuredData } from "@/components/seo/structured-data";
import { AdWrapper } from "@/components/ads/ad-wrapper";

interface MovieDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: MovieDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovieDetails(id);
  if (!movie) {
    return {
      title: "Movie not found",
    };
  }

  const baseUrl = "https://elemescinema.vercel.app";
  const movieUrl = `${baseUrl}/movies/${id}`;
  const posterUrl = getImageUrl(movie.poster_path, "w500");
  const backdropUrl = getBackdropUrl(movie.backdrop_path, "original");

  return {
    title: movie.title,
    description: movie.overview || `${movie.title} - Movie details, cast, and ratings on ElemesCinema`,
    keywords: [
      movie.title,
      ...(movie.genres?.map((g) => g.name) || []),
      "movie",
      "film",
      "cinema",
      "entertainment",
    ],
    openGraph: {
      title: movie.title,
      description: movie.overview || `${movie.title} - Movie details and information`,
      type: "video.movie",
      url: movieUrl,
      siteName: "ElemesCinema",
      images: backdropUrl
        ? [
            {
              url: backdropUrl,
              width: 1280,
              height: 720,
              alt: `${movie.title} backdrop`,
            },
          ]
        : posterUrl
          ? [
              {
                url: posterUrl,
                width: 500,
                height: 750,
                alt: `${movie.title} poster`,
              },
            ]
          : undefined,
      ...(movie.release_date && {
        releaseDate: movie.release_date,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: movie.title,
      description: movie.overview || `${movie.title} - Movie details and information`,
      images: backdropUrl ? [backdropUrl] : posterUrl ? [posterUrl] : undefined,
    },
    alternates: {
      canonical: movieUrl,
    },
  };
}

const specialMovieCategories = {
  "now-playing": {
    apiCategory: "now_playing",
    title: "Now Playing",
    description: "The latest cinematic releases, curated from TMDB.",
  },
  popular: {
    apiCategory: "popular",
    title: "Popular Movies",
    description: "Films audiences are buzzing about right now.",
  },
  "top-rated": {
    apiCategory: "top_rated",
    title: "Top Rated",
    description: "Critically acclaimed favorites delivering unforgettable performances.",
  },
  upcoming: {
    apiCategory: "upcoming",
    title: "Upcoming Movies",
    description: "Stay ahead with soon-to-be-released films.",
  },
} as const;

type SpecialMovieCategoryKey = keyof typeof specialMovieCategories;

function isSpecialMovieCategory(id: string): id is SpecialMovieCategoryKey {
  return id in specialMovieCategories;
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  if (isSpecialMovieCategory(id)) {
    const categoryConfig = specialMovieCategories[id];
    const categoryData = await getMovieCategory(categoryConfig.apiCategory, 1);
    const items = categoryData.results.map(mapMovieSummary);
    const hasMore = categoryData.page < categoryData.total_pages;

    return (
      <div className="space-y-16">
        <MovieCategorySection
          title={categoryConfig.title}
          description={categoryConfig.description}
          initialItems={items}
          category={id}
          hasMore={hasMore}
        />
      </div>
    );
  }

  const movie = await getMovieDetails(id);
  if (!movie) {
    return notFound();
  }

  const posterUrl = getImageUrl(movie.poster_path, "w500");
  const backdropUrl = getBackdropUrl(movie.backdrop_path, "w780");
  const releaseDate = formatDate(movie.release_date);
  const runtime = formatRuntime(movie.runtime);
  const genres = movie.genres.map((genre) => genre.name).join(" • ");
  const topCast = movie.credits?.cast?.slice(0, 8) ?? [];
  const recommendations = movie.recommendations?.results?.slice(0, 12) ?? [];

  const baseUrl = "https://elemescinema.vercel.app";
  const movieUrl = `${baseUrl}/movies/${movie.id}`;

  return (
    <>
      <MovieStructuredData movie={movie} url={movieUrl} />
      <div className="space-y-16">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/80 shadow-2xl">
        {backdropUrl ? (
          <Image
            src={backdropUrl}
            alt={`${movie.title} backdrop`}
            fill
            priority
            className="absolute inset-0 -z-10 h-full w-full object-cover"
            sizes="(max-width: 768px) 100vw, 90vw"
          />
        ) : null}
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-black/85 via-black/70 to-black/85" />
        <div className="flex flex-col gap-10 p-8 md:flex-row md:gap-12 md:p-12">
          <div className="mx-auto w-48 shrink-0 md:mx-0 lg:w-60">
            <div className="relative aspect-2/3 overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={`${movie.title} poster`}
                  fill
                  sizes="240px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                  No poster
                </div>
              )}
            </div>
          </div>
          <div className="flex w-full flex-col gap-6 text-white">
            <div className="space-y-4">
              <Badge className="bg-primary text-primary-foreground">
                {movie.status}
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-primary">
                {movie.title}
              </h1>
              {movie.tagline ? (
                <p className="text-lg italic text-muted-foreground">{movie.tagline}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {releaseDate ? <span>{releaseDate}</span> : null}
              {runtime ? <span>{runtime}</span> : null}
              {genres ? <span>{genres}</span> : null}
              <span>TMDB {formatScore(movie.vote_average)}</span>
            </div>
            <p className="max-w-3xl text-base text-muted-foreground/90">
              {movie.overview || "No synopsis provided yet."}
            </p>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <MediaInteractions
                id={movie.id}
                mediaType="movie"
                title={movie.title}
                releaseDate={movie.release_date}
                posterUrl={posterUrl}
                score={movie.vote_average}
                layout="inline"
              />
              <TrailerDialog videos={movie.videos?.results} title={movie.title} />
            </div>
            {movie.homepage ? (
              <div>
                <Link
                  href={movie.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Official website
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {topCast.length ? (
        <section className="space-y-4" aria-labelledby="top-cast-heading">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 id="top-cast-heading" className="text-2xl font-semibold text-foreground">
                Top Billed Cast
              </h2>
              <p className="text-sm text-muted-foreground">
                Familiar faces bringing {movie.title} to life.
              </p>
            </div>
            <Link href={`/movies/${movie.id}/credits`} className="text-sm font-medium text-primary hover:underline">
              View all credits
            </Link>
          </div>
          <div className="scrollbar-thin flex gap-5 overflow-x-auto pb-2">
            {topCast.map((member) => (
              <article
                key={member.id}
                className="w-48 shrink-0 rounded-2xl border border-border/60 bg-card/70 p-1.5"
              >
                <Link
                  href={`/people/${member.id}`}
                  className="group flex h-full flex-col items-center gap-3 rounded-2xl p-2 text-center transition hover:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-2xl border border-border/60 bg-muted">
                    {member.profile_path ? (
                      <Image
                        src={getProfileUrl(member.profile_path, "w185") ?? ""}
                        alt={member.name}
                        fill
                        sizes="144px"
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.character || "Cast member"}
                    </p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <AdWrapper adSlot="movie-detail-1" className="my-8" />

      {recommendations.length ? (
        <MediaShelf
          title="You Might Also Like"
          subtitle="Recommendations powered by TMDB"
          items={recommendations.map((rec) => ({
            id: rec.id,
            title: rec.title,
            mediaType: "movie" as const,
            overview: rec.overview,
            posterUrl: getImageUrl(rec.poster_path, "w500"),
            score: rec.vote_average,
            releaseDate: rec.release_date,
            href: `/movies/${rec.id}`,
          }))}
        />
      ) : null}
      </div>
    </>
  );
}

