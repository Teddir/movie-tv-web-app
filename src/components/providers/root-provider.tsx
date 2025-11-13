"use client";

import React from "react";

import { WatchlistProvider } from "@/components/providers/watchlist-provider";
import { TmdbSessionProvider } from "@/components/providers/tmdb-session-provider";

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <TmdbSessionProvider>
      <WatchlistProvider>{children}</WatchlistProvider>
    </TmdbSessionProvider>
  );
}

