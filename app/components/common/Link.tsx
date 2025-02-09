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
      className={`bg-s7-primary_bg social border flex items-center justify-center gap-1 p-[1px] px-2 rounded-md border-b-4 text-secondary-foreground w-fit ${className}`}
      {...props}
    >
      <span className="capitalize">{name}</span>
      <SVGS.Link className="w-[10px] h-[10px]" />
    </a>
  );
};
