import { NextRequest, NextResponse } from "next/server";

async function getLastListened(access_token: string) {
  const response = await fetch(
    "https://api.spotify.com/v1/me/player/recently-played?limit=1",
    {
      headers: { Authorization: "Bearer " + access_token },
    }
  );
  return await response.json();
}

export async function GET(request: NextRequest) {
  try {
    const access_token = request.nextUrl.searchParams.get("access_token");
    if (!access_token) {
      throw new Error("No access token provided");
    }

    const lastTrack = await getLastListened(access_token);
    return NextResponse.json(lastTrack);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch last listened track" },
      { status: 500 }
    );
  }
}
