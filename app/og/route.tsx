import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

const LABELS: Record<string, string> = {
  home: "Portfolio",
  project: "Case Study",
  post: "Writing",
  books: "Reading",
  generic: "",
};

/**
 * Fonts and the backdrop, read once per process rather than per request.
 *
 * This route is hit by crawlers, and every hit used to do three disk reads plus a
 * base64 encode before rendering anything. The result never varies, so it is
 * memoised. The promise is created on first request rather than at module load:
 * a module-level promise that rejects becomes an unhandled rejection at import
 * time, which can take the process down, whereas awaiting it inside the handler
 * turns the same failure into a 500.
 *
 * The backdrop is the footer's halftone, so a shared link looks like the site it
 * points at, and it is inlined as a data URI rather than fetched. Satori resolves
 * remote images at render time, which would put a network round trip in front of
 * every card and fail outright in local development, where the absolute URL is
 * not reachable.
 *
 * It is a separate, deliberately tiny asset: 300x158, about 12KB, upscaled 4x to
 * fill the card. The footer's own file is a 1.7MB 4096px webp, and satori cannot
 * decode webp anyway, but size matters here for a second reason. ImageResponse
 * emits PNG, and a halftone is close to the worst case for PNG since every dot is
 * an edge. Measured against the running route, the same card came out at 1150KB
 * from a 900px source, 660KB from this one and 440KB from a 160px source. 300px
 * is where the texture still reads as a halftone rather than a grey wash, and the
 * upscale softens the dots into tone, which is what buys the compression back.
 *
 * Greyscale is baked into the file because satori supports no CSS filters. The
 * source is already cropped to roughly the card's aspect ratio, so `objectFit`
 * has almost nothing left to do.
 */
type OgAssets = { dmRegular: Buffer; dmSemiBold: Buffer; backdropSrc: string };
let assetsPromise: Promise<OgAssets> | null = null;

function loadAssets(): Promise<OgAssets> {
  assetsPromise ??= Promise.all([
    readFile(join(process.cwd(), "public/fonts/DMSans-Regular.woff")),
    readFile(join(process.cwd(), "public/fonts/DMSans-SemiBold.woff")),
    readFile(join(process.cwd(), "public/og-backdrop.jpg")),
  ]).then(([dmRegular, dmSemiBold, backdrop]) => ({
    dmRegular,
    dmSemiBold,
    backdropSrc: `data:image/jpeg;base64,${backdrop.toString("base64")}`,
  }));
  return assetsPromise;
}

/**
 * Query text is clamped before it is rendered. This endpoint takes its copy from
 * the URL, so without a bound anyone can point it at arbitrary text and get a
 * card served from this domain, and a long enough title simply overflows the
 * canvas. The limits sit above anything the site itself passes.
 */
function clamp(value: string, max: number) {
  const trimmed = value.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}\u2026` : trimmed;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = clamp(url.searchParams.get("title") || "Shashwat Tripathi", 90);
  const subtitle = clamp(url.searchParams.get("subtitle") || "", 160);
  const type = url.searchParams.get("type") || "generic";
  const label = clamp(url.searchParams.get("label") || LABELS[type] || "", 24);

  const { dmRegular, dmSemiBold, backdropSrc } = await loadAssets();


  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          position: "relative",
          background: "#0E0D0C",
        }}
      >
        {/* Backdrop, held well back so it reads as texture and never competes
            with the title. */}
        {/* A plain <img> is required: this tree is rendered by satori into a
            static image, not by React into a DOM, so next/image has nothing to
            optimise and alt text has no reader. Both rules are suppressed
            rather than satisfied for that reason. */}
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img
          src={backdropSrc}
          width={1200}
          height={630}
          style={{
            position: "absolute",
            inset: 0,
            width: "1200px",
            height: "630px",
            objectFit: "cover",
            opacity: 0.28,
          }}
        />
        {/* Gradient — satori supports circle radial-gradient */}
        <div
          style={{
            position: "absolute",
            top: -150,
            right: -150,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(241,240,239,0.18) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        {/* Content layer */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {label ? (
              <div
                style={{
                  fontFamily: "DM Sans",
                  fontSize: 22,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  color: "#F1F0EF",
                }}
              >
                {label}
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              style={{
                fontFamily: "DM Sans",
                fontWeight: 600,
                fontSize: title.length > 40 ? 64 : 80,
                lineHeight: 1.02,
                letterSpacing: -2,
                color: "#F1F0EF",
              }}
            >
              {title}
            </div>
            {subtitle ? (
              <div style={{ fontFamily: "DM Sans", fontSize: 30, color: "#A6A29B", maxWidth: 900 }}>
                {subtitle}
              </div>
            ) : null}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "DM Sans",
              fontSize: 24,
              color: "#A6A29B",
            }}
          >
            <span style={{ color: "#F1F0EF", fontWeight: 600 }}>Shashwat Tripathi</span>
            <span>shashwa7.in</span>
          </div>
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
