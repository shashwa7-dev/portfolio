import Band from "./Band";
import BandLabel from "./BandLabel";

/**
 * The band a secondary route opens with, sitting flush under the navbar.
 *
 * Every route gets one so the system reads as a system: a page that opened
 * with a bare heading while the homepage opened with a band would look like
 * the pattern had been applied to the homepage and forgotten everywhere else.
 *
 * `name` is where the route says something true about this particular page,
 * not a restatement of `id`: a count, a date, an org. Leave it off rather than
 * pad it.
 */
export default function PageBand({
  id,
  name,
  action,
}: {
  id: string;
  name?: string;
  action?: React.ReactNode;
}) {
  return (
    // The gap under the band belongs to the band, not to the route. Every page
    // that used to carry `py-8 md:py-12` on its `<main>` now drops the top
    // half of that and lets this margin do the work, which is what puts the
    // band flush against the navbar instead of orphaned below a strip of
    // background.
    //
    // `flush` because being against the navbar is the whole point: the navbar's
    // own `border-b` is this band's top rule, so drawing a second one stacks
    // two hairlines a pixel apart.
    <Band flush className="mb-8 md:mb-12">
      <BandLabel id={id} name={name} />
      {action}
    </Band>
  );
}
