/**
 * The non-coffee half of the shelf: what I work on and what I wear.
 *
 * No purchase links here, unlike `gear.ts`. The coffee gear links out because
 * I am recommending specific shops I actually bought from and would send
 * someone to. A laptop and a phone need no such help, and dropping in a
 * marketplace link nobody asked for is how a personal page starts reading like
 * an affiliate page.
 */

export type SetupItem = {
  name: string;
  /** What it is for, in a few words. */
  role: string;
  note?: string;
};

export const setup: SetupItem[] = [
  {
    name: "MacBook Air, M4",
    role: "Personal",
    note: "Everything on this site was built on it, the portrait engine included. Silent, and it never gets warm enough to notice.",
  },
  {
    name: "MacBook Pro, M4",
    role: "Work",
    note: "The office machine. Same keyboard, more fans.",
  },
  {
    name: "OnePlus Nord CE4",
    role: "Phone",
    note: "Does the job. I am not precious about phones.",
  },
];

export type Scent = {
  name: string;
  house: string;
  note: string;
};

export const scents: Scent[] = [
  {
    name: "Cool Water",
    house: "Davidoff",
    note: "Older than I am and still the one I reach for. Mint and citrus over something salty. It is not subtle and it is not trying to be.",
  },
  {
    name: "Aftershave",
    house: "Fraganote",
    note: "A Delhi house making fragrance for Indian weather, which turns out to matter more than I expected. Lemon up front, cedarwood and sage underneath. Sits close to the skin rather than announcing itself down a corridor.",
  },
];
