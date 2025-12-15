import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getBackdropUrl,
  getImageUrl,
  getProfileUrl,
  getTvCategory,
  getTvDetails,
} from "@/lib/tmdb";
import { formatDate, formatRuntime, formatScore } from "@/lib/utils";
import { MediaInteractions } from "@/components/media-interactions";
import { MediaShelf } from "@/components/sections/media-shelf";
import { TrailerDialog } from "@/components/trailer-dialog";
import { Badge } from "@/components/ui/badge";
import { mapTvSummary } from "@/lib/mappers";
import { TvCategorySection } from "@/app/tv/category-section";
import { TvStructuredData } from "@/components/seo/structured-data";
import { AdWrapper } from "@/components/ads/ad-wrapper";

interface TvDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: TvDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const show = await getTvDetails(id);
  if (!show) {
    return {
      title: "Series not found",
    };
  }

  const baseUrl = "https://elemescinema.vercel.app";
  const showUrl = `${baseUrl}/tv/${id}`;
  const posterUrl = getImageUrl(show.poster_path, "w500");
  const backdropUrl = getBackdropUrl(show.backdrop_path, "original");

  return {
    title: show.name,
    description: show.overview || `${show.name} - TV series details, cast, and ratings on ElemesCinema`,
    keywords: [
      show.name,
      ...(show.genres?.map((g) => g.name) || []),
      "TV show",
      "television",
      "series",
      "entertainment",
    ],
    openGraph: {
      title: show.name,
      description: show.overview || `${show.name} - TV series details and information`,
      type: "video.tv_show",
      url: showUrl,
      siteName: "ElemesCinema",
      images: backdropUrl
        ? [
            {
              url: backdropUrl,
              width: 1280,
              height: 720,
              alt: `${show.name} backdrop`,
            },
          ]
        : posterUrl
          ? [
              {
                url: posterUrl,
                width: 500,
                height: 750,
                alt: `${show.name} poster`,
              },
            ]
          : undefined,
      ...(show.first_air_date && {
        releaseDate: show.first_air_date,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: show.name,
      description: show.overview || `${show.name} - TV series details and information`,
      images: backdropUrl ? [backdropUrl] : posterUrl ? [posterUrl] : undefined,
    },
    alternates: {
      canonical: showUrl,
    },
  };
}
const specialTvCategories = {
  "airing-today": {
    apiCategory: "airing_today",
    title: "Airing Today",
    description: "The latest TV shows airing today.",
  },
  "on-the-air": {
    apiCategory: "on_the_air",
    title: "On the Air",
    description: "The latest TV shows on the air.",
  },
  "top-rated": {
    apiCategory: "top_rated",
    title: "Top Rated",
    description: "The highest rated TV shows.",
  },
  popular: {
    apiCategory: "popular",
    title: "Popular",
    description: "The most popular TV shows.",
  },
} as const;

type SpecialTvCategoryKey = keyof typeof specialTvCategories;

function isSpecialTvCategory(id: string): id is SpecialTvCategoryKey {
  return id in specialTvCategories;
}
export default async function TvDetailPage({ params }: TvDetailPageProps) {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  if (isSpecialTvCategory(id)) {
    const categoryConfig = specialTvCategories[id];
    const categoryData = await getTvCategory(categoryConfig.apiCategory, 1);
    const items = categoryData.results.map(mapTvSummary);
    const hasMore = categoryData.page < categoryData.total_pages;

    return (
      <div className="space-y-16">
        <TvCategorySection
          title={categoryConfig.title}
          description={categoryConfig.description}
          initialItems={items}
          category={id}
          hasMore={hasMore}
        />
      </div>
    );
  }

  const show = await getTvDetails(id);
  if (!show) {
    notFound();
  }

  const posterUrl = getImageUrl(show.poster_path, "w500");
  const backdropUrl = getBackdropUrl(show.backdrop_path, "w780");
  const firstAirDate = formatDate(show.first_air_date);
  const runtime = formatRuntime(show.episode_run_time?.[0]);
  const genres = show.genres.map((genre) => genre.name).join(" • ");
  const creators = show.created_by?.map((creator) => creator.name).join(", ");
  const topCast = show.credits?.cast?.slice(0, 8) ?? [];
  const recommendations = show.recommendations?.results?.slice(0, 12) ?? [];

  const baseUrl = "https://elemescinema.vercel.app";
  const showUrl = `${baseUrl}/tv/${show.id}`;

  return (
    <>
      <TvStructuredData show={show} url={showUrl} />
      <div className="space-y-16">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/80 shadow-2xl">
        {backdropUrl ? (
          <Image
            src={backdropUrl}
            alt={`${show.name} backdrop`}
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
                  alt={`${show.name} poster`}
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
              <Badge className="bg-primary text-primary-foreground">{show.status}</Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-primary">
                {show.name}
              </h1>
              {show.tagline ? (
                <p className="text-lg italic text-muted-foreground">{show.tagline}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {firstAirDate ? <span>Premiered {firstAirDate}</span> : null}
              {runtime ? <span>{runtime} avg runtime</span> : null}
              {genres ? <span>{genres}</span> : null}
              <span>Seasons {show.number_of_seasons}</span>
              <span>TMDB {formatScore(show.vote_average)}</span>
            </div>
            {creators ? (
              <p className="text-sm text-muted-foreground/80">
                Created by {creators}
              </p>
            ) : null}
            <p className="max-w-3xl text-base text-muted-foreground/90">
              {show.overview || "No synopsis provided yet."}
            </p>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <MediaInteractions
                id={show.id}
                mediaType="tv"
                title={show.name}
                releaseDate={show.first_air_date}
                posterUrl={posterUrl}
                score={show.vote_average}
                supplementaryLabel={show.origin_country?.join(" • ")}
                layout="inline"
              />
              <TrailerDialog videos={show.videos?.results} title={show.name} />
            </div>
            {show.homepage ? (
              <div>
                <Link
                  href={show.homepage}
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

      <section className="space-y-4" aria-labelledby="top-cast-heading">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 id="top-cast-heading" className="text-2xl font-semibold text-foreground">
              Top Billed Cast
            </h2>
            <p className="text-sm text-muted-foreground">
              Familiar faces bringing {show.name} to life.
            </p>
          </div>
          <Link href={`/tv/${show.id}/credits`} className="text-sm font-medium text-primary hover:underline">
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

      {show.seasons?.length ? (
        <section className="space-y-4" aria-labelledby="seasons-heading">
          <div>
            <h2 id="seasons-heading" className="text-2xl font-semibold text-foreground">
              Seasons
            </h2>
            <p className="text-sm text-muted-foreground">
              {show.number_of_seasons} season{show.number_of_seasons === 1 ? "" : "s"},{" "}
              {show.number_of_episodes} episode{show.number_of_episodes === 1 ? "" : "s"} total.
            </p>
          </div>
          <div className="scrollbar-thin flex gap-5 overflow-x-auto pb-2">
            {show.seasons.map((season) => (
              <article
                key={season.id}
                className="w-56 shrink-0 space-y-2 rounded-2xl border border-border/60 bg-card/70 p-4"
              >
                <div className="relative h-40 overflow-hidden rounded-xl border border-border/60 bg-muted">
                  {season.poster_path ? (
                    <Image
                      src={getImageUrl(season.poster_path, "w342") ?? ""}
                      alt={`${season.name} poster`}
                      fill
                      sizes="224px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{season.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {season.air_date ? formatDate(season.air_date) : "TBA"} · {season.episode_count} episodes
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <AdWrapper adSlot="3245600038" className="my-8" />

      {recommendations.length ? (
        <MediaShelf
          title="Recommended Series"
          subtitle="More stories you might enjoy"
          items={recommendations.map((rec) => ({
            id: rec.id,
            title: rec.name,
            mediaType: "tv" as const,
            overview: rec.overview,
            posterUrl: getImageUrl(rec.poster_path, "w500"),
            score: rec.vote_average,
            releaseDate: rec.first_air_date,
            supplementaryLabel: rec.origin_country?.join(" • "),
            href: `/tv/${rec.id}`,
          }))}
        />
      ) : null}
      </div>
    </>
  );
}

