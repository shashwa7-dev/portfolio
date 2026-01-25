import { cn } from "@/lib/utils";

interface SectionSkeletonProps {
  className?: string;
  /** Number of content placeholder bars (default 3) */
  bars?: number;
}

const SectionSkeleton = ({ className, bars = 3 }: SectionSkeletonProps) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Title row — matches SectionTitle (accent bar + text) */}
      <div className="flex items-center gap-2 border-l-2 border-accent pl-2.5 -ml-px">
        <div className="h-4 w-4 shrink-0 rounded bg-muted animate-pulse" />
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
      </div>

      {/* Content placeholders */}
      <div className="space-y-3">
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded bg-muted animate-pulse"
            style={{
              width: i === bars - 1 && bars > 1 ? "75%" : "100%",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SectionSkeleton;
