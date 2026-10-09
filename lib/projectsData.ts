import { StackName } from "@/components/common/StackIcon";

export type TSideProject = {
  id: string;
  slug: string;
  title: string;
  icon?: string;
  tagline: string;
  /**
   * Flags the newest shipped project, surfaced as a "Recent" badge. Exactly one
   * project should carry it: three did, which made it a category rather than a
   * claim about what is new.
   */
  isRecent?: boolean;
  description: string;
  longDescription?: string;
  highlights: string[];
  thumbnail: string;
  preview?: string;
  screenshots?: string[];
  date?: string;
  links?: {
    github?: string;
    twitter?: string;
    web?: string;
    download?: string;
    producthunt?: string;
  };
  stack: { fe?: StackName[]; be?: StackName[] };
  tags?: string[];
  caseStudy?: {
    role?: string;
    year?: string;
    overview?: string;
    problem?: string;
    constraints?: string[];
    architecture?: string[] | string;
    tradeoffs?: string[] | string;
    performance?: string[] | string;
    results?: { value: string; caption: string }[];
    lessons?: string[] | string;
  };
};

export const sideProjects: TSideProject[] = [
  {
    id: "santul",
    slug: "santul",
    title: "Santul",
    isRecent: true,
    tagline: "Meals, workouts and weight, kept in balance.",
    description:
      "A daily tracker built around Indian food. Log a katori of dal instead of 143 grams of it, scan any pack for an honest A to E grade, and see what you have eaten against what you have burned. It began in 2025 as Eatri8.ai, a food label scanner, and was rebuilt and renamed in October 2026.",
    longDescription: `Santul means balance. The first version, Eatri8.ai, did one thing: read a photo of a food label and say how healthy it was. The rebuild keeps that and wraps a full tracker around it, because a grade is only useful next to what you actually ate that day.

  You log food the way you eat it. Search for dal and add a katori, not a number of grams; a roti is a roti, a glass of milk is a glass. For anything in a packet, scan the barcode, or photograph the label or the plate and let the app read it. Every food gets a grade from A to E for your diet, allergies and goal, with the reasons written out underneath.

  Workouts and weight sit beside the food rather than in a separate app. Log a gym session set by set, or just a walk, and Today shows eaten, burned and what is left as one line.`,
    highlights: [
      "About 14,800 foods from three open datasets, with Indian dishes in real portions",
      "Scan a barcode for free, or photograph a label or a meal and have it read and graded A to E, with the reasons spelled out",
      "Live gym sessions with sets, personal records and a weekly goal, plus a 30-day weight trend",
      "One energy line for the day: eaten, minus burned, equals what is left",
    ],
    thumbnail: "/projects/project_santul.jpg",
    date: "Oct 2026",
    links: {
      web: "https://santul.shashwa7.in/",
      github: "https://github.com/shashwa7-dev/food-analyzer",
    },
    stack: {
      fe: ["next", "react", "typescript", "tailwind", "shadcn", "reactQuery"],
      be: ["postgres", "googleGemini", "cloudflare", "vercel", "vitest"],
    },
    tags: ["Health", "AI", "Next.js"],
    caseStudy: {
      role: "Design and engineering, end to end",
      year: "2026",
      overview:
        "A daily tracker for food, workouts and weight, made for how people in India actually eat. It is personal from the first screen: you tell it your diet, your allergies and your goal, and every grade, warning and target after that is worked out for you rather than for an average person.",
      problem:
        "Most trackers assume packaged Western food weighed in grams. Indian meals are cooked at home and served by the katori, so logging them means guessing. And a calorie count alone does not say whether a food is a good idea for this person, with this diet and these allergies.",
      constraints: [
        "Logging a meal has to take seconds, or it never becomes a habit",
        "It is used one-handed on a phone, so the main action always sits within thumb reach",
        "A grade with no explanation is just a verdict. Every one has to say why",
        "Nothing here is medical advice, and the app has to keep saying so",
      ],
      tradeoffs: [
        "Workouts are shown beside the food and never added back to the calorie target. Eating back exercise is the easiest way to undo a deficit",
        "Five grades, A to E, instead of a score out of 100. A number that precise would claim more than the data can support",
        "Scanning a barcode is always free; reading a photo is limited each month. The free path had to be good enough that most people never notice the limit",
        "One way to sign in, with Google. No passwords to create or forget",
      ],
      lessons: [
        "The slow production site was geography, not code. The functions ran in the United States and the database in Singapore, so every query crossed an ocean. Counting queries per page was worth doing, but measuring where the time went came first.",
        "A check that only passes on your own machine is not a check. One test had been failing in CI for days because it relied on an environment variable being unset, which it never is there.",
        "Errors that are swallowed turn into mysteries. Sign-out quietly stopped working after a domain change because the failure was ignored and the user was sent back into the app.",
      ],
    },
  },
  {
    id: "ganapati",
    slug: "ganapati",
    title: "Ganapati",
    tagline: "A sketchbook of Ganesha studies, hung in two pages.",
    description:
      "An exhibition of 108 studies of Ganesha, catalogued by posture, material, trunk, companion and offering, pinned into an artist's notebook with margin notes, parallax and a like on every work. A second page tells the story of the festival: why he comes home, how it travelled, Lalbaugcha Raja, the hundred and eight names, and visarjan.",
    longDescription: `Every load opens with a short splash that draws the mark, writes the name and the chant, then lifts away into a shower of marigolds. The flute in the header keeps playing across pages because its audio lives in the root layout.

  The whole site renders from one dataset: a plates file describing every prepared image and a curated catalogue that names each work and files it under a posture. A plate without a curated entry still hangs, with neutral defaults, so adding a work is one image and one line.

  Likes are counted through Upstash Redis over REST with no SDK; with the variables unset the store is in memory, so the site runs anywhere.`,
    highlights: [
      "108 works in six posture chapters, every one with a title, material, trunk, companion and offering",
      "A splash that draws the logo, writes the chant and dissolves into marigolds, with a failsafe and skip on click",
      "The Story: five short pages on the festival, the hundred and eight names and why 108, and visarjan",
    ],
    thumbnail: "/projects/project_ganapati.jpg",
    date: "Sep 2026",
    links: {
      web: "https://ganapatibappamoraya.shashwa7.in/",
      github: "https://github.com/shashwa7-dev/ganesha_2026",
    },
    stack: {
      fe: ["next", "react", "typescript", "tailwind"],
      be: ["vercel"],
    },
    tags: ["Art", "Festival", "Next.js"],
  },
  {
    id: "mehfil",
    slug: "mehfil",
    title: "Mehfil",
    tagline: "An evening gathering for music and poetry.",
    description:
      "A web player for golden-era Hindi film music, browsable by singer, composer, lyricist, actor, film, station and mood. The catalogue is built by parsing Saregama's publicly published Carvaan Gold songlist, then resolving and verifying every song against YouTube.",
    longDescription: `Saregama's Carvaan is a physical device: a dial with 66 fixed positions, one axis, pick one. Mehfil is the same catalogue as a query engine, so \`Gulzar lyrics + R.D. Burman music + Lata vocals\` is one click instead of impossible.

  The interesting part is not the player, it is the pipeline behind it. The songlist ships as a PDF. Getting from that to something playable means parsing it column-aware, back-filling the credits it omits, matching each song to a real YouTube upload, and proving that upload still plays.

  Nothing is hosted. Playback streams from official YouTube embeds and the catalogue holds only factual metadata: titles, film names, credits.`,
    highlights: [
      "3,916 songs across 66 stations, browsable by singer, composer, lyricist, actor, film and mood",
      "Back-fills credits the source data never contains: 2,671 songs gain a composer, 2,535 a lyricist, 997 an actor",
      "Every YouTube id verified as actually embeddable, because matched does not mean playable",
      "Six-stage pipeline, each stage independently runnable, idempotent and resumable",
    ],
    thumbnail: "/projects/project_mehfil.jpg",
    date: "2026",
    links: {
      web: "https://mehfil.shashwa7.in/",
      github: "https://github.com/shashwa7-dev/mehfil",
      twitter: "https://x.com/offcod8/status/2086512598531682370",
    },
    stack: {
      fe: ["next", "react", "typescript", "tailwind", "shadcn", "reactQuery"],
      be: ["python", "sqlite", "youtube"],
    },
    tags: ["Music", "Data pipeline", "Next.js"],
    caseStudy: {
      role: "Design and engineering, end to end",
      year: "2026",
      overview:
        "Saregama publish the Carvaan Gold songlist as a public PDF. Mehfil turns that document into a browsable, playable catalogue, and replaces a one-axis dial with composable filters across six credit roles.",
      problem:
        "The device is a dial: 66 fixed positions, one at a time. The same catalogue as a query engine answers questions the dial cannot, but only if the data supports it, and the source is a PDF that credits singers and nothing else.",
      constraints: [
        "The only source of truth is a marketing PDF, not an API",
        "Song entries credit singers only. Composer, lyricist and actor are absent",
        "No audio may be hosted or redistributed, so playback has to be someone else's embed",
        "A matched YouTube id is worthless if the video will not actually embed",
      ],
      architecture: [
        "songlist.pdf to parse to enrich to resolve to verify to export to web app, six stages over one SQLite file",
        "Column-aware PDF extraction: naive text extraction bleeds adjacent columns into each other and corrupts titles",
        "The station trick: the 66 station names imply the roles the per-song rows omit. A song filed under GULZAR was written by him, under R.D. BURMAN composed by him, under REKHA picturised on her",
        "Every write is an UPSERT and no stage deletes resolved rows, so an interrupted run only loses the in-flight batch",
        "Song ids live in an append-only ledger keyed by title and film. Ingest and export both refuse to run if the ids in hand disagree with it",
      ],
      tradeoffs: [
        "Precision over recall on matching. An early matcher that accepted title-only matches produced roughly 380 wrong songs and was scrapped rather than tuned",
        "Ids are append-only rather than recomputed. Resolutions map song id to video and nothing rewrites them, so a shifted id would silently serve the previous song's video under the next song's name",
        "Failed embeds are demoted back to the queue rather than deleted, and dead ids are remembered so later runs never rediscover them",
      ],
      results: [
        { value: "3,916", caption: "songs playable, across 66 stations" },
        { value: "2,671", caption: "songs given a composer the source omitted" },
        { value: "52%", caption: "of a 2017 community dataset still embeddable, which is why verification exists" },
      ],
      lessons: [
        "Matched is not playable. Community data from 2017-18 matched 1,871 songs and only 52 percent still embedded, so verification against YouTube's oEmbed endpoint had to become its own pipeline stage rather than an afterthought.",
        "The parsed catalogue holds 4,310 songs against a marketing figure of 5,000. The PDF is Songlist 1.0 and the shipped device likely carries more, which is worth stating rather than rounding up to the nicer number.",
        "Region restrictions are still invisible. A video can pass the embeddable check and fail to play in a given country, and nothing in this pipeline detects that.",
      ],
    },
  },
  {
    id: "paper-noise",
    slug: "paper-noise",
    title: "PaperNoise",
    tagline: "Where pixels pretend to be paper.",
    description:
      "A small experimental tool to create vintage-style cards with real textures, classic ink palettes, and old-school typography, entirely in the browser.",
    longDescription: `PaperNoise is a small experimental tool to create vintage-style cards with real textures, classic ink palettes, and old-school typography, entirely in the browser.

  No templates. No AI fluff. Just code and texture obsession.

Built with React + Vite, this tool explores browser rendering and export edge cases.`,
    highlights: [
      "Vintage / parchment-style card editor",
      "Custom paper, ink, and texture tint",
      "High-quality PNG export",
      "Export-safe rendering using dom-to-image-more",
    ],
    stack: { fe: ["react", "typescript"] },
    tags: ["web", "tools"],
    caseStudy: {
      role: "Design & Engineering",
      year: "2026",
      overview:
        "PaperNoise renders tactile, print-like cards entirely client-side. The challenge was making screen pixels feel like physical paper, and exporting them at high quality without any server.",
      problem:
        "Existing tools lean on templates or generic filters. I wanted real texture compositing and ink-palette control, with an export that survives the browser's canvas quirks.",
      constraints: [
        "100% client-side, no server rendering or storage",
        "Exports must be deterministic and high-resolution",
        "Runs smoothly on mid-range laptops",
      ],
      architecture: [
        "Layered texture + tint compositing pipeline",
        "Export-safe rendering via dom-to-image-more",
        "Deterministic high-res PNG output",
      ],
      tradeoffs:
        "Chose dom-to-image-more over canvas-native export for fidelity, accepting a larger dependency to avoid cross-browser canvas tainting issues.",
      results: [
        { value: "<1s", caption: "export time" },
        { value: "100%", caption: "client-side" },
        { value: "Launched", caption: "on Product Hunt" },
      ],
      lessons:
        "Texture realism is mostly about blend modes and grain, not resolution. Constraining scope to one beautiful thing shipped faster than a flexible editor would have.",
    },
    links: {
      github: "https://github.com/shashwa7-dev/papernoise-offcod8",
      producthunt: "https://www.producthunt.com/products/papernoise",
      web: "https://papernoise.shashwa7.in/",
    },
    thumbnail: "/projects/papernoise-og.png",
    date: "Jan 2026",
  },
  {
    id: "kiryoku",
    slug: "kiryoku",
    title: "Kiryouku",
    tagline: "Productivity tool that blocks distracting sites",
    description:
      "Desktop productivity tool built with ElectronJS that blocks distracting websites using an HTTP proxy.",
    longDescription: `Kiryouku is a tiny productive tool that blocks distracting sites when you need to focus. Under the hood, it uses a simple HTTP proxy that intercepts requests and blocks blacklisted domains.

I built this after seeing similar features as premium offerings in apps like stayinsession.com. The tool is simple but effective - yes, a VPN could bypass it, but the goal is to add just enough friction to keep you on track.
`,
    highlights: [
      "HTTP proxy-based site blocking",
      "Cross-platform desktop app",
      "Customizable blocklist",
      "Focus session tracking",
    ],
    stack: {
      fe: ["react", "typescript"],
      be: ["electron"],
    },
    links: {
      download: "https://github.com/shashwa7-dev/focus-pro/releases/tag/v0.1.0",
      github: "https://github.com/shashwa7-dev/focus-pro",
      twitter: "https://x.com/offcod8/status/2015526005000327662",
    },
    thumbnail: "/projects/kiryoku.webp",
    date: "Dec 2025",
  },
];

export const getSideProject = (slug: string) =>
  sideProjects.find((p) => p.slug === slug);

export const getAllSideProjects = () => sideProjects;
