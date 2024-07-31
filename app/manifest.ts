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
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-256x256.png",
        sizes: "256x256",
        type: "image/png",
      },
    ],
    theme_color: "#efefef",
    background_color: "#efefef",
    display: "standalone",
  };
}
