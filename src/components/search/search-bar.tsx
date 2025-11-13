"use client";

import {
  startTransition,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({ className, placeholder = "Search movies, shows, & people" }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionResponse | null>(null);
  const [isPending, startSuggestionTransition] = useTransition();

  useEffect(() => {
    if (pathname === "/search") {
      const q = searchParams.get("q") ?? "";
      startTransition(() => {
        setTerm(q);
      });
    } else {
      startTransition(() => {
        setTerm("");
      });
    }
  }, [pathname, searchParams]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = term.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setOpen(false);
  };

  const activeTerm = term.trim();

  const hasSuggestions = useMemo(() => {
    if (!suggestions) return false;
    return (
      suggestions.movies.length > 0 ||
      suggestions.shows.length > 0 ||
      suggestions.people.length > 0
    );
  }, [suggestions]);

  useEffect(() => {
    if (!activeTerm) {
      setSuggestions(null);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      startSuggestionTransition(async () => {
        try {
          const params = new URLSearchParams({
            q: activeTerm,
            limit: "5",
          });
          const response = await fetch(`/api/tmdb/search?${params.toString()}`, {
            signal: controller.signal,
          });
          if (!response.ok) {
            throw new Error("Failed to fetch suggestions");
          }
          const data = (await response.json()) as SuggestionResponse;
          setSuggestions(data);
        } catch (error) {
          if (!controller.signal.aborted) {
            if (process.env.NODE_ENV !== "production") {
              console.warn("Search suggestions", error);
            }
            setSuggestions(null);
          }
        }
      });
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [activeTerm]);

  const handleSuggestionSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const showDropdown = open && activeTerm.length > 0;

  return (
    <div className={cn("relative w-full", className)}>
      <form
        onSubmit={onSubmit}
        className="group flex w-full items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 transition focus-within:border-primary/70 focus-within:bg-white/15"
        role="search"
        aria-label="Search movies, shows, and people"
      >
        <SearchIcon className="h-4 w-4 text-muted-foreground group-focus-within:text-primary" aria-hidden="true" />
        <Input
          value={term}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={placeholder}
          className="h-8 flex-1 border-none bg-transparent p-0 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
          aria-label="Search"
        />
        <Button type="submit" size="sm" className="rounded-full px-4 text-xs uppercase tracking-wide">
          Search
        </Button>
      </form>
      {showDropdown ? (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 rounded-3xl border border-white/10 bg-background/95 p-4 shadow-2xl backdrop-blur">
          {isPending ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Searching…</div>
          ) : hasSuggestions ? (
            <div className="grid gap-5 md:grid-cols-3">
              <SuggestionGroup
                title="Movies"
                items={suggestions?.movies ?? []}
                onSelect={handleSuggestionSelect}
              />
              <SuggestionGroup
                title="TV Shows"
                items={suggestions?.shows ?? []}
                onSelect={handleSuggestionSelect}
              />
              <SuggestionGroup
                title="People"
                items={suggestions?.people ?? []}
                onSelect={handleSuggestionSelect}
              />
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No quick matches. Press enter to search all results.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

interface SuggestionItem {
  id: number;
  title: string;
  subtitle?: string;
  href: string;
  posterUrl: string | null;
}

interface SuggestionResponse {
  movies: SuggestionItem[];
  shows: SuggestionItem[];
  people: SuggestionItem[];
}

function SuggestionGroup({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: SuggestionItem[];
  onSelect: (href: string) => void;
}) {
  if (!items.length) return null;

  return (
    <div>
      <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={`${title}-${item.id}`}>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(item.href)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {item.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.posterUrl}
                  alt=""
                  className="h-10 w-7 shrink-0 rounded-xs object-cover"
                />
              ) : (
                <span className="flex h-10 w-7 shrink-0 items-center justify-center rounded-xs bg-muted/60 text-xs text-muted-foreground">
                  •
                </span>
              )}
              <span className="flex flex-col">
                <span className="font-medium text-foreground">{item.title}</span>
                {item.subtitle ? (
                  <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                ) : null}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

