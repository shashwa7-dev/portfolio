import { SVGS } from "../SVGS";
import { buttonClasses } from "./Button/button.styles";

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
      rel="noopener noreferrer"
      className={buttonClasses({ variant: "primary", size: "sm" })}
      {...props}
    >
      <span className="capitalize">{name}</span>{" "}
      <SVGS.Link className="w-[10px] h-[10px]" />
    </a>
  );
};
