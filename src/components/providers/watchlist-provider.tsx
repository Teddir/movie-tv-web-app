"use client";

import React from "react";

import { useTmdbSession } from "@/components/providers/tmdb-session-provider";

type WatchlistMediaType = "movie" | "tv";

export interface WatchlistItem {
  id: number;
  mediaType: WatchlistMediaType;
  title: string;
  subtitle?: string;
  image?: string | null;
  averageScore?: number | null;
  releaseDate?: string | null;
}

type RatingMap = Record<string, number>;

interface WatchlistContextValue {
  hydrated: boolean;
  authenticated: boolean;
  items: WatchlistItem[];
  ratings: RatingMap;
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (id: number, mediaType: WatchlistMediaType) => void;
  toggleWatchlist: (item: WatchlistItem) => void;
  isInWatchlist: (id: number, mediaType: WatchlistMediaType) => boolean;
  setRating: (id: number, mediaType: WatchlistMediaType, rating: number) => void;
  getRating: (id: number, mediaType: WatchlistMediaType) => number | null;
}

const WatchlistContext = React.createContext<WatchlistContextValue | null>(null);

const STORAGE_PREFIX = "cine-watchlist";
const RATINGS_PREFIX = "cine-ratings";

function composeKey(id: number, mediaType: WatchlistMediaType) {
  return `${mediaType}-${id}`;
}

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { guestSessionId, loading: sessionLoading, ensureSession } = useTmdbSession();
  const storageKey = guestSessionId ? `${STORAGE_PREFIX}-${guestSessionId}` : null;
  const ratingsKey = guestSessionId ? `${RATINGS_PREFIX}-${guestSessionId}` : null;

  const [hydrated, setHydrated] = React.useState(false);
  const [items, setItems] = React.useState<WatchlistItem[]>([]);
  const [ratings, setRatings] = React.useState<RatingMap>({});

  React.useEffect(() => {
    if (sessionLoading) return;
    (async () => {
      if (!guestSessionId) {
        await ensureSession();
      }
    })();
  }, [guestSessionId, sessionLoading, ensureSession]);

  React.useEffect(() => {
    setHydrated(false);
    if (!storageKey || !ratingsKey) {
      setItems([]);
      setRatings({});
      setHydrated(true);
      return;
    }
    try {
      const storedItems = localStorage.getItem(storageKey);
      const storedRatings = localStorage.getItem(ratingsKey);
      setItems(storedItems ? JSON.parse(storedItems) : []);
      setRatings(storedRatings ? JSON.parse(storedRatings) : {});
    } catch (error) {
      console.warn("Failed to restore watchlist", error);
      setItems([]);
      setRatings({});
    } finally {
      setHydrated(true);
    }
  }, [storageKey, ratingsKey]);

  React.useEffect(() => {
    if (!hydrated || !storageKey || !ratingsKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
      localStorage.setItem(ratingsKey, JSON.stringify(ratings));
    } catch (error) {
      console.warn("Failed to persist watchlist", error);
    }
  }, [items, ratings, hydrated, storageKey, ratingsKey]);

  const addToWatchlist = React.useCallback(
    (item: WatchlistItem) => {
      if (!storageKey) return;
      setItems((prev) => {
        const exists = prev.find(
          (entry) =>
            entry.id === item.id && entry.mediaType === item.mediaType,
        );
        if (exists) {
          return prev;
        }
        return [item, ...prev];
      });
    },
    [storageKey],
  );

  const removeFromWatchlist = React.useCallback(
    (id: number, mediaType: WatchlistMediaType) => {
      if (!storageKey) return;
      setItems((prev) =>
        prev.filter(
          (entry) => !(entry.id === id && entry.mediaType === mediaType),
        ),
      );
      setRatings((prev) => {
        const next = { ...prev };
        delete next[composeKey(id, mediaType)];
        return next;
      });
    },
    [storageKey],
  );

  const toggleWatchlist = React.useCallback(
    (item: WatchlistItem) => {
      if (!storageKey) return;
      setItems((prev) => {
        const exists = prev.find(
          (entry) =>
            entry.id === item.id && entry.mediaType === item.mediaType,
        );
        if (exists) {
          return prev.filter(
            (entry) =>
              !(entry.id === item.id && entry.mediaType === item.mediaType),
          );
        }
        return [item, ...prev];
      });
    },
    [storageKey],
  );

  const isInWatchlist = React.useCallback(
    (id: number, mediaType: WatchlistMediaType) =>
      items.some(
        (entry) => entry.id === id && entry.mediaType === mediaType,
      ),
    [items],
  );

  const setRating = React.useCallback(
    (id: number, mediaType: WatchlistMediaType, rating: number) => {
      if (!storageKey) return;
      setRatings((prev) => ({
        ...prev,
        [composeKey(id, mediaType)]: rating,
      }));
    },
    [storageKey],
  );

  const getRating = React.useCallback(
    (id: number, mediaType: WatchlistMediaType) => {
      const value = ratings[composeKey(id, mediaType)];
      return value ?? null;
    },
    [ratings],
  );

  const value = React.useMemo<WatchlistContextValue>(
    () => ({
      hydrated,
      authenticated: Boolean(storageKey),
      items,
      ratings,
      addToWatchlist,
      removeFromWatchlist,
      toggleWatchlist,
      isInWatchlist,
      setRating,
      getRating,
    }),
    [
      hydrated,
      storageKey,
      items,
      ratings,
      addToWatchlist,
      removeFromWatchlist,
      toggleWatchlist,
      isInWatchlist,
      setRating,
      getRating,
    ],
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = React.useContext(WatchlistContext);
  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
}

