import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { clients } from "@/lib/clients";
import { stats } from "@/lib/stats";
import { organizations } from "@/lib/workData";

export const runtime = "nodejs";

const LABELS: Record<string, string> = {
  home: "Portfolio",
  project: "Case Study",
  post: "Writing",
  books: "Reading",
  generic: "",
};

/**
 * The card is drawn on the brand mark's own ground.
 *
 * The previous card was near-black under the footer's halftone at 0.28, and the
 * texture ran edge to edge behind the type. A halftone is high-frequency by
 * construction, so every glyph sat on alternating light and dark dots and the
 * effective contrast collapsed wherever a dot landed under a stroke. Facebook
 * and X then re-encode the PNG at low quality, which smears exactly that kind
 * of detail.
 *
 * These two values are lifted from the favicon's own artwork rather than picked
 * to match it: the tile is #F1F0EF and the mark is #0E0D0C. Drawing the card on
 * the same pair means the mark needs no plate of its own, and a share preview
 * and the app icon read as one system.
 */
const GROUND = "#F1F0EF";
const INK = "#0E0D0C";
const BODY = "#57514A";
/**
 * 4.55:1 on the ground, not the 3.3:1 a grey this size normally gets away
 * with. Everything set in FAINT is small, tracked-out caps carrying real
 * content (a stat's unit, a post's length), and the card is re-encoded by
 * every platform that shows it, so the delivered contrast is always lower
 * than the rendered one. It still sits a clear step under BODY at 6.9:1.
 */
const FAINT = "#736C63";
const RULE = "#DCD7CF";

const PAD = 64;

/**
 * Logos are addressed by key, never by path.
 *
 * This route renders whatever the query string asks for, so a `logo=` that took
 * a filename would be a file read driven by the caller: `../../.env` resolves
 * as happily as an org avatar, and the result would come back base64'd inside a
 * PNG served from this domain. The map is built from the org list, so adding an
 * organisation adds its logo here and nothing else can be reached.
 */
const LOGOS: Record<string, string> = Object.fromEntries(
  organizations.map((o) => [o.slug, o.logo])
);

/**
 * Fonts, the mark and the backdrop, read once per process rather than per
 * request. This route is hit by crawlers and the result never varies for a
 * given query, so the disk reads and base64 encodes are memoised. The promise
 * is created on first request rather than at module load: a module-level
 * promise that rejects becomes an unhandled rejection at import time, which can
 * take the process down, whereas awaiting it inside the handler turns the same
 * failure into a 500.
 *
 * The backdrop survives from the old card but no longer sits behind anything.
 * It is a deliberately tiny 300x158 asset, greyscale baked in because satori
 * supports no CSS filters, and it now bleeds from the right edge only, at an
 * opacity where it reads as paper grain. ImageResponse emits PNG and a halftone
 * is close to the worst case for PNG, since every dot is an edge; keeping it
 * small and faint is what keeps the card from doubling in weight.
 *
 * Both images are inlined as data URIs rather than fetched. Satori resolves
 * remote images at render time, which would put a network round trip in front
 * of every card and fail outright in local development, where the absolute URL
 * is not reachable.
 */
type OgAssets = {
  dmRegular: Buffer;
  dmSemiBold: Buffer;
  backdropSrc: string;
  markSrc: string;
};
let assetsPromise: Promise<OgAssets> | null = null;

function loadAssets(): Promise<OgAssets> {
  assetsPromise ??= Promise.all([
    readFile(join(process.cwd(), "public/fonts/DMSans-Regular.woff")),
    readFile(join(process.cwd(), "public/fonts/DMSans-SemiBold.woff")),
    readFile(join(process.cwd(), "public/og-backdrop.jpg")),
    readFile(join(process.cwd(), "public/brand-mark.png")),
  ]).then(([dmRegular, dmSemiBold, backdrop, mark]) => ({
    dmRegular,
    dmSemiBold,
    backdropSrc: `data:image/jpeg;base64,${backdrop.toString("base64")}`,
    markSrc: `data:image/png;base64,${mark.toString("base64")}`,
  }));
  return assetsPromise;
}

/** Org logos are read on demand and then held, since most cards want none. */
const logoCache = new Map<string, Promise<string | null>>();

function loadLogo(key: string): Promise<string | null> {
  const rel = LOGOS[key];
  if (!rel) return Promise.resolve(null);
  let cached = logoCache.get(key);
  if (!cached) {
    const ext = rel.split(".").pop()?.toLowerCase();
    const mime = ext === "png" ? "image/png" : "image/jpeg";
    cached = readFile(join(process.cwd(), "public", rel))
      .then((b) => `data:${mime};base64,${b.toString("base64")}`)
      // A missing avatar must not take the whole card down with it. The layout
      // treats the logo as optional everywhere, so a null just draws without.
      //
      // Only successes stay cached. A failure here need not mean the file is
      // absent: a crawler burst can exhaust file descriptors, and a read during
      // a deploy can catch the directory mid-swap. Holding the rejection would
      // turn either into every card for that org shipping logo-less for the
      // rest of the process, recoverable only by a restart. Dropping the entry
      // costs one retried read and fixes itself.
      .catch(() => {
        logoCache.delete(key);
        return null;
      });
    logoCache.set(key, cached);
  }
  return cached;
}

/**
 * Query text is clamped before it is rendered. This endpoint takes its copy
 * from the URL, so without a bound anyone can point it at arbitrary text and
 * get a card served from this domain, and a long enough title simply overflows
 * the canvas. The limits sit above anything the site itself passes.
 */
function clamp(value: string, max: number) {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  // Cut back to the last word boundary. Slicing at the character limit ended
  // real summaries on fragments like "with built-in rate limiting an…", which
  // reads as a rendering fault rather than as an abbreviation. The fallback
  // covers a single token longer than the limit, which has no boundary to
  // retreat to.
  const cut = trimmed.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * Title size steps down as the title grows, so a two-word project and a full
 * sentence of a blog headline both fill the same optical block rather than one
 * rattling around and the other wrapping to four lines.
 */
function titleSize(title: string) {
  if (title.length > 62) return 54;
  if (title.length > 40) return 64;
  if (title.length > 24) return 76;
  return 86;
}

/** Small caps-and-tracking label, the card's one repeated typographic device. */
function Eyebrow({ children, color = FAINT }: { children: string; color?: string }) {
  return (
    <div
      style={{
        fontFamily: "DM Sans",
        fontSize: 17,
        fontWeight: 600,
        letterSpacing: 3.4,
        textTransform: "uppercase",
        color,
      }}
    >
      {children}
    </div>
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = clamp(url.searchParams.get("title") || "Shashwat Tripathi", 90);
  const subtitle = clamp(url.searchParams.get("subtitle") || "", 160);
  const type = url.searchParams.get("type") || "generic";
  // 18, not 24: the label is set in caps at 3.4px tracking inside a fixed pill,
  // so it runs out of pill well before it runs out of characters. Every label
  // the site itself passes is a single word or two.
  const label = clamp(url.searchParams.get("label") || LABELS[type] || "", 18);
  const meta = clamp(url.searchParams.get("meta") || "", 48);
  const logoKey = url.searchParams.get("logo") || "";

  const { dmRegular, dmSemiBold, backdropSrc, markSrc } = await loadAssets();
  const logoSrc = logoKey ? await loadLogo(logoKey) : null;

  const isHome = type === "home";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: GROUND,
          padding: `${PAD}px`,
          fontFamily: "DM Sans",
        }}
      >
        {/* Grain, bleeding from the right edge only. It never crosses under the
            title column, which is what the old full-bleed backdrop did. */}
        {/* A plain <img> is required: this tree is rendered by satori into a
            static image, not by React into a DOM, so next/image has nothing to
            optimise and alt text has no reader. Both rules are suppressed
            rather than satisfied for that reason. */}
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img
          src={backdropSrc}
          width={520}
          height={630}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "520px",
            height: "630px",
            objectFit: "cover",
            opacity: 0.25,
          }}
        />
        {/* Feathers the grain's left edge into the ground.

            Satori has no masks and no filters, so the image cannot fade itself;
            cropping it to a box leaves a hard vertical seam down the card where
            the texture starts, which reads as a misplaced rectangle rather than
            as paper. A gradient of the ground colour laid over the same box,
            opaque at the seam and clear by the time it reaches the edge, does
            the same job with the one primitive satori does support.

            The stops move with the texture's opacity. At 0.1 the grain was
            faint enough that clearing by 78% hid the seam on its own; at
            0.25 there is two and a half times as much of it to hide, so the
            ground holds opaque for the first 12% and does not clear until
            92%. Raise the opacity again and these have to follow, or the
            crop reappears as a vertical line down the card. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "520px",
            height: "630px",
            display: "flex",
            background: `linear-gradient(to right, ${GROUND} 0%, ${GROUND} 12%, rgba(241, 240, 239, 0) 92%)`,
          }}
        />

        {/* Header: the mark and wordmark, with the section label opposite. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img src={markSrc} width={38} height={38} />
            <div
              style={{
                fontSize: 27,
                fontWeight: 600,
                letterSpacing: -0.5,
                color: INK,
              }}
            >
              shashwa7.in
            </div>
          </div>
          {label ? (
            <div
              style={{
                display: "flex",
                border: `1px solid ${RULE}`,
                borderRadius: "999px",
                padding: "9px 20px 10px",
              }}
            >
              <Eyebrow color={BODY}>{label}</Eyebrow>
            </div>
          ) : null}
        </div>

        {/* Body. `flex: 1` with centred content keeps the title optically
            anchored whether or not a subtitle, logo or stat strip is present,
            instead of the block sliding up the card as parts are omitted. */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: isHome ? "34px" : "22px",
          }}
        >
          {logoSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */
            <img
              src={logoSrc}
              width={62}
              height={62}
              /* The hairline is what makes a logo on a white plate read as a
                 contained avatar rather than as a lighter patch of the card.
                 Org avatars are supplied artwork and several are white-backed,
                 which does not match the ground and cannot be made to. */
              style={{
                width: "62px",
                height: "62px",
                borderRadius: "14px",
                objectFit: "cover",
                border: `1px solid ${RULE}`,
              }}
            />
          ) : null}

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div
              style={{
                fontWeight: 600,
                /* Home caps at 82 rather than taking the scale's 86, because it
                   is the one card with a stat strip and a client list under the
                   title and so has the least room for it. `min` rather than a
                   flat 82: `type` and `title` both come from the query string,
                   so a 90-character home title is reachable from outside the
                   site, and pinning the size meant it ran through the header
                   pill and the footer instead of stepping down. */
                fontSize: isHome ? Math.min(82, titleSize(title)) : titleSize(title),
                lineHeight: 1.04,
                letterSpacing: -2.4,
                color: INK,
                maxWidth: "900px",
              }}
            >
              {title}
            </div>
            {subtitle ? (
              <div
                style={{
                  fontSize: 29,
                  lineHeight: 1.35,
                  color: BODY,
                  maxWidth: "840px",
                }}
              >
                {subtitle}
              </div>
            ) : null}
          </div>

          {/* The site card carries evidence, not just identity: a share of the
              homepage should answer "why this person" before anyone clicks. */}
          {isHome ? (
            <div style={{ display: "flex", gap: "56px" }}>
              {stats.slice(0, 3).map((s) => (
                <div key={s.n} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ fontSize: 46, fontWeight: 600, letterSpacing: -1.4, color: INK }}>
                    {s.n}
                  </div>
                  <Eyebrow>{s.c}</Eyebrow>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Footer, under a hairline. Home spends it on borrowed credibility;
            every other card spends it on authorship and context. */}
        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <div style={{ display: "flex", height: "1px", background: RULE }} />
          {isHome ? (
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <Eyebrow>Worked with</Eyebrow>
              <div style={{ fontSize: 23, fontWeight: 600, color: BODY }}>
                {clients.map((c) => c.name).join("   ·   ")}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 23,
              }}
            >
              <span style={{ color: INK, fontWeight: 600 }}>Shashwat Tripathi</span>
              <Eyebrow>{meta || "Frontend Engineer"}</Eyebrow>
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "DM Sans", data: dmRegular, weight: 400, style: "normal" },
        { name: "DM Sans", data: dmSemiBold, weight: 600, style: "normal" },
      ],
      // The image is a pure function of the query string, so it can be cached
      // hard. Crawlers refetch these far more often than the content changes.
      headers: {
        "cache-control": "public, immutable, no-transform, max-age=604800",
      },
    }
  );
}
