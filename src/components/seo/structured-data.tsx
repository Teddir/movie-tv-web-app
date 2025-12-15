import type { MovieDetails, TvDetails, PersonDetails } from "@/lib/tmdb";
import { getBackdropUrl, getImageUrl, getProfileUrl } from "@/lib/tmdb";

interface WebsiteStructuredDataProps {
  url: string;
  name: string;
  description: string;
}

export function WebsiteStructuredData({
  url,
  name,
  description,
}: WebsiteStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface MovieStructuredDataProps {
  movie: MovieDetails;
  url: string;
}

export function MovieStructuredData({ movie, url }: MovieStructuredDataProps) {
  const posterUrl = getImageUrl(movie.poster_path, "w500");
  const backdropUrl = getBackdropUrl(movie.backdrop_path, "original");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: movie.overview,
    image: backdropUrl ? [backdropUrl] : posterUrl ? [posterUrl] : undefined,
    datePublished: movie.release_date || undefined,
    director: movie.credits?.crew
      ?.filter((person) => person.job === "Director")
      .map((director) => ({
        "@type": "Person",
        name: director.name,
      })),
    actor: movie.credits?.cast?.slice(0, 10).map((actor) => ({
      "@type": "Person",
      name: actor.name,
      characterName: actor.character,
    })),
    genre: movie.genres?.map((genre) => genre.name),
    aggregateRating: movie.vote_average
      ? {
          "@type": "AggregateRating",
          ratingValue: movie.vote_average,
          bestRating: 10,
          worstRating: 0,
          ratingCount: movie.vote_count || 0,
        }
      : undefined,
    duration: movie.runtime ? `PT${movie.runtime}M` : undefined,
    url,
    ...(movie.homepage && { sameAs: movie.homepage }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface TvStructuredDataProps {
  show: TvDetails;
  url: string;
}

export function TvStructuredData({ show, url }: TvStructuredDataProps) {
  const posterUrl = getImageUrl(show.poster_path, "w500");
  const backdropUrl = getBackdropUrl(show.backdrop_path, "original");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: show.name,
    description: show.overview,
    image: backdropUrl ? [backdropUrl] : posterUrl ? [posterUrl] : undefined,
    datePublished: show.first_air_date || undefined,
    creator: show.created_by?.map((creator) => ({
      "@type": "Person",
      name: creator.name,
    })),
    actor: show.credits?.cast?.slice(0, 10).map((actor) => ({
      "@type": "Person",
      name: actor.name,
      characterName: actor.character,
    })),
    genre: show.genres?.map((genre) => genre.name),
    aggregateRating: show.vote_average
      ? {
          "@type": "AggregateRating",
          ratingValue: show.vote_average,
          bestRating: 10,
          worstRating: 0,
          ratingCount: show.vote_count || 0,
        }
      : undefined,
    numberOfSeasons: show.number_of_seasons,
    numberOfEpisodes: show.number_of_episodes,
    url,
    ...(show.homepage && { sameAs: show.homepage }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface PersonStructuredDataProps {
  person: PersonDetails;
  url: string;
}

export function PersonStructuredData({
  person,
  url,
}: PersonStructuredDataProps) {
  const profileUrl = getProfileUrl(person.profile_path, "w780");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    description: person.biography?.slice(0, 200) || `${person.name} profile`,
    image: profileUrl ? [profileUrl] : undefined,
    birthDate: person.birthday || undefined,
    deathDate: person.deathday || undefined,
    jobTitle: person.known_for_department || undefined,
    birthPlace: person.place_of_birth
      ? {
          "@type": "Place",
          name: person.place_of_birth,
        }
      : undefined,
    url,
    ...(person.homepage && { sameAs: [person.homepage] }),
    ...(person.external_ids?.imdb_id && {
      sameAs: [
        ...(person.homepage ? [person.homepage] : []),
        `https://www.imdb.com/name/${person.external_ids.imdb_id}`,
      ],
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

