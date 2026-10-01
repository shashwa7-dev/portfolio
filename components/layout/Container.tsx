import { cn } from "@/lib/utils";

type Props = {
  as?: "div" | "section" | "header" | "footer" | "main" | "nav";
  width?: "reading" | "wide";
  className?: string;
  children: React.ReactNode;
  id?: string;
};

export default function Container({
  as: Tag = "div",
  width = "reading",
  className,
  children,
  id,
}: Props) {
  return (
    <Tag
      id={id}
      className={cn(
        "mx-auto w-full px-6",
        // Through the token, not a literal: the measure lives in one place
        // (`--measure` in app/globals.css), so every reading column and the
        // band gutters derived from it stay in step.
        width === "reading" ? "max-w-(--measure)" : "max-w-[1080px]",
        className
      )}
    >
      {children}
    </Tag>
  );
}
