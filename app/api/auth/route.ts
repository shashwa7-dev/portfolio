import { NextResponse } from "next/server";
import crypto from "crypto";

const client_id = process.env.SPOTIFY_CLIENT_ID;
const redirect_uri = "http://localhost:3000/api/callback";

const generateRandomString = (length: number) => {
  return crypto.randomBytes(60).toString("hex").slice(0, length);
};

export async function GET() {
  const state = generateRandomString(16);
  const scope =
    "user-read-private user-read-email user-read-playback-state user-read-currently-playing user-read-recently-played user-read-playback-position user-top-read";

  const queryParams = new URLSearchParams({
    response_type: "code",
    client_id: client_id!,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state,
  });

  return NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${queryParams.toString()}`
  );
}
