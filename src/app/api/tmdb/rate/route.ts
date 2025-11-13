import { NextResponse } from "next/server";

const ENDPOINT_MAP = {
  movie: (id: number) => `https://api.themoviedb.org/3/movie/${id}/rating`,
  tv: (id: number) => `https://api.themoviedb.org/3/tv/${id}/rating`,
} as const;

export async function POST(request: Request) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const body = await request.json();
  const { mediaType, id, rating, guestSessionId } = body as {
    mediaType: "movie" | "tv";
    id: number;
    rating: number;
    guestSessionId: string;
  };

  if (!mediaType || !id || !rating || !guestSessionId) {
    return NextResponse.json(
      { error: "mediaType, id, rating, and guestSessionId are required" },
      { status: 400 },
    );
  }

  const endpointFactory = ENDPOINT_MAP[mediaType];
  if (!endpointFactory) {
    return NextResponse.json({ error: "Unsupported media type" }, { status: 400 });
  }

  const endpoint = endpointFactory(id);
  const scaledRating = Math.max(0.5, Math.min(10, rating));

  const response = await fetch(
    `${endpoint}?api_key=${apiKey}&guest_session_id=${guestSessionId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({ value: scaledRating }),
    },
  );

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json(
      { error: data?.status_message ?? "Failed to submit rating" },
      { status: response.status },
    );
  }

  return NextResponse.json({ success: true });
}

