import { cn } from "@/lib/utils";

type Props = {
  as?: "div" | "section" | "header" | "footer" | "main";
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
        width === "reading" ? "max-w-[760px]" : "max-w-[1080px]",
        className
      )}
    >
      {children}
    </Tag>
  );
}
