"use client";

import BezierPlot from "@/components/motion/BezierPlot";
import { ease } from "@/lib/motionVariants";

const curves = [
  { name: "ease.out", curve: ease.out },
  { name: "ease.modal", curve: ease.modal },
  { name: "ease.expo", curve: ease.expo },
] as const;

export default function EasingDemo() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-x-6 gap-y-5">
      {curves.map((c) => (
        <BezierPlot key={c.name} name={c.name} curve={c.curve} />
      ))}
    </div>
  );
}
