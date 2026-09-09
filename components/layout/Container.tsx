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
        // Through the token, not a literal: `Rails` draws the page's two
        // hairlines at this exact value, so the measure has to live in one
        // place or the lines and the column they describe will drift apart.
        width === "reading" ? "max-w-[var(--measure)]" : "max-w-[1080px]",
        className
      )}
    >
      {children}
    </Tag>
  );
}
