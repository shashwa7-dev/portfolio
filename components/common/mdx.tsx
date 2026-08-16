import Link from "next/link";
import Image, { ImageProps } from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { highlight } from "sugar-high";
import remarkGfm from "remark-gfm";
import Marker from "@/components/common/Marker";
import React from "react";
import { slugify } from "@/lib/toc";

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
    // `alt` arrives through the spread below, from the MDX author's own image
    // attributes, which the rule cannot see. Defaulting it here would invent alt
    // text for someone else's content. The directive has to sit on the line
    // directly above the element it suppresses, so it goes last.
    // eslint-disable-next-line jsx-a11y/alt-text
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
  /**
   * The drawn underline, available to posts as `<Marker>phrase</Marker>`.
   *
   * Prose needs a way to point at the one phrase that carries a paragraph.
   * Bold is the obvious reach and the wrong one here: scattered through a long
   * article it stops meaning "this matters" and becomes texture. The underline
   * is the site's own emphasis device, it is already used in the hero copy, and
   * being expensive to type keeps it rare.
   */
  Marker,
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
      /**
       * GitHub-flavoured markdown, so a post can write a pipe table and get a
       * table. Without it, MDX parses the pipes as literal text and the rows
       * run together into one paragraph.
       *
       * `remark-gfm` was already a dependency, used by the chat renderer in
       * `components/chat/MarkdownMessage.tsx`. Only the blog pipeline was
       * missing it. This also restores strikethrough, task lists and bare
       * autolinks, which had the same silent failure.
       *
       * Placed after the spread deliberately: callers pass `source` and nothing
       * else, and a caller that did pass `options` would otherwise drop GFM
       * without any error to notice.
       */
      options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
    />
  );
}
