import { NextResponse } from "next/server";

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

async function refreshAccessToken() {
  console.log("Refreshing access token using refresh token:", refresh_token);

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh_token!,
    }),
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(
      `Error refreshing token: ${response.status} ${response.statusText} - ${errorDetails}`
    );
  }

  return await response.json();
}
export async function GET() {
  try {
    console.log("Starting token refresh");
    const tokenData = await refreshAccessToken();
    console.log("Received token data:", tokenData);

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    const expiresIn = tokenData.expires_in;

    return NextResponse.json({
      access_token: tokenData.access_token,
      expires_in: expiresIn,
    });
  } catch (error: any) {
    console.error("Error refreshing token:", error);
    return NextResponse.json(
      { error: "Failed to refresh token", details: error.message },
      { status: 500 }
    );
  }
}
