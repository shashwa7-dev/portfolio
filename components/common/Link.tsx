import { SVGS } from "../SVGS";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  name: string;
  link?: string;
}

export const Link: React.FC<LinkProps> = ({
  name,
  link,
  className,
  ...props
}) => {
  return (
    <a
      href={link}
      target="_blank"
      className={`p-1 px-2 rounded-md border-b-4 border  text-xs gap-1.5 text-secondary-foreground bg-card flex items-center ${className}`}
      {...props}
    >
      <span className="capitalize">{name}</span>
      <SVGS.Link className="w-[10px] h-[10px]" />
    </a>
  );
};
