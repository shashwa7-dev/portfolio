/**
 * Swoopy's version history, newest first. Read by the landing page (latest
 * release) and /swoopy/changelog (all of them).
 *
 * `status` is "In review" while the Chrome Web Store is still reviewing a
 * build; set it to "Live" once the update is approved.
 */
export type Release = {
  version: string;
  date: string;
  status: "Live" | "In review";
  summary: string;
  groups: { title: string; items: string[] }[];
};

export const releases: Release[] = [
  {
    version: "1.3.0",
    date: "November 10, 2026",
    status: "Live",
    summary: "Pick anything on the page to inspect it, pick colours from the screen, capture part of a page as a framed image, and a new dock layout.",
    groups: [
      {
        title: "New",
        items: [
          "Pick on page (Alt+Shift+I): hover any image, SVG, video, gradient or text to inspect it, then download, copy or Shift-click to collect images into a ZIP.",
          "Which font is that? Hover a heading and see the font that actually rendered, with its size, weight and colours.",
          "Pick a colour anywhere on screen and copy it as HEX, RGB, HSL or OKLCH, with the nearest colour name.",
          "Capture (Alt+Shift+C): click an element or drag a box, add a background, padding, rounded corners and a shadow, then copy or save it as PNG, WebP or JPEG.",
          "A small Swoopy watermark on captures, which you can turn off in one click.",
          "Settings → Keyboard shortcuts: every shortcut in one place, written the way your OS writes them.",
        ],
      },
      {
        title: "Improved",
        items: [
          "A new layout: tabs in a dock at the bottom, a floating tool dock on Inspect and a floating download bar on Site → Images.",
          "Tooltips on every tool, with its shortcut.",
          "Site → Images: the rescan button lights up when the page loads more images, and new ones are tagged NEW.",
          "Long SVG colour lists show the first 10, with Show all.",
        ],
      },
      {
        title: "Fixed",
        items: [
          "Edit SVG works on inline SVGs that set their size in CSS.",
          "Palettes for chart SVGs that draw with HTML inside.",
        ],
      },
    ],
  },
  {
    version: "1.2.0",
    date: "October 29, 2026",
    status: "Live",
    summary: "A new Site tab that reads any page's images and design, Download as WebP, video downloads and a cleaner panel.",
    groups: [
      {
        title: "New",
        items: [
          "Site tab: every image on the page in one grid, downloaded as a single ZIP, plus Brand (logos, colors, fonts), Design (spacing, radius, icons, copyable tokens), Meta (share preview for X, LinkedIn, Slack and WhatsApp, with checks) and Map (the site's menu links).",
          "Download as WebP, right in the right-click menu, or point at an image and press Alt+Shift+W.",
          "Quick save: point at an image and press Alt+Shift+S.",
          "Save as WebP, PNG or JPEG with a quality setting, and the file size of each shown before you save.",
          "Videos: right-click a video for Download Video, Copy Video Address and Open Video in New Tab. Streaming players save the cover image and say so.",
          "GIFs save as real animated .gif files on Giphy and Tenor, and GIF-style clips on X and Reddit as the original video.",
          "Copy Image Address and Open Image in New Tab.",
          "Copy any image as code: a Markdown, HTML or CSS snippet.",
          "Smart file names: \"8f3a91c2.jpg\" becomes \"golden-retriever-puppy_unsplash.jpg\".",
          "Choose where downloads go: ask every time, or keep them together in a Swoopy folder.",
        ],
      },
      {
        title: "Improved",
        items: [
          "A cleaner panel with Inspect, Site and History tabs, in dark and light.",
          "History shows saved videos with a thumbnail, and opens them in a preview.",
        ],
      },
    ],
  },
  {
    version: "1.0.0",
    date: "October 26, 2026",
    status: "Live",
    summary: "The first release.",
    groups: [
      {
        title: "Launch",
        items: [
          "Right-click Download, Copy Image and Inspect on any image, including CSS backgrounds, inline SVGs, canvases and images under overlays.",
          "Picks the sharpest version the site has.",
          "Color palette with roles and contrast, exported as CSS, JSON, Tailwind or SCSS tokens.",
          "SVG editor: recolor, edit the code and export SVG, PNG, React or React Native.",
          "File details: format, size, transparency, color profile, alt text and camera data.",
          "History of your last 100 images, kept only on your device.",
        ],
      },
    ],
  },
];
