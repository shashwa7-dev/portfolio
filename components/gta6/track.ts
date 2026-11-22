/**
 * Vice FM: the owner's playlist, in order. The first entry is the theme song,
 * Tom Petty's "Love Is A Long Road" (owner, 2026-11-22; it replaced the
 * official main theme), which always plays first; the rest follow, shuffled. Titles and artists were
 * read once from YouTube's public oEmbed (2026-11-21) and tidied by hand, so the
 * list shows real names before a track has ever been played.
 *
 * Only the lazy GTA 6 chunk may import this file (through `useMusic` and
 * `Radio`): it must never sit in a file a server component imports statically.
 */
export type Track = { id: string; title: string; artist: string };

export const PLAYLIST: readonly Track[] = [
  { id: "xAgUYyosqVM", title: "Love Is A Long Road", artist: "Tom Petty" },
  { id: "5dPwBWvmcbQ", title: "Flower In A Hurricane", artist: "Justice ft. Tame Impala, SZA, King Gizzard & the Lizard Wizard" },
  { id: "IeqQ-UWgxuY", title: "X", artist: "Jhayco" },
  { id: "9RN2aNH0BKU", title: "Dance With Me (feat. Elkan)", artist: "A Boogie wit da Hoodie" },
  { id: "2FRnfzphm8s", title: "Bigger", artist: "Burna Boy" },
  { id: "7ySjFIG3s48", title: "Lets Rock", artist: "Kodak Black and Don Toliver" },
  { id: "7oEceZdFZlk", title: "WAKIN UP FLEX", artist: "Young Thug" },
  { id: "8DSBy4G4IeA", title: "TF?", artist: "Don Toliver" },
  { id: "2-V8kYT1pvE", title: "I'm Broken", artist: "Pantera" },
  { id: "Wp6UBRv9rug", title: "Rock 'n' Roll Fantasy", artist: "Bad Company" },
  { id: "dBrRBZy8OTs", title: "Buy U A Drank (Shawty Snappin')", artist: "T-Pain ft. Yung Joc" },
  { id: "tfdwcqfuxwA", title: "Happiness", artist: "Sarz feat. Asake & Gunna" },
  { id: "1Vf4mMCpNY0", title: "A Milli", artist: "Lil Wayne" },
  { id: "QtXby3twMmI", title: "Adventure Of A Lifetime", artist: "Coldplay" },
  { id: "QcMEmuPFlwM", title: "Locked Up", artist: "Akon" },
  { id: "s86K-p089R8", title: "Runaway", artist: "Bon Jovi" },
  { id: "FLTchCiC0T0", title: "Seek & Destroy", artist: "Metallica" },
  { id: "SDTZ7iX4vTQ", title: "Pumped Up Kicks", artist: "Foster The People" },
  { id: "0Z8eMHVwFDw", title: "Fried (She a Vibe)", artist: "Future, Metro Boomin" },
  { id: "CxM-apTyHiQ", title: "Lost", artist: "Frank Ocean" },
  { id: "_K6MoWuAXjQ", title: "Pop Bottles", artist: "Birdman ft. Lil Wayne" },
  { id: "b6ZnjrvRu6Y", title: "The Fireman", artist: "George Strait" },
  { id: "Gft_kG9cfJg", title: "Let Your Love Flow", artist: "The Bellamy Brothers" },
  { id: "Ny8aOB9iP3A", title: "Thunder Island", artist: "Jay Ferguson" },
  { id: "r3Pr1_v7hsw", title: "I Want To Know What Love Is", artist: "Foreigner" },
  { id: "h4UqMyldS7Q", title: "It Was A Good Day", artist: "Ice Cube" },
  { id: "cEGMmEvGe7c", title: "Hold Up", artist: "Nipsey Hussle ft. Marion Band$" },
  { id: "EwdsnGfrd-k", title: "Rockstar Made", artist: "Playboi Carti" },
  { id: "p3j2NYZ8FKs", title: "West End Girls", artist: "Pet Shop Boys" },
  { id: "_JZom_gVfuw", title: "Juicy", artist: "The Notorious B.I.G." },
  { id: "md4ujXhHzLs", title: "Express Yourself", artist: "N.W.A." },
  { id: "rzRqEWJYwX4", title: "You Know How We Do It", artist: "Ice Cube" },
];
