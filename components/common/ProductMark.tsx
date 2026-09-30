import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * A product's square app-icon mark. One component so the key-contributions
 * index and the diary masthead draw the same shape at their two sizes.
 * Decorative: the product name always sits beside it as text.
 */
export default function ProductMark({
  src,
  size,
  className,
}: {
  src: string;
  size: number;
  className?: string;
}) {
  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg ring-1 ring-border candy:rounded-tag candy:ring-2 candy:ring-foreground",
        className,
      )}
    >
      <Image src={src} alt="" fill sizes={`${size}px`} className="object-cover" />
    </span>
  );
}
