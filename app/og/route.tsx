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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = url.searchParams.get("title") || "Shashwat Tripathi";
  const subtitle = url.searchParams.get("subtitle") || "";
  const type = url.searchParams.get("type") || "generic";
  const label = url.searchParams.get("label") || LABELS[type] || "";

  const [dmRegular, dmSemiBold, backdrop] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/DMSans-Regular.woff")),
    readFile(join(process.cwd(), "public/fonts/DMSans-SemiBold.woff")),
    readFile(join(process.cwd(), "public/og-backdrop.jpg")),
  ]);

  /**
   * The footer's halftone, reused so a shared link looks like the site it points
   * at. Inlined as a data URI rather than fetched over HTTP: satori resolves
   * remote images at render time, which would make every card wait on a network
   * round trip and fail outright in local development where the absolute URL is
   * not reachable.
   *
   * The asset is a separate, much smaller file from the one the footer uses. That
   * one is a 1.7MB 4096px webp, and satori cannot decode webp anyway.
   *
   * It is deliberately tiny, 300x158 and about 12KB, upscaled 4x to fill the
   * card. That is not only about the source: ImageResponse emits PNG, and a
   * halftone is close to the worst case for PNG, since every dot is an edge.
   * Measured against the running route, the same card came out at 1150KB from a
   * 900px source, 640KB from this one, and 440KB from a 160px source. 300px is
   * the point where the texture still reads as a halftone rather than as a grey
   * wash, and upscaling softens the dots into tone, which is what buys the
   * compression back.
   *
   * Greyscale is baked into the file because satori does not support CSS filters.
   */
  const backdropSrc = `data:image/jpeg;base64,${backdrop.toString("base64")}`;

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
            with the title. `objectFit: cover` on a 900x473 source filling
            1200x630 crops a little top and bottom, which is the same framing the
            footer band uses. */}
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
    }
  );
}
