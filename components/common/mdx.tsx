import Link from "next/link";
import Image, { ImageProps } from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { highlight } from "sugar-high";
import React from "react";

interface TableProps {
  data: {
    headers: string[];
    rows: (string | number)[][];
  };
}

function Table({ data }: TableProps) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ));

  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ));

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

interface CustomLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

function CustomLink(props: CustomLinkProps) {
  let href = props.href;

  if (href.startsWith("/")) {
    return <Link {...props}>{props.children}</Link>;
  }

  if (href.startsWith("#")) {
    return <a {...props} />;
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />;
}

type RoundedImageProps = ImageProps;

/**
 * Images inside a post. Greyscale at rest and colour on hover, matching every
 * other image surface in the app.
 *
 * `alt` is spread from the MDX author's own attributes rather than defaulted
 * here, which is why the eslint rule flags this line: an image in a post is
 * content, and inventing alt text for it would be worse than leaving the
 * author responsible for it.
 */
function RoundedImage(props: RoundedImageProps) {
  return (
    <Image
      className="rounded-lg grayscale transition-[filter] duration-base ease-out hover:grayscale-0"
      {...props}
    />
  );
}

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  children: string;
}

function Code({ children, ...props }: CodeProps) {
  let codeHTML = highlight(children);
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />;
}

function slugify(str: string): string {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

interface HeadingProps {
  children: React.ReactNode;
}

function createHeading(level: number) {
  const Heading = ({ children }: HeadingProps) => {
    let slug = slugify(children as string);
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement("a", {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: "anchor",
        }),
      ],
      children
    );
  };

  Heading.displayName = `Heading${level}`;
  return Heading;
}

const components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  a: CustomLink,
  code: Code,
  Table,
};

interface CustomMDXProps {
  components?: Record<string, React.ComponentType<any>>;
  [key: string]: any;
}

export function CustomMDX(props: CustomMDXProps) {
  return (
    <MDXRemote
      {...props}
      //@ts-ignore
      components={{ ...components, ...(props.components || {}) }}
    />
  );
}
