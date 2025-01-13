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
      className={`bg-s7-primary_bg social border flex items-center justify-center gap-1 p-[1px] px-2 rounded-md border-b-4 text-gray-600 w-fit ${className}`}
      {...props}
    >
      <span className="capitalize">{name}</span>
      <img
        src={"/icons/link.svg"}
        alt={link}
        className="w-[10px] h-[10px] text-gray-600"
      />
    </a>
  );
};
