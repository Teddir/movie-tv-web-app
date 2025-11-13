"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FilmIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { WatchlistDrawer } from "@/components/watchlist-drawer";
import { SearchBar } from "@/components/search/search-bar";

const navItems = [
  { href: "/movies", label: "Movies" },
  { href: "/tv", label: "TV" },
  { href: "/people", label: "People" },
];

const movieSubNav = [
  { href: "/movies", label: "Catalogue", value: "catalogue" },
  { href: "/movies/now-playing", label: "Now Playing", value: "now-playing" },
  { href: "/movies/popular", label: "Popular", value: "popular" },
  { href: "/movies/top-rated", label: "Top Rated", value: "top-rated" },
  { href: "/movies/upcoming", label: "Upcoming", value: "upcoming" },
] as const;

const tvSubNav = [
  { href: "/tv", label: "Catalogue", value: "catalogue" },
  { href: "/tv/airing-today", label: "Airing Today", value: "airing-today" },
  { href: "/tv/on-the-air", label: "On The Air", value: "on-the-air" },
  { href: "/tv/popular", label: "Popular", value: "popular" },
  { href: "/tv/top-rated", label: "Top Rated", value: "top-rated" },
] as const;

function getMovieNavValue(pathname: string) {
  if (pathname === "/movies") return "catalogue";
  if (pathname.startsWith("/movies/now-playing")) return "now-playing";
  if (pathname.startsWith("/movies/popular")) return "popular";
  if (pathname.startsWith("/movies/top-rated")) return "top-rated";
  if (pathname.startsWith("/movies/upcoming")) return "upcoming";
  return null;
}

function getTvNavValue(pathname: string) {
  if (pathname === "/tv") return "catalogue";
  if (pathname.startsWith("/tv/airing-today")) return "airing-today";
  if (pathname.startsWith("/tv/on-the-air")) return "on-the-air";
  if (pathname.startsWith("/tv/popular")) return "popular";
  if (pathname.startsWith("/tv/top-rated")) return "top-rated";
  return null;
}

export function SiteHeader() {
  const pathname = usePathname();
  const movieCategory = pathname.startsWith("/movies")
    ? getMovieNavValue(pathname)
    : null;
  const tvCategory = pathname.startsWith("/tv") ? getTvNavValue(pathname) : null;
  const isMoviesRoute = pathname.startsWith("/movies");
  const isTvRoute = pathname.startsWith("/tv");
  const [hidden, setHidden] = useState(false);
  const lastScrollRef = useRef(0);

  useEffect(() => {
    let frame = 0;
    const handleScroll = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const current = window.scrollY;
        const isScrollingDown = current > lastScrollRef.current;
        if (isScrollingDown && current > 120) {
          setHidden(true);
        } else {
          setHidden(false);
        }
        lastScrollRef.current = current;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl transition-transform duration-300",
        hidden ? "-translate-y-full" : "translate-y-0",
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <FilmIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-semibold uppercase tracking-widest text-foreground">
                ElemesCinema
              </span>
            </Link>
          </div>
          <nav aria-label="Primary" className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-1 py-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isActive && "bg-primary text-primary-foreground shadow",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <WatchlistDrawer />
          </nav>
        </div>

        {isMoviesRoute ? (
          <nav
            aria-label="Movies subsections"
            className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2 py-2"
          >
            {movieSubNav.map((item) => {
            const isActive = movieCategory === item.value;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isActive && "bg-primary text-primary-foreground shadow",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : null}

        {isTvRoute ? (
          <nav
            aria-label="TV subsections"
            className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2 py-2"
          >
            {tvSubNav.map((item) => {
            const isActive = tvCategory === item.value;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isActive && "bg-primary text-primary-foreground shadow",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : null}

        <div className="w-full">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}

