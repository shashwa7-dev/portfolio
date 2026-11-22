import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parsePlaylist, renderPlaylist, validTracks, youTubeId } from "@/lib/gta6/playlistFile";

/**
 * The dev-only playlist editor's API (`/dev/radio`). Under `npm run dev` it
 * reads and rewrites `components/gta6/track.ts` on disk; in any other build
 * it is a 404, so nothing here can run on the live site.
 *
 * GET              the list as written in track.ts
 * GET ?lookup=URL  { id, title, artist } from YouTube's public oEmbed
 * PUT  [tracks]    writes the list back to track.ts
 */
export const dynamic = "force-dynamic";

const FILE = path.join(process.cwd(), "components/gta6/track.ts");
const dev = process.env.NODE_ENV === "development";
const notFound = () => new Response("Not found", { status: 404 });

export async function GET(req: Request) {
  if (!dev) return notFound();
  const lookup = new URL(req.url).searchParams.get("lookup");
  if (lookup !== null) {
    const id = youTubeId(lookup);
    if (!id) return Response.json({ error: "That is not a YouTube link." }, { status: 400 });
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
      if (!res.ok) return Response.json({ id, title: "", artist: "" });
      const o = (await res.json()) as { title?: string; author_name?: string };
      return Response.json({ id, title: o.title ?? "", artist: (o.author_name ?? "").replace(/VEVO$|\s-\sTopic$/, "") });
    } catch {
      // Offline or YouTube unreachable: the id is enough; type the names in.
      return Response.json({ id, title: "", artist: "" });
    }
  }
  return Response.json(parsePlaylist(await readFile(FILE, "utf8")));
}

export async function PUT(req: Request) {
  if (!dev) return notFound();
  const tracks = validTracks(await req.json().catch(() => null));
  if (!tracks) return Response.json({ error: "Every track needs a YouTube id and a title." }, { status: 400 });
  await writeFile(FILE, renderPlaylist(await readFile(FILE, "utf8"), tracks));
  return Response.json(tracks);
}
