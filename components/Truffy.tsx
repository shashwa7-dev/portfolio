"use client";

import { useEffect, useRef, useState } from "react";
import Button from "./common/Button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { containerVariants, itemVariants, slideUpContainerVariants } from "@/lib/motionVariants";

const GIFS = {
  idle: "/truffy/ideal_truffy.gif",
  backflip: "/truffy/backflip2_truffy.gif",
  jump: "/truffy/jumping_truffy.gif",
  slide: "/truffy/sliding_truffy.gif",
  punch: "/truffy/punching_truffy.gif",
} as const;

type AvatarState = keyof typeof GIFS;

const KEY_MAP: Record<string, AvatarState> = {
  b: "backflip",
  j: "jump",
  s: "slide",
  p: "punch",
};

const ANIMATION_DURATION: Record<AvatarState, number> = {
  idle: Infinity,
  backflip: 1700,
  jump: 1500,
  slide: 1300,
  punch: 1500,
};

export default function Truffy() {
  const [state, setState] = useState<AvatarState>("idle");
  const isAnimatingRef = useRef(false);
  const activeKeyRef = useRef<string>("");
  const animationTimerRef = useRef<number | null>(null);
  const keyHighlightTimerRef = useRef<number | null>(null);

  // Preload GIFs once
  useEffect(() => {
    Object.values(GIFS).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);
  function triggerAction(action: AvatarState, key?: string) {
    if (isAnimatingRef.current) return;

    // highlight button
    if (key) {
      activeKeyRef.current = key;
      clearTimeout(keyHighlightTimerRef.current!);
      keyHighlightTimerRef.current = window.setTimeout(() => {
        activeKeyRef.current = "";
      }, 300);
    }

    isAnimatingRef.current = true;
    setState(action);

    clearTimeout(animationTimerRef.current!);
    animationTimerRef.current = window.setTimeout(() => {
      setState("idle");
      isAnimatingRef.current = false;
    }, ANIMATION_DURATION[action]);
  }
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.repeat) return;

      const key = e.key.toLowerCase();
      const action = KEY_MAP[key];
      if (!action) return;

      triggerAction(action, key);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <motion.div
      className="hidden lg:flex justify-center sticky top-0 p-2 h-[100dvh] items-end"
      variants={slideUpContainerVariants}
      initial="hidden"
      animate="visible"
      aria-hidden="true"
    >
      <div className="h-fit w-full flex flex-col  justify-center items-center gap-2">
        <img
          key={state}
          src={GIFS[state]}
          alt=""
          className="w-[10dvh] select-none"
          draggable={false}
        />
        <motion.p
          className="font-medium text-xs text-center"
          variants={itemVariants}
        >
          Hey! I&apos;m <span className="text-amber-500 font-sans">Truffy</span>
        </motion.p>{" "}
        <motion.div className="grid grid-cols-2 gap-2" variants={itemVariants}>
          <ActionButton
            label="J-Jump"
            active={activeKeyRef.current === "j"}
            onClick={() => triggerAction("jump", "j")}
          />
          <ActionButton
            label="S-Slide"
            active={activeKeyRef.current === "s"}
            onClick={() => triggerAction("slide", "s")}
          />
          <ActionButton
            label="P-Punch"
            active={activeKeyRef.current === "p"}
            onClick={() => triggerAction("punch", "p")}
          />
          <ActionButton
            label="B-Flip"
            active={activeKeyRef.current === "b"}
            onClick={() => triggerAction("backflip", "b")}
          />
        </motion.div>
        <div className="text-[0.65rem] text-muted-foreground w-fit  text-center">
          <p>
            {"Created character on "}
            <a
              href="https://www.pixellab.ai/"
              target="_blank"
              className="underline text-amber-500"
            >
              PixelLab
            </a>
          </p>
          <p>Note: Actions are throttled to prevent overlapping animations.</p>
        </div>
      </div>
    </motion.div>
  );
}

function ActionButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "text-xs  transition-all text-center justify-center",
        active && "scale-90 bg-amber-500 text-black"
      )}
    >
      {label}
    </Button>
  );
}
