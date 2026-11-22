import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import {
  type PlaylistChanges,
  parsePlaylist,
  playlistChanges,
  renderPlaylist,
  type TrackEntry,
  validTracks,
} from "@/lib/gta6/playlistFile";

/**
 * Dev only: "Create update PR on GitHub" on `/dev/radio`. Opens a pull
 * request that changes only `components/gta6/track.ts` to the given list,
 * without touching your checkout: it works in a temporary git worktree on a
 * fresh `radio/playlist-<time>` branch cut from origin's `master` (or, while
 * track.ts is not on master yet, from the branch you are on), commits, pushes
 * and runs `gh pr create`. Needs `git` and an authenticated `gh` locally.
 * Any build other than `npm run dev` is a 404.
 */
export const dynamic = "force-dynamic";

const run = promisify(execFile);
const ROOT = process.cwd();
const FILE = "components/gta6/track.ts";

const git = (args: string[], cwd = ROOT) => run("git", args, { cwd }).then((r) => r.stdout.trim());
const exists = (ref: string) => git(["cat-file", "-e", `${ref}:${FILE}`]).then(() => true, () => false);

function describe(ch: PlaylistChanges): string {
  const name = (t: TrackEntry) => `${t.title} (${t.artist || "unknown"}), https://youtu.be/${t.id}`;
  const part = (head: string, list: TrackEntry[]) => (list.length ? [`**${head}**`, ...list.map((t) => `- ${name(t)}`), ""] : []);
  return [
    "Playlist update from the dev editor (`/dev/radio`). Only `components/gta6/track.ts` changes.",
    "",
    ...(ch.theme ? [`**New theme song:** ${name(ch.theme)}`, ""] : []),
    ...part("Added", ch.added),
    ...part("Removed", ch.removed),
    ...part("Title or artist edited", ch.edited),
    ...(ch.reordered ? ["The order changed (only the theme's place is heard: the rest are shuffled).", ""] : []),
  ].join("\n");
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") return new Response("Not found", { status: 404 });
  const tracks = validTracks(await req.json().catch(() => null));
  if (!tracks) return Response.json({ error: "Every track needs a YouTube id and a title." }, { status: 400 });

  let base = "master";
  try {
    await git(["fetch", "--quiet", "origin", base]);
    if (!(await exists(`origin/${base}`))) {
      base = await git(["rev-parse", "--abbrev-ref", "HEAD"]);
      await git(["fetch", "--quiet", "origin", base]).catch(() => {});
      if (!(await exists(`origin/${base}`))) {
        return Response.json({ error: `track.ts is not on origin/master or origin/${base} yet. Push your branch first.` }, { status: 409 });
      }
    }
  } catch (e) {
    return Response.json({ error: `Could not reach GitHub: ${String(e instanceof Error ? e.message : e).split("\n")[0]}` }, { status: 502 });
  }

  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
  const branch = `radio/playlist-${stamp}`;
  const dir = path.join(os.tmpdir(), `vice-fm-${stamp}`);
  try {
    await git(["worktree", "add", "--quiet", "-b", branch, dir, `origin/${base}`]);
    const file = path.join(dir, FILE);
    const source = await readFile(file, "utf8");
    const changes = playlistChanges(parsePlaylist(source), tracks);
    if (!changes.added.length && !changes.removed.length && !changes.edited.length && !changes.reordered) {
      return Response.json({ error: `The list is the same as on ${base}. Nothing to send.` }, { status: 409 });
    }
    await writeFile(file, renderPlaylist(source, tracks));
    await git(["add", FILE], dir);
    await git(["commit", "--quiet", "-m", "Vice FM: update the playlist"], dir);
    await git(["push", "--quiet", "-u", "origin", branch], dir);
    const { stdout } = await run(
      "gh",
      ["pr", "create", "--base", base, "--head", branch, "--title", "Vice FM: update the playlist", "--body", describe(changes)],
      { cwd: dir },
    );
    return Response.json({ url: stdout.trim().split("\n").pop(), base });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: `Could not open the PR: ${msg.split("\n")[0]}` }, { status: 500 });
  } finally {
    // The branch lives on origin now (or was never pushed): drop the local one.
    await git(["worktree", "remove", "--force", dir]).catch(() => {});
    await git(["branch", "-D", branch]).catch(() => {});
  }
}
