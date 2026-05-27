import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  name: string;
  link?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Link: React.FC<LinkProps> = ({
  name,
  link,
  variant = "default",
  size = "sm",
  className,
  ...props
}) => {
  return (
    <Button asChild variant={variant} size={size} className={cn(className)}>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        <span className="capitalize">{name}</span>
        <ExternalLink className="size-4" />
      </a>
    </Button>
  );
};
