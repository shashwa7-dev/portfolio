import Label from "./Label";

/**
 * The label inside a band: a bracketed identifier, then the name.
 *
 * The brackets are not decoration. They mark the identifier as a coordinate
 * rather than a heading, which is what lets `[ 02 / 06 ]` and `[ WORK ]` sit
 * in the same slot on different routes without one of them reading as a title.
 *
 * `of` is opt-in, and it should stay that way. A counter claims the page is a
 * sequence of a known length, which is true of the homepage and the shelf and
 * false of a blog post, so a route that is not a sequence passes only `id`.
 */
export default function BandLabel({
  id,
  of,
  name,
}: {
  id: string;
  of?: string;
  name?: string;
}) {
  return (
    <Label>
      <span className="text-foreground">
        [ {id}
        {of ? ` / ${of}` : ""} ]
      </span>
      {name ? (
        <>
          <span className="px-2 text-border-strong">·</span>
          {name}
        </>
      ) : null}
    </Label>
  );
}
