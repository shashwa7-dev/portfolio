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
};

export type Roaster = {
  slug: string;
  name: string;
  /** Sits in `public/shelf/roasters/`. Omit to fall back to initials. */
  logo?: string;
  url?: string;
  /** Currently in the cupboard, as opposed to tried once and moved on. */
  inRotation?: boolean;
  beans: Bean[];
};

export const roasters: Roaster[] = [
  {
    slug: "blue-tokai",
    name: "Blue Tokai",
    logo: "/shelf/roasters/blue-tokai.webp",
    url: "https://bluetokaicoffee.com",
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
    url: "https://arakucoffee.in",
    inRotation: true,
    beans: [
      {
        name: "Signature Dark",
        roast: "Dark",
        origin: "Araku Valley",
        rating: 3,
        note: "Placeholder name until Shashwat confirms the bag. Araku roast several dark options and inventing one would be worse than leaving this obvious.",
      },
      {
        name: "Next bag",
        roast: "Dark",
        note: "Queued rather than tasted, so it carries no rating.",
      },
    ],
  },
  {
    slug: "starbucks",
    name: "Starbucks",
    logo: "/shelf/roasters/starbucks.webp",
    url: "https://athome.starbucks.com",
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
    url: "https://www.nescafe.com/in/",
    inRotation: true,
    beans: [
      {
        name: "Dark Roast",
        roast: "Instant",
        rating: 4,
        note: "In the cupboard on purpose. Some mornings I want coffee in ninety seconds and I am not going to pretend otherwise.",
      },
    ],
  },
];

/** Initials for a roaster with no logo, so the picker never shows a blank disc. */
export function roasterInitials(name: string) {
  return name.slice(0, 2);
}
