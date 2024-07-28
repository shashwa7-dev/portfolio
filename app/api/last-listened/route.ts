import { NextRequest, NextResponse } from "next/server";

async function getlastListened(access_token: string) {
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
    // First, refresh the token
    //NOTE: avoid accessing nextJS apis like this: http://localhost:3000/api/refresh-token,
    //use request obj to access origin
    const tokenResponse = await fetch(
      `${request.nextUrl.origin}/api/refresh-token`
    );
    const tokenData = await tokenResponse.json();
    console.log("Token expires in:", tokenData.expires_in, "seconds");
    if (tokenData.error) {
      throw new Error(tokenData.error);
    }
    // Then, use the new access token to fetch user profile
    const lastTrack = await getlastListened(tokenData.access_token);
    return NextResponse.json(lastTrack);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
