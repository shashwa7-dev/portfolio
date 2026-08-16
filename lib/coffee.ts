/**
 * Coffee I have drunk, grouped by roaster.
 *
 * Beans hang off a roaster rather than sitting in one flat list, because the
 * shelf page picks a roaster first and then shows what came from them. A flat
 * array would need grouping at render time in every consumer.
 *
 * `rating` is out of 5 and is explicitly personal. It scores how much I wanted
 * to finish the bag, not how good the coffee is, which is why a well made
 * Kenyan sits at 2. The page says so next to the list; without that sentence
 * the numbers would be misleading.
 */

export type Bean = {
  name: string;
  /** Roast as the roaster labels it. Not comparable across brands. */
  roast: "Light" | "Medium" | "Medium-dark" | "Dark" | "Instant";
  /** Origin or estate, when the bag names one. Blends leave it out. */
  origin?: string;
  /** 1 to 5. Omitted entirely for something queued rather than tasted. */
  rating?: number;
  note: string;
  /** Optional read-more, for a bean the coffee page has more to say about. */
  link?: { href: string; label: string };
};

export type Roaster = {
  slug: string;
  name: string;
  /** Sits in `public/shelf/roasters/`. Omit to fall back to initials. */
  logo?: string;
  /** Currently in the cupboard, as opposed to tried once and moved on. */
  inRotation?: boolean;
  beans: Bean[];
};

export const roasters: Roaster[] = [
  {
    slug: "blue-tokai",
    name: "Blue Tokai",
    logo: "/shelf/roasters/blue-tokai.webp",
    inRotation: true,
    beans: [
      {
        name: "Vienna Roast",
        roast: "Dark",
        rating: 5,
        note: "Deep and smoky without going bitter. The weekday default.",
      },
      {
        name: "French Roast",
        roast: "Dark",
        rating: 4,
        note: "Heaviest of the lot. Holds up to milk better than anything else here.",
      },
      {
        name: "Dhak Blend",
        roast: "Medium-dark",
        rating: 4,
        note: "Rounder than the Vienna, less smoke. A good middle ground.",
      },
      {
        name: "Basankhan Estate",
        roast: "Medium-dark",
        origin: "Chikmagalur",
        rating: 3,
        note: "Cleaner and lighter than I usually go for. Interesting once.",
      },
    ],
  },
  {
    slug: "araku",
    name: "Araku",
    logo: "/shelf/roasters/araku.svg",
    inRotation: true,
    beans: [
      // Deliberately described by roast rather than by product name: Araku sell
      // several dark bags and naming the wrong one would be a worse error than
      // being general. Swap in the actual bag when the next one is open.
      {
        name: "Araku Valley, dark",
        roast: "Dark",
        origin: "Araku Valley",
        rating: 3,
        note: "Grown and roasted in the valley it is named after, which is rare enough here to be worth the shelf space on its own.",
      },
    ],
  },
  {
    slug: "starbucks",
    name: "Starbucks",
    logo: "/shelf/roasters/starbucks.webp",
    beans: [
      {
        name: "House Blend",
        roast: "Medium",
        rating: 3,
        note: "Easy to find and easy to drink. Fine when I am away from my own kitchen. Worth knowing that Starbucks roast a good notch darker than the label suggests.",
      },
      {
        name: "Kenya",
        roast: "Medium",
        origin: "Single origin",
        rating: 2,
        note: "Kenyan coffee is famously bright and fruity, which is exactly the profile I keep saying I do not reach for. Good coffee, wrong cup for me, and a fair test of whether these ratings mean anything.",
      },
    ],
  },
  {
    slug: "nescafe",
    name: "Nescafé",
    logo: "/shelf/roasters/nescafe.webp",
    inRotation: true,
    beans: [
      {
        name: "Dark Roast",
        roast: "Instant",
        rating: 4,
        note: "In the cupboard on purpose, and I still get through plenty of it. Let us be honest, this is where all of us started.",
        link: {
          href: "/coffee#instant",
          label: "We all started here",
        },
      },
    ],
  },
];

/** Initials for a roaster with no logo, so the picker never shows a blank disc. */
export function roasterInitials(name: string) {
  return name.slice(0, 2);
}

/**
 * Subreddits I actually read.
 *
 * Kept here rather than in `bookmarks.ts` because these are places to go and
 * talk, not links to read once, and the coffee page is where someone is when
 * they want more than the page has.
 */
export type Community = {
  handle: string;
  url: string;
  what: string;
};

export const communities: Community[] = [
  {
    handle: "r/IndiaCoffee",
    url: "https://www.reddit.com/r/IndiaCoffee/",
    what: "Indian roasters, Indian prices, and people solving the same shipping and humidity problems you are. The most useful of the four if you are here.",
  },
  {
    handle: "r/espresso",
    url: "https://www.reddit.com/r/espresso/",
    what: "Dial-in help, machine repairs, and a steady stream of people posting a shot and asking what went wrong. Read the answers even when the question is not yours.",
  },
  {
    handle: "r/JamesHoffmann",
    url: "https://www.reddit.com/r/JamesHoffmann/",
    what: "Discussion around the videos, plus the follow-up questions the videos leave open.",
  },
  {
    handle: "r/latteart",
    url: "https://www.reddit.com/r/latteart/",
    what: "Pure practice and encouragement. Worth it for how patient people are with beginners posting their first blob.",
  },
];
