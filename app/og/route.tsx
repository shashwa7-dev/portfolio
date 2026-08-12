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

  const [dmRegular, dmSemiBold] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/DMSans-Regular.woff")),
    readFile(join(process.cwd(), "public/fonts/DMSans-SemiBold.woff")),
  ]);

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
        {/* Gradient — satori supports circle radial-gradient */}
        <div
          style={{
            position: "absolute",
            top: -150,
            right: -150,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(241,240,239,0.30) 0%, transparent 70%)",
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
