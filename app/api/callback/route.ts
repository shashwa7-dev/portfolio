import { NextRequest, NextResponse } from "next/server";
import querystring from "querystring";

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = "http://localhost:3000/api/callback";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code") || null;
  const state = searchParams.get("state") || null;

  if (state === null) {
    return NextResponse.redirect("/error?message=state_mismatch");
  }

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(client_id + ":" + client_secret).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: querystring.stringify({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      throw new Error("Token request failed");
    }

    const data = await response.json();
    const { access_token, refresh_token } = data;
    const res = NextResponse.redirect(new URL("/", request.url));
    res.cookies.set("accessToken", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 3600, // 1 hour
    });

    return res;
  } catch (error) {
    console.error("Error in callback:", error);
    return NextResponse.redirect("/error?message=invalid_token");
  }
}
