import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "S7.dev",
    short_name: "S7.dev",
    description: "Frontend Engineer | Expert in Crafting Quality Interfaces",
    start_url: "/",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      /**
       * "any", not "maskable". A maskable icon has to survive being cropped to
       * the central 80% circle, which means the artwork must bleed to all four
       * edges with nothing load-bearing near them. This mark is a rounded tile
       * on transparency whose diagonal runs corner to corner, so masking it
       * would clip both ends of the stroke and expose the transparent corners.
       * The previous entries claimed maskable for artwork that was not.
       */
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    theme_color: "#0E0D0C",
    background_color: "#0E0D0C",
    display: "standalone",
  };
}
