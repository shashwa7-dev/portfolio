"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CubeDice from "@/components/card/dice/CubeDice";
import TossDice from "@/components/card/dice/TossDice";
import type { RollSet } from "@/lib/card/types";

/**
 * The chooser: picks a dice skin and renders it, nothing else. Both
 * presentations stay so the owner can compare them live; the roll logic
 * neither owns lives in useDiceRoll, shared by both.
 */

type DiceStyle = "cube" | "toss";

/** Which dice presentation ships. Override per visit with ?dice=cube or ?dice=toss. */
const DEFAULT_STYLE: DiceStyle = "toss";

function styleFromParam(raw: string | null): DiceStyle {
  return raw === "cube" || raw === "toss" ? raw : DEFAULT_STYLE;
}

function ChosenSkin({ onComplete }: { onComplete: (set: RollSet) => void }) {
  // /card is a server component that reads headers, so the override itself
  // is read here, client-side, from the URL rather than from a prop.
  const params = useSearchParams();
  const style = styleFromParam(params.get("dice"));
  return style === "cube" ? <CubeDice onComplete={onComplete} /> : <TossDice onComplete={onComplete} />;
}

export default function DiceRoller({
  onComplete,
}: {
  onComplete: (set: RollSet) => void;
}) {
  // useSearchParams requires a Suspense boundary in this Next version (it
  // opts the subtree into client-side rendering). No visible fallback: a
  // dice button that isn't interactive yet has nothing useful to show
  // before hydration resolves this on the client, which is immediate.
  return (
    <Suspense fallback={null}>
      <ChosenSkin onComplete={onComplete} />
    </Suspense>
  );
}
