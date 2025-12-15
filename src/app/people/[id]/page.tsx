import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Facebook, Instagram, Link2, Twitter } from "lucide-react";

import {
  getImageUrl,
  getPersonDetails,
  getProfileUrl,
  type PersonCombinedCredit,
  type PersonDetails,
} from "@/lib/tmdb";
import { formatDate, formatScore } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MediaShelf } from "@/components/sections/media-shelf";
import { PersonStructuredData } from "@/components/seo/structured-data";
import { AdWrapper } from "@/components/ads/ad-wrapper";

interface PersonDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: PersonDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const person = await getPersonDetails(id);

  if (!person) {
    return {
      title: "Person not found",
    };
  }

  const baseUrl = "https://elemescinema.vercel.app";
  const personUrl = `${baseUrl}/people/${id}`;
  const title = `${person.name} — ${person.known_for_department}`;
  const description = person.biography
    ? person.biography.slice(0, 160)
    : `${person.name} - ${person.known_for_department} profile, filmography, and biography on ElemesCinema`;
  const profileImage = getProfileUrl(person.profile_path, "w780");

  return {
    title,
    description,
    keywords: [
      person.name,
      person.known_for_department || "",
      "actor",
      "director",
      "entertainment",
      "filmography",
    ],
    openGraph: {
      title,
      description,
      type: "profile",
      url: personUrl,
      siteName: "ElemesCinema",
      images: profileImage
        ? [
            {
              url: profileImage,
              width: 780,
              height: 1170,
              alt: `${person.name} profile`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: profileImage ? [profileImage] : undefined,
    },
    alternates: {
      canonical: personUrl,
    },
  };
}

export const revalidate = 900;

export default async function PersonDetailPage({
  params,
}: PersonDetailPageProps) {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  const person = await getPersonDetails(id);
  if (!person) {
    return notFound();
  }

  const profileUrl = getProfileUrl(person.profile_path, "w780");
  const biography = person.biography?.trim();
  const birthDate = person.birthday ? formatDate(person.birthday) : null;
  const deathDate = person.deathday ? formatDate(person.deathday) : null;
  const ageLabel = getAgeLabel(person.birthday, person.deathday);
  const alsoKnownAs = person.also_known_as ?? [];

  const castCredits = person.combined_credits?.cast ?? [];
  const crewCredits = person.combined_credits?.crew ?? [];

  const knownForCredits = dedupeCredits(
    castCredits.slice().sort(sortByPopularity).slice(0, 16),
  ).slice(0, 12);
  const actingHighlights = dedupeCredits(
    castCredits.slice().sort(sortByNewest),
  ).slice(0, 12);
  const crewHighlights = dedupeCredits(
    crewCredits.slice().sort(sortByNewest),
  ).slice(0, 12);

  const knownForItems = knownForCredits.map(mapCreditToShelfItem);
  const actingItems = actingHighlights.map(mapCreditToShelfItem);
  const crewItems = crewHighlights.map(mapCreditToShelfItem);

  const externalLinks = buildExternalLinks(person.external_ids, person.homepage);
  const baseUrl = "https://elemescinema.vercel.app";
  const personUrl = `${baseUrl}/people/${person.id}`;

  return (
    <>
      <PersonStructuredData person={person} url={personUrl} />
      <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/80 shadow-2xl">
        <div className="flex flex-col gap-10 p-8 md:flex-row md:gap-12 md:p-12">
          <div className="mx-auto w-52 shrink-0 md:mx-0 lg:w-64">
            <div className="relative aspect-2/3 overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
              {profileUrl ? (
                <Image
                  src={profileUrl}
                  alt={`${person.name} portrait`}
                  fill
                  sizes="(max-width: 768px) 70vw, 320px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                  No profile image
                </div>
              )}
            </div>
          </div>
          <div className="flex w-full flex-col gap-6 text-white">
            <div className="space-y-4">
              <Badge className="bg-primary text-primary-foreground">
                {person.known_for_department}
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-primary">
                {person.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {birthDate
                  ? deathDate
                    ? `Born ${birthDate} • Died ${deathDate}`
                    : `Born ${birthDate}${ageLabel ? ` (${ageLabel})` : ""}`
                  : "Birth date unknown"}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>Popularity {formatScore(person.popularity)}</span>
              {person.place_of_birth ? (
                <span>From {person.place_of_birth}</span>
              ) : null}
              {alsoKnownAs.length ? (
                <span>Also known as {alsoKnownAs[0]}</span>
              ) : null}
            </div>
            {biography ? (
              <p className="max-w-3xl text-base text-muted-foreground/90 line-clamp-5">
                {biography}
              </p>
            ) : (
              <p className="max-w-3xl text-base text-muted-foreground/80">
                We don't have a biography for {person.name}.
              </p>
            )}
            {externalLinks.length ? (
              <div className="flex flex-wrap items-center gap-3">
                {externalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-sm text-muted-foreground transition hover:border-white/40 hover:text-foreground"
                  >
                    <link.icon className="h-4 w-4" aria-hidden="true" />
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Biography</h2>
          {biography ? (
            biography
              .split("\n")
              .filter((paragraph) => paragraph.trim().length > 0)
              .map((paragraph, index) => (
                <p key={index} className="text-sm leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))
          ) : (
            <p className="text-sm text-muted-foreground">
              TMDB has not provided a biography for this person yet.
            </p>
          )}
        </div>
        <aside className="space-y-6 rounded-3xl border border-border/60 bg-card/80 p-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Personal details
            </h3>
            <Separator className="my-3 bg-border/50" />
            <dl className="space-y-3 text-sm text-muted-foreground">
              <DetailRow label="Known for">{person.known_for_department}</DetailRow>
              <DetailRow label="Born">
                {birthDate ?? "Unknown"}
                {ageLabel ? <span className="ml-1 text-xs text-muted-foreground/80">({ageLabel})</span> : null}
              </DetailRow>
              <DetailRow label="Died">{deathDate ?? "—"}</DetailRow>
              <DetailRow label="Birthplace">
                {person.place_of_birth ?? "—"}
              </DetailRow>
            </dl>
          </div>
          {alsoKnownAs.length ? (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Also known as
              </h3>
              <Separator className="my-3 bg-border/50" />
              <ul className="flex flex-wrap gap-2">
                {alsoKnownAs.map((alias) => (
                  <li
                    key={alias}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                  >
                    {alias}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </section>

      <AdWrapper adSlot="person-detail-1" className="my-8" />

      {knownForItems.length ? (
        <MediaShelf
          title="Known For"
          subtitle={`${person.name}'s standout roles`}
          items={knownForItems}
        />
      ) : null}

      {actingItems.length ? (
        <MediaShelf
          title="Acting Highlights"
          subtitle="Select credits from combined filmography"
          items={actingItems}
        />
      ) : null}

      {crewItems.length ? (
        <MediaShelf
          title="Behind the Camera"
          subtitle="Key crew contributions"
          items={crewItems}
        />
      ) : null}
      </div>
    </>
  );
}

function mapCreditToShelfItem(credit: PersonCombinedCredit) {
  const title =
    credit.media_type === "movie"
      ? credit.title ?? credit.original_title ?? credit.name ?? ""
      : credit.name ?? credit.original_name ?? credit.title ?? "";

  const releaseDate =
    credit.media_type === "movie" ? credit.release_date : credit.first_air_date;

  const supplementaryLabel =
    credit.media_type === "movie"
      ? credit.character
        ? `as ${credit.character}`
        : undefined
      : credit.character
        ? `as ${credit.character}`
        : credit.department
          ? credit.department
          : credit.job;

  return {
    id: credit.id,
    mediaType: credit.media_type,
    title,
    overview: credit.overview,
    posterUrl: getImageUrl(credit.poster_path, "w500"),
    score: credit.vote_average,
    releaseDate,
    supplementaryLabel,
    href: `/${credit.media_type === "movie" ? "movies" : "tv"}/${credit.id}`,
  };
}

function sortByPopularity(a: PersonCombinedCredit, b: PersonCombinedCredit) {
  return (b.popularity ?? 0) - (a.popularity ?? 0);
}

function sortByNewest(a: PersonCombinedCredit, b: PersonCombinedCredit) {
  return getCreditTime(b) - getCreditTime(a);
}

function getCreditTime(credit: PersonCombinedCredit) {
  const date =
    credit.media_type === "movie" ? credit.release_date : credit.first_air_date;
  if (!date) return 0;
  const time = new Date(date).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function dedupeCredits(credits: PersonCombinedCredit[]) {
  const map = new Map<string, PersonCombinedCredit>();
  credits.forEach((credit) => {
    const key = `${credit.media_type}-${credit.id}`;
    if (!map.has(key)) {
      map.set(key, credit);
    }
  });
  return Array.from(map.values());
}

function getAgeLabel(birthday?: string | null, deathday?: string | null) {
  if (!birthday) return null;
  const birth = new Date(birthday);
  if (Number.isNaN(birth.getTime())) return null;

  const end = deathday ? new Date(deathday) : new Date();
  if (Number.isNaN(end.getTime())) return null;

  let age = end.getFullYear() - birth.getFullYear();
  const m = end.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age > 0 ? `${age} years old` : null;
}

function buildExternalLinks(
  ids: PersonDetails["external_ids"] | undefined,
  homepage: string | null,
) {
  const links: Array<{ href: string; label: string; icon: typeof Link2 }> = [];

  if (homepage) {
    links.push({
      href: homepage,
      label: "Official site",
      icon: Link2,
    });
  }

  if (ids?.imdb_id) {
    links.push({
      href: `https://www.imdb.com/name/${ids.imdb_id}`,
      label: "IMDb",
      icon: ExternalLink,
    });
  }
  if (ids?.twitter_id) {
    links.push({
      href: `https://twitter.com/${ids.twitter_id}`,
      label: "Twitter",
      icon: Twitter,
    });
  }
  if (ids?.instagram_id) {
    links.push({
      href: `https://instagram.com/${ids.instagram_id}`,
      label: "Instagram",
      icon: Instagram,
    });
  }
  if (ids?.facebook_id) {
    links.push({
      href: `https://facebook.com/${ids.facebook_id}`,
      label: "Facebook",
      icon: Facebook,
    });
  }

  return links;
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

