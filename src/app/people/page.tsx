import { Metadata } from "next";

import { getPopularPeople } from "@/lib/tmdb";
import { PersonCard } from "@/components/person-card";

export const metadata: Metadata = {
  title: "People",
  description:
    "Explore popular actors, directors, and creators shaping movies and television on TMDB. Browse celebrity profiles, filmography, and biographies.",
  keywords: [
    "actors",
    "directors",
    "celebrities",
    "entertainment industry",
    "filmography",
    "movie stars",
    "TV stars",
  ],
  alternates: {
    canonical: "https://elemescinema.vercel.app/people",
  },
};

export const revalidate = 900;

export default async function PeoplePage() {
  const people = await getPopularPeople();

  return (
    <div className="space-y-10" aria-labelledby="people-heading">
      <header className="space-y-3">
        <h1 id="people-heading" className="text-4xl font-bold text-foreground">
          People
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Discover the performers and creators behind today&apos;s most-loved
          stories. Explore at-a-glance biographies, find what they&apos;re known
          for, and jump directly to TMDB to dive deeper.
        </p>
      </header>
      <section
        aria-label="Popular people"
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {people.results.slice(0, 16).map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </section>
    </div>
  );
}

