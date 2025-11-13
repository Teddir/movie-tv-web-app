"use client";

import React from "react";

interface TmdbSessionContextValue {
  guestSessionId: string | null;
  loading: boolean;
  ensureSession: () => Promise<string | null>;
}

const STORAGE_KEY = "tmdb-guest-session";

const TmdbSessionContext = React.createContext<TmdbSessionContextValue | null>(null);

async function requestGuestSession(): Promise<{
  id: string;
  expiresAt: number;
}> {
  const response = await fetch("/api/tmdb/guest-session", { method: "POST" });
  if (!response.ok) {
    throw new Error("Failed to create TMDB guest session");
  }
  const data = await response.json();
  return {
    id: data.guestSessionId as string,
    expiresAt: new Date(data.expiresAt).getTime(),
  };
}

export function TmdbSessionProvider({ children }: { children: React.ReactNode }) {
  const [guestSessionId, setGuestSessionId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const createSession = React.useCallback(async () => {
    const result = await requestGuestSession();
    const payload = JSON.stringify(result);
    localStorage.setItem(STORAGE_KEY, payload);
    setGuestSessionId(result.id);
    return result.id;
  }, []);

  const ensureSession = React.useCallback(async () => {
    if (guestSessionId) {
      return guestSessionId;
    }
    try {
      const storedRaw = localStorage.getItem(STORAGE_KEY);
      if (storedRaw) {
        const stored = JSON.parse(storedRaw) as { id: string; expiresAt: number };
        if (stored.expiresAt > Date.now()) {
          setGuestSessionId(stored.id);
          return stored.id;
        }
      }
      return await createSession();
    } catch (error) {
      console.warn("Failed to ensure TMDB guest session", error);
      return null;
    }
  }, [guestSessionId, createSession]);

  React.useEffect(() => {
    let mounted = true;
    async function init() {
      setLoading(true);
      try {
        const storedRaw = localStorage.getItem(STORAGE_KEY);
        if (storedRaw) {
          const stored = JSON.parse(storedRaw) as { id: string; expiresAt: number };
          if (stored.expiresAt > Date.now()) {
            if (mounted) {
              setGuestSessionId(stored.id);
              setLoading(false);
              return;
            }
          }
        }
        const id = await createSession();
        if (!mounted) return;
        setGuestSessionId(id);
      } catch (error) {
        console.warn("Unable to initialise TMDB guest session", error);
        if (mounted) {
          setGuestSessionId(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, [createSession]);

  const value = React.useMemo<TmdbSessionContextValue>(
    () => ({
      guestSessionId,
      loading,
      ensureSession,
    }),
    [guestSessionId, loading, ensureSession],
  );

  return (
    <TmdbSessionContext.Provider value={value}>
      {children}
    </TmdbSessionContext.Provider>
  );
}

export function useTmdbSession() {
  const context = React.useContext(TmdbSessionContext);
  if (!context) {
    throw new Error("useTmdbSession must be used within TmdbSessionProvider");
  }
  return context;
}

