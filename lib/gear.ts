/**
 * Brewing gear, in the order I bought it.
 *
 * Deliberately a sequence rather than a set. Each piece solved the problem the
 * previous one left behind, and that chain is the only interesting thing about
 * a list of kitchen equipment. Rendered as a timeline, so order in this array
 * is the order on the page.
 */

export type GearStep = {
  slug: string;
  name: string;
  /** Short phrase for the timeline marker: "Started here", "Weekends". */
  when: string;
  /** What it is, in two or three words. */
  kind: string;
  image: string;
  /** Where I bought it, shown as the link label. */
  vendor: string;
  url: string;
  /** True for whatever I reach for most on a normal weekday. */
  current?: boolean;
  /**
   * One line for the shelf, the full thing for the long read.
   *
   * Both, rather than truncating `note` at a character count. A note cut to
   * length lands mid-clause and ends on an ellipsis that promises a "more"
   * link the shelf does not have, and the first sentence of each of these is
   * scene-setting rather than the point. So the short version is written to be
   * short: what the thing is, and the one reason it is in the list.
   */
  short: string;
  note: string;
};

export const gear: GearStep[] = [
  {
    slug: "nanopresso",
    name: "Wacaco Nanopresso",
    when: "Started here",
    kind: "Hand pump",
    image: "/shelf/gear/nanopresso.webp",
    vendor: "Something's Brewing",
    url: "https://somethingsbrewing.in/products/wacaco-nanopresso-grey-with-ns-adaptor",
    short:
      "Pump it by hand and it makes a genuinely decent shot. That is what started all of this.",
    note: "My first piece of gear, with a very basic grinder next to it. You pump it by hand and it makes a genuinely decent shot, which is what got me curious about how much further this could go.",
  },
  {
    slug: "flair-pro-2",
    name: "Flair Pro 2",
    when: "The upgrade",
    kind: "Lever press",
    image: "/shelf/gear/flair.webp",
    vendor: "Benki Brewing Tools",
    url: "https://www.benkibrewingtools.com/products/flair-pro2-espresso-maker",
    short:
      "Your own weight pushes the water through, so you feel the pressure build instead of trusting a pump.",
    note: "You pull the arm down and your own weight pushes water through the puck, so you feel the pressure build instead of trusting a pump. James Hoffmann's point was that this gets you espresso close to a machine costing many times more, and he was right.",
  },
  {
    slug: "1zpresso-jx-pro",
    name: "1Zpresso JX-Pro",
    when: "The real bottleneck",
    kind: "Hand grinder",
    image: "/shelf/gear/jxpro.webp",
    vendor: "1Zpresso",
    url: "https://1zpresso.coffee/product/jxpro/",
    short:
      "Once the press was good, the grinder was the weak link. A stepped dial that actually holds its setting.",
    note: "Once the press was good, the grinder was the weak link. Conical burrs and a stepped dial that actually holds its setting, so espresso and pour over are a known number of clicks apart rather than a guess.",
  },
  {
    slug: "budan",
    name: "Budan",
    when: "Weekdays now",
    kind: "Semi-automatic",
    image: "/shelf/gear/budan.webp",
    vendor: "Something's Brewing",
    url: "https://somethingsbrewing.in/products/budan-espresso-machine",
    current: true,
    short:
      "The manual workflow is lovely. It is also fifteen minutes I do not have on a Tuesday.",
    note: "Underneath it is the CRM3605, a chassis sold worldwide under a dozen names, which means 58mm parts are everywhere and the thing is genuinely repairable. The manual workflow is lovely and it is also fifteen minutes I do not have on a Tuesday.",
  },
  {
    slug: "kalita-wave-185",
    name: "Kalita Wave 185",
    when: "Weekends",
    kind: "Pour over",
    image: "/shelf/gear/kalita.webp",
    vendor: "Benki Brewing Tools",
    url: "https://www.benkibrewingtools.com/products/kalita-wave-style-up-185-red",
    short:
      "Saturday mornings I do all of it by hand, because the slow version is the part I enjoy.",
    note: "Flat-bottomed pour over. Saturday mornings I go back to doing all of it by hand, heating the apparatus included, because the slow version is the part I actually enjoy.",
  },
];
