import { NextApiRequest, NextApiResponse } from "next";

const SPOTIFY_TOKEN_KEY = "spotify_access_token";
const SPOTIFY_TOKEN_EXPIRY_KEY = "spotify_token_expiry";

async function refreshAccessToken() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/refresh-token`,
    {
      method: "GET",
    }
  );
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

export function withSpotifyToken(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    token: string
  ) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    let token = (global as any)[SPOTIFY_TOKEN_KEY];
    let tokenExpiry = (global as any)[SPOTIFY_TOKEN_EXPIRY_KEY];

    if (!token || !tokenExpiry || Date.now() > tokenExpiry) {
      try {
        const { access_token, expires_at } = await refreshAccessToken();
        (global as any)[SPOTIFY_TOKEN_KEY] = access_token;
        (global as any)[SPOTIFY_TOKEN_EXPIRY_KEY] = expires_at;
        token = access_token;
      } catch (error) {
        console.error("Failed to refresh token:", error);
        res.status(500).json({ error: "Failed to refresh access token" });
        return;
      }
    }

    await handler(req, res, token);
  };
}
