/**
 * The four roast levels, written for someone who has never bought whole beans.
 *
 * Two deliberate omissions, both because the sources disagree with each other:
 *
 * Temperatures are described by what you can hear rather than by numbers. First
 * crack is variously reported anywhere from 170C to 207C, because the figure is
 * a probe reading and every roasting machine puts its probe somewhere slightly
 * different. The cracks themselves are the same event on every machine.
 *
 * Nothing here claims a roast level is a standard. There is no agreed scale,
 * and as of 2025 the SCA still has no finalised colour standard, so a roaster's
 * "medium" is a statement about their own range and nothing else.
 */

export type Fit = "great" | "works" | "tricky";

export type RoastStop = {
  name: string;
  swatch: string;
  /** What the roaster did, in terms a reader can picture. */
  inTheRoaster: string;
  acidity: number;
  acidityHint: string;
  body: number;
  bodyHint: string;
  taste: string;
  brews: { method: string; fit: Fit; why: string }[];
  /** The one line worth carrying out of the section. */
  remember: string;
};

export const ROAST_STOPS: RoastStop[] = [
  {
    name: "Light",
    swatch: "hsl(30 25% 62%)",
    inTheRoaster:
      "Pulled out as soon as the beans start popping. The beans are dry to the touch and the palest brown of the four.",
    acidity: 5,
    acidityHint: "Bright, the way a green apple is bright. Not the same as sour.",
    body: 2,
    bodyHint: "Light in the mouth. Closer to tea than to milk.",
    taste:
      "Lemon, berry, flowers, sometimes something like black tea. This is the roast where you taste where the coffee was grown, because the fire has not covered it up yet.",
    brews: [
      { method: "Pour over", fit: "great", why: "The paper filter keeps it clean, which is the whole point of buying light." },
      { method: "French press", fit: "works", why: "You gain body and lose the clarity you paid for." },
      { method: "Espresso", fit: "tricky", why: "Real and respected, just the hardest. Needs a good grinder and patience." },
      { method: "Latte, cappuccino", fit: "tricky", why: "Milk flattens the delicate notes and what survives can read as sour." },
      { method: "Cold brew", fit: "works", why: "Comes out fruity and tea-like, if that is what you are after." },
      { method: "Moka pot", fit: "tricky", why: "Works, but expect flavours you were not looking for." },
    ],
    remember:
      "Light roast is the fruit end of the range. Brew it in paper, drink it black, and you are tasting the farm rather than the fire.",
  },
  {
    name: "Medium",
    swatch: "hsl(28 28% 44%)",
    inTheRoaster:
      "Left in well past the first round of popping, but taken out before the second one starts.",
    acidity: 3,
    acidityHint: "Present but settled down. Nothing jumps out at you.",
    body: 3,
    bodyHint: "Fuller. It starts to feel like a drink rather than an infusion.",
    taste:
      "Caramel, milk chocolate, toasted nuts, a little fruit behind it. This is the sweetest part of the whole range, because the sugars have browned without burning.",
    brews: [
      { method: "Pour over", fit: "great", why: "Sweet and balanced, and it forgives a sloppy pour." },
      { method: "French press", fit: "great", why: "Rounds it out further. Hard to get wrong." },
      { method: "Espresso", fit: "great", why: "Extracts easily, so you spend less time fighting the grinder." },
      { method: "Latte, cappuccino", fit: "works", why: "Good, though a medium-dark cuts through milk better." },
      { method: "Cold brew", fit: "great", why: "Sweet and smooth without going bitter." },
      { method: "Moka pot", fit: "great", why: "The roast most moka pot guides assume you are using." },
    ],
    remember:
      "If you have never bought whole beans before, buy this one. It is the most forgiving roast in every single brewing method, so a mistake still tastes fine.",
  },
  {
    name: "Medium-dark",
    swatch: "hsl(25 30% 28%)",
    inTheRoaster:
      "Taken right up to the second round of popping. Oil starts appearing on the surface of the beans.",
    acidity: 2,
    acidityHint: "Mostly gone. The brightness has turned into sweetness.",
    body: 4,
    bodyHint: "Full and slightly syrupy. It coats your mouth.",
    taste:
      "Dark chocolate, molasses, a bit of baking spice. The fruit has turned into something rounder and heavier, and the roast is starting to speak louder than the farm.",
    brews: [
      { method: "Pour over", fit: "works", why: "Fine, but you are spending clarity on a coffee with less to reveal." },
      { method: "French press", fit: "great", why: "Body on body. This is a comfortable pairing." },
      { method: "Espresso", fit: "great", why: "The classic sweet spot, and the easiest place to learn to dial in." },
      { method: "Latte, cappuccino", fit: "great", why: "Best in class. Chocolate and nut survive a jug of milk. Lemon and jasmine do not." },
      { method: "Cold brew", fit: "great", why: "Smooth and chocolatey, and very good over ice." },
      { method: "Moka pot", fit: "great", why: "Rich and forgiving." },
    ],
    remember:
      "This is the milk drink roast. If you mostly make lattes at home, start here and stop reading the light roast reviews.",
  },
  {
    name: "Dark",
    swatch: "hsl(22 25% 16%)",
    inTheRoaster:
      "Taken all the way through the second round of popping. Nearly black, and visibly oily.",
    acidity: 1,
    acidityHint: "Effectively none. Over eight tenths of the acid is gone by here.",
    body: 5,
    bodyHint: "Heaviest of the four, though it can taste hollow if pushed too far.",
    taste:
      "Smoke, cocoa, toast, a bittersweet edge. At this point you are tasting the roaster's fire rather than the farm, which is a real choice and not a failure.",
    brews: [
      { method: "Pour over", fit: "works", why: "Good black. Grind coarser and use slightly cooler water than usual." },
      { method: "French press", fit: "great", why: "The traditional home for this roast." },
      { method: "Espresso", fit: "works", why: "Extracts very easily, which is also how it turns to ash if you overshoot." },
      { method: "Latte, cappuccino", fit: "great", why: "Cuts through milk harder than anything else. This is Italian cappuccino logic." },
      { method: "Cold brew", fit: "great", why: "The traditional choice. Smooth, sweet and chocolatey." },
      { method: "Moka pot", fit: "works", why: "Grind coarser than you think, or it turns bitter." },
    ],
    remember:
      "Dark is not stronger, it is bolder. Strength is how much coffee you used. Buy it in small bags and drink it quickly, because those surface oils go stale.",
  },
];
