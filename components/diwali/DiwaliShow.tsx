"use client";

import { useEffect } from "react";
import type { ShowEvent, ShowState } from "@/lib/diwali/show";
import type { DiwaliSound } from "@/components/diwali/sound";

export type DiwaliShowProps = {
  state: ShowState;
  dispatch: (e: ShowEvent) => void;
  photoRect: () => DOMRect;
  sound: DiwaliSound;
};

/**
 * STUB, replaced by Task 7 (the real show: blackout, chakri, video, finale,
 * plate). For now it renders nothing and walks the state machine straight
 * through to `RETURNED`, so the hero's fuse can be exercised end to end.
 */
export default function DiwaliShow({ state, dispatch }: DiwaliShowProps) {
  useEffect(() => {
    switch (state.phase) {
      case "centre":
        dispatch({ type: "VIDEO_ENDED" });
        break;
      case "finale":
        dispatch({ type: "OPEN_PLATE" });
        break;
      case "plate":
        dispatch({ type: "PICK", index: 0 });
        break;
      case "picked":
        dispatch({ type: "PICK_DONE" });
        break;
      case "returning":
        dispatch({ type: "RETURNED" });
        break;
    }
  }, [state.phase, dispatch]);

  return null;
}
