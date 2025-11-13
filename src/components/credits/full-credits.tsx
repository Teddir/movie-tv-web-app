import Image from "next/image";
import Link from "next/link";

import type { CastMember, CrewMember } from "@/lib/tmdb";
import { getProfileUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface FullCreditsProps {
  cast: CastMember[];
  crew: CrewMember[];
  mediaType: "movie" | "tv";
  title: string;
  tmdbId: number;
}

export function FullCredits({ cast, crew, mediaType, title, tmdbId }: FullCreditsProps) {
  if (!cast.length && !crew.length) {
    return null;
  }

  const crewByDepartment = groupCrewByDepartment(crew);

  return (
    <section
      className="space-y-8 rounded-3xl border border-border/60 bg-card/70 p-6"
      aria-labelledby="full-credits-heading"
      id="full-credits"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full border-primary/40 text-primary">
            Full credits
          </Badge>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
        </div>
        <div>
          <h2 id="full-credits-heading" className="text-2xl font-semibold text-foreground">
            Cast & Crew
          </h2>
          <p className="text-sm text-muted-foreground">
            Complete list of credited performers and crew members for this {mediaType}.
          </p>
        </div>
      </div>

      {cast.length ? (
        <div className="space-y-4" aria-labelledby="full-cast-heading">
          <div className="flex items-center justify-between gap-4">
            <h3 id="full-cast-heading" className="text-lg font-semibold text-foreground">
              Cast ({cast.length})
            </h3>
            <ExternalCreditLink mediaType={mediaType} tmdbId={tmdbId} section="cast" />
          </div>
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {cast.map((member) => (
              <li key={`${member.id}-${member.credit_id ?? member.order}`}>
                <Link
                  href={`/people/${member.id}`}
                  className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 p-3 transition hover:border-border hover:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  <ProfileAvatar
                    name={member.name}
                    profilePath={member.profile_path}
                    className="h-16 w-16"
                  />
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      {member.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {member.character?.trim() || "Cast"}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {crewByDepartment.length ? (
        <div className="space-y-4" aria-labelledby="full-crew-heading">
          <div className="flex items-center justify-between gap-4">
            <h3 id="full-crew-heading" className="text-lg font-semibold text-foreground">
              Crew ({crew.length})
            </h3>
            <ExternalCreditLink mediaType={mediaType} tmdbId={tmdbId} section="crew" />
          </div>
          <div className="space-y-6">
            {crewByDepartment.map(([department, members]) => (
              <div key={department} className="space-y-3 rounded-2xl border border-border/50 bg-background/40 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {department}
                  </p>
                  <span className="text-xs text-muted-foreground"> {members.length} credits</span>
                </div>
                <Separator className="bg-border/40" />
                <ul className="space-y-2">
                  {members.map((member, index) => (
                    <li key={`${member.id}-${member.job ?? member.department}-${index}`}>
                      <Link
                        href={`/people/${member.id}`}
                        className="group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-card/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                      >
                        <ProfileAvatar
                          name={member.name}
                          profilePath={member.profile_path}
                          className="h-12 w-12"
                        />
                        <div className="flex flex-1 flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {member.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {member.job?.trim() || member.department || "Crew"}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ExternalCreditLink({
  mediaType,
  tmdbId,
  section,
}: {
  mediaType: "movie" | "tv";
  tmdbId: number;
  section: "cast" | "crew";
}) {
  if (!tmdbId) return null;

  const href = `https://www.themoviedb.org/${mediaType}/${tmdbId}/cast`;
  const label = section === "cast" ? "Cast on TMDB" : "Crew on TMDB";

  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-xs font-medium text-primary hover:underline"
    >
      {label}
    </Link>
  );
}

function ProfileAvatar({
  name,
  profilePath,
  className,
}: {
  name: string;
  profilePath: string | null;
  className?: string;
}) {
  const profileUrl = getProfileUrl(profilePath, "w185");
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-muted",
        className,
      )}
    >
      {profileUrl ? (
        <Image
          src={profileUrl}
          alt={name}
          fill
          sizes="80px"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[11px] text-muted-foreground">
          No image
        </div>
      )}
    </div>
  );
}

function groupCrewByDepartment(crew: CrewMember[]) {
  const map = new Map<string, CrewMember[]>();
  crew.forEach((member) => {
    const department = member.department?.trim() || "Crew";
    if (!map.has(department)) {
      map.set(department, []);
    }
    map.get(department)!.push(member);
  });

  return Array.from(map.entries())
    .map(([department, members]) => [
      department,
      members
        .slice()
        .sort((a, b) => {
          const jobCompare = (a.job || "").localeCompare(b.job || "");
          if (jobCompare !== 0) return jobCompare;
          return a.name.localeCompare(b.name);
        }),
    ])
    .sort((a, b) => (a[0] as string)?.localeCompare(b[0] as string ?? "") ?? 0) as Array<[string, CrewMember[]]>;
}

