"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CubeDice from "@/components/card/dice/CubeDice";
import TossDice from "@/components/card/dice/TossDice";
import type { Roll, RollSet } from "@/lib/card/types";

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

/** The props shape both dice skins take. Exported so CubeDice and TossDice
 *  read it from here instead of each re-declaring a byte-identical inline
 *  prop literal. */
export type SkinProps = {
  onComplete: (set: RollSet) => void;
  issueCaption: string | null;
  onRollAgain: () => void;
  /** Mirrors useDiceRoll's own `rolls` up to the caller on every change, so
   *  CardMinter's history strip can read the throws recorded so far without
   *  a second copy of them: the skin is the only thing that calls
   *  useDiceRoll, so this is the one seam that can hand its `rolls` out. */
  onRollsChange: (rolls: readonly Roll[]) => void;
};

function ChosenSkin({ onComplete, issueCaption, onRollAgain, onRollsChange }: SkinProps) {
  // /card is a server component that reads headers, so the override itself
  // is read here, client-side, from the URL rather than from a prop.
  const params = useSearchParams();
  const style = styleFromParam(params.get("dice"));
  return style === "cube" ? (
    <CubeDice
      onComplete={onComplete}
      issueCaption={issueCaption}
      onRollAgain={onRollAgain}
      onRollsChange={onRollsChange}
    />
  ) : (
    <TossDice
      onComplete={onComplete}
      issueCaption={issueCaption}
      onRollAgain={onRollAgain}
      onRollsChange={onRollsChange}
    />
  );
}

export default function DiceRoller({ onComplete, issueCaption, onRollAgain, onRollsChange }: SkinProps) {
  // useSearchParams requires a Suspense boundary in this Next version (it
  // opts the subtree into client-side rendering). No visible fallback: a
  // dice button that isn't interactive yet has nothing useful to show
  // before hydration resolves this on the client, which is immediate.
  return (
    <Suspense fallback={null}>
      <ChosenSkin
        onComplete={onComplete}
        issueCaption={issueCaption}
        onRollAgain={onRollAgain}
        onRollsChange={onRollsChange}
      />
    </Suspense>
  );
}
