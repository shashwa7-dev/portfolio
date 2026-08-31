/**
 * Renders the five link-preview images, one per issue, into `public/og/`.
 *
 * Run it with `npm run og:issues`. It is a maintenance script, not part of
 * the build: the output is committed, and nothing renders a card at request
 * time.
 *
 * ## Why images and not a route
 *
 * A post that says "I pulled an Inverted card" wants an Inverted card under
 * it, and `/card`'s generic preview showed the same page card whatever
 * anybody rolled. The obvious fix is a route that draws the visitor's own
 * card per request, and that was deliberately not built: it needs
 * `@napi-rs/canvas` as a production dependency, it puts the visitor's id in
 * a public URL, and it renders their free-text name into an image served
 * from this domain, which is a real abuse surface for a preview whose
 * audience is strangers who cannot tell whose portrait it is anyway.
 *
 * Five files answer the part that was actually wrong (the preview showed the
 * wrong edition) and none of that is true of them. Someone's own card still
 * gets attached for real on a phone, through the share sheet.
 *
 * ## Fonts
 *
 * The app loads the card's faces through `next/font/google`, which does not
 * exist outside Next, so this fetches the same three families from the Google
 * Fonts repository into a git-ignored cache and registers them by hand. They
 * are all SIL OFL. The family names below are this script's own, chosen to
 * match nothing: `drawTicket` is handed whatever string it is given.
 */
import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { drawTicket, CARD_W, CARD_H } from "@/lib/card/ticket";
import { ISSUES } from "@/lib/card/issues";
import { specimenData } from "@/lib/card/specimens";
import type { IssueKey } from "@/lib/card/types";

const ROOT = process.cwd();
const OUT = join(ROOT, "public/og");
const FONT_CACHE = join(ROOT, ".cache/fonts");

/** OG's canonical size. X, Slack and iMessage all crop toward the centre of
 *  this, so nothing that matters goes near an edge. */
const W = 1200;
const H = 630;

const GF = "https://raw.githubusercontent.com/google/fonts/main";
const FONTS = [
  { file: "Caveat[wght].ttf", url: `${GF}/ofl/caveat/Caveat%5Bwght%5D.ttf`, family: "CardHand" },
  { file: "AlegreyaSansSC-BlackItalic.ttf", url: `${GF}/ofl/alegreyasanssc/AlegreyaSansSC-BlackItalic.ttf`, family: "CardSticker" },
  { file: "IBMPlexMono-Regular.ttf", url: `${GF}/ofl/ibmplexmono/IBMPlexMono-Regular.ttf`, family: "CardMono" },
  { file: "IBMPlexMono-Medium.ttf", url: `${GF}/ofl/ibmplexmono/IBMPlexMono-Medium.ttf`, family: "CardMono" },
];

async function ensureFonts() {
  await mkdir(FONT_CACHE, { recursive: true });
  for (const f of FONTS) {
    const path = join(FONT_CACHE, f.file);
    if (!existsSync(path)) {
      process.stdout.write(`  fetching ${f.file}\n`);
      const res = await fetch(f.url);
      if (!res.ok) throw new Error(`${f.file}: ${res.status}`);
      await writeFile(path, Buffer.from(await res.arrayBuffer()));
    }
    GlobalFonts.registerFromPath(path, f.family);
  }
}

async function main() {
  await ensureFonts();
  await mkdir(OUT, { recursive: true });

  const mark = await loadImage(await readFile(join(ROOT, "public/brand-mark.png")));

  for (const key of Object.keys(ISSUES) as IssueKey[]) {
    const issue = ISSUES[key];
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    /* The page's own dark surface, not the card's. The preview is a frame
       around the card rather than a blow-up of it: cropping straight to the
       artwork would put the perforation and the serial under whatever
       rounding each platform applies. */
    ctx.fillStyle = "#0f0e0c";
    ctx.fillRect(0, 0, W, H);

    // The card, at 4:5, sitting left of centre with the copy beside it.
    const cardH = 470;
    const cardW = Math.round((cardH * CARD_W) / CARD_H);
    const cardX = 96;
    const cardY = Math.round((H - cardH) / 2);

    ctx.save();
    ctx.translate(cardX, cardY);
    ctx.scale(cardW / CARD_W, cardH / CARD_H);
    drawTicket(
      ctx as unknown as CanvasRenderingContext2D,
      specimenData(key),
      CARD_W,
      CARD_H,
      { hand: "CardHand", sticker: "CardSticker", mono: "CardMono", mark: mark as unknown as HTMLImageElement }
    );
    ctx.restore();

    const textX = cardX + cardW + 88;
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = "#7a756a";
    ctx.font = '500 22px CardMono';
    ctx.fillText(`${issue.range[0]} TO ${issue.range[1]} ON SIX DICE`, textX, cardY + 96);

    ctx.fillStyle = "#f2eee6";
    ctx.font = '64px CardSticker';
    ctx.fillText(issue.name.toUpperCase(), textX, cardY + 168);

    ctx.fillStyle = "#c9c3b3";
    ctx.font = '500 30px CardMono';
    ctx.fillText(`${issue.label} PER ROLL`, textX, cardY + 224);

    ctx.fillStyle = "#8f8a7f";
    ctx.font = '400 24px CardMono';
    ctx.fillText("IDENTITY IS PERMANENT,", textX, cardY + 336);
    ctx.fillText("EDITION IS FATE.", textX, cardY + 370);

    ctx.fillStyle = "#615d54";
    ctx.font = '500 22px CardMono';
    ctx.fillText("SHASHWA7.IN/CARD", textX, cardY + cardH - 8);

    const file = join(OUT, `issue-${key}.png`);
    await writeFile(file, canvas.toBuffer("image/png"));
    process.stdout.write(`  ${file.replace(ROOT + "/", "")}\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
