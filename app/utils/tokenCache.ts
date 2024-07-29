import fs from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "token-cache.json");

interface TokenCache {
  access_token: string;
  expires_at: number;
}

function readCache(): TokenCache | null {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading cache file:", error);
  }
  return null;
}

function writeCache(cache: TokenCache): void {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache), "utf8");
  } catch (error) {
    console.error("Error writing cache file:", error);
  }
}

export function getToken(): string | null {
  const cache = readCache();
  if (cache && cache.expires_at > Date.now()) {
    return cache.access_token;
  }
  return null;
}

export function setToken(access_token: string, expires_in: number): void {
  const cache: TokenCache = {
    access_token,
    expires_at: Date.now() + expires_in * 1000,
  };
  writeCache(cache);
}
