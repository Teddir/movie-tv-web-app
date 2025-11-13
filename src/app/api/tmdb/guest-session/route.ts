import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const response = await fetch(
    `https://api.themoviedb.org/3/authentication/guest_session/new?api_key=${apiKey}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { error: error?.status_message ?? "Failed to create guest session" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json({
    guestSessionId: data.guest_session_id,
    expiresAt: data.expires_at,
  });
}

