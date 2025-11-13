import Image from "next/image";
import Link from "next/link";

import type { PersonSummary } from "@/lib/tmdb";
import { getProfileUrl } from "@/lib/tmdb";
import { formatScore } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface PersonCardProps {
  person: PersonSummary;
}

const fallbackProfile =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><rect width='400' height='400' fill='%231f2937'/><text x='50%' y='50%' fill='%23e5e7eb' font-family='Arial' font-size='26' text-anchor='middle'>No Image</text></svg>";

export function PersonCard({ person }: PersonCardProps) {
  const profileUrl = getProfileUrl(person.profile_path);
  const topKnownFor = person.known_for?.slice(0, 2) ?? [];

  return (
    <Card className="group flex flex-col overflow-hidden border-border/50 bg-card/80 transition hover:border-border hover:bg-card">
      <div className="relative h-64 w-full overflow-hidden">
        {profileUrl ? (
          <Image
            src={profileUrl}
            alt={`${person.name} portrait`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 18vw"
            className="object-cover transition duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <Image
            src={fallbackProfile}
            alt="Profile placeholder"
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 18vw"
            className="object-cover opacity-80"
          />
        )}
        <Badge className="absolute left-3 top-3 bg-black/70 text-xs uppercase tracking-wide text-white shadow">
          {person.known_for_department}
        </Badge>
      </div>
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <header>
          <h3 className="text-lg font-semibold text-foreground">{person.name}</h3>
          <p className="text-sm text-muted-foreground">
            Popularity {formatScore(person.popularity)}
          </p>
        </header>
        {topKnownFor.length ? (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Known for
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {topKnownFor.map((credit) => (
                <li key={`${credit.id}-${"title" in credit ? credit.title : credit.name}`}>
                  <span className="font-medium text-foreground">
                    {"title" in credit ? credit.title : credit.name}
                  </span>
                  {credit.vote_average ? (
                    <span className="ml-1 text-xs text-muted-foreground">
                      · {formatScore(credit.vote_average)}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="mt-auto">
          <Link
            href={`/people/${person.id}`}
            className="text-sm font-medium text-primary transition hover:underline"
          >
            View details
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

