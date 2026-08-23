"use client";

import { useEffect, useRef, useState } from "react";
import { ISSUES } from "@/lib/card/issues";
import { serialFrom } from "@/lib/card/seed";
import { drawTicket, CARD_W, CARD_H } from "@/lib/card/ticket";
import { CARD_FONTS } from "@/lib/card/fonts";
import type { IssueKey } from "@/lib/card/types";

const MARK_SRC = "/brand-mark.png";

/* Fixed ids, one per issue, so every visitor sees the same five specimens and
   any unintended change to the drawing code shows up here as a visible diff.
   This is the same drawTicket the mint button calls: there is no separate
   thumbnail routine, so the gallery cannot advertise a card the generator
   does not actually produce. */
const SPECIMENS: { key: IssueKey; id: string; name: string; city: string; origin: string }[] = [
  { key: "definitive", id: "specimen-definitive", name: "Maya", city: "Lisbon", origin: "Lisbon, PT" },
  { key: "commemorative", id: "specimen-commemorative", name: "Jonas", city: "Berlin", origin: "Berlin, DE" },
  { key: "firstDay", id: "specimen-firstday", name: "Priya", city: "Toronto", origin: "Toronto, CA" },
  { key: "misprint", id: "specimen-misprint", name: "Ade", city: "Lagos", origin: "Lagos, NG" },
  { key: "inverted", id: "specimen-inverted", name: "Ana", city: "Porto", origin: "Porto, PT" },
];

function Specimen({
  spec,
  mark,
}: {
  spec: (typeof SPECIMENS)[number];
  mark: HTMLImageElement | null;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = c.clientWidth;
    const cssH = (cssW * CARD_H) / CARD_W;
    c.width = Math.round(cssW * dpr);
    c.height = Math.round(cssH * dpr);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    drawTicket(
      ctx,
      {
        visitorId: spec.id,
        name: spec.name,
        serial: serialFrom(spec.id),
        // The specimen shows its own issue, not the one its id happens to
        // roll: ISSUES[spec.key], never issueFrom(spec.id).
        issue: ISSUES[spec.key],
        origin: spec.origin,
        city: spec.city,
        date: "23 Aug 2026",
      },
      cssW,
      cssH,
      { ...CARD_FONTS, mark }
    );
  }, [spec, mark]);

  const issue = ISSUES[spec.key];
  return (
    <li>
      <canvas
        ref={ref}
        className="w-full aspect-[4/5] rounded-md"
        role="img"
        aria-label={`Example of a ${issue.name} card`}
      />
      <p className="mt-2 font-mono text-2xs uppercase tracking-label text-foreground">
        {issue.name}
      </p>
      <p className="font-mono text-2xs uppercase tracking-label text-subtle">
        {issue.share}% of cards
      </p>
    </li>
  );
}

export default function IssueGallery() {
  const [ready, setReady] = useState(false);
  const markRef = useRef<HTMLImageElement | null>(null);

  /* Same wait CardMinter does, and for the same reason: canvas draws text in
     whatever face is loaded at draw time, so the five specimens can't start
     drawing before the webfonts and the brand mark have settled. Loaded once
     here, shared across all five, rather than five separate image fetches.
     A decode failure still lets the gallery draw, with mark left null. */
  useEffect(() => {
    let cancelled = false;
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    const img = new Image();
    img.src = MARK_SRC;
    const markReady = img
      .decode()
      .then(() => {
        if (!cancelled) markRef.current = img;
      })
      .catch(() => {
        if (!cancelled) markRef.current = null;
      });
    Promise.all([fontsReady, markReady]).finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mt-14">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        The five issues
      </h2>
      <p className="mt-2 max-w-[58ch] text-sm text-muted-foreground">
        Each one changes something its name promises. The Misprint plate really
        does slip, and the Inverted portrait really is upside down.
      </p>
      {ready ? (
        <ul className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3">
          {SPECIMENS.map((s) => (
            <Specimen key={s.key} spec={s} mark={markRef.current} />
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-subtle">Drawing the issues...</p>
      )}
    </section>
  );
}
