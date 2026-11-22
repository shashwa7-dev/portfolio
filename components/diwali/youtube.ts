/**
 * The Diwali show's view of the shared YouTube player: the same API loader and
 * player, with the Diwali song's video, end point and title filled in.
 */

import {
  createPlayer as createYouTubePlayer,
  primeYouTube,
  type YouTubePlayer,
} from "@/components/common/youtube";
import { VIDEO_END_SECONDS } from "@/lib/diwali/show";
import { VIDEO_ID } from "@/lib/diwali/video";

export { primeYouTube };

export type DiwaliPlayer = YouTubePlayer;

/** Builds the Diwali song's player. See `createPlayer` in the shared module. */
export function createPlayer(
  host: HTMLElement,
  handlers: Parameters<typeof createYouTubePlayer>[2],
): DiwaliPlayer {
  return createYouTubePlayer(
    host,
    { videoId: VIDEO_ID, end: VIDEO_END_SECONDS, title: "The Diwali Song" },
    handlers,
  );
}
