import Image from "next/image";
import type { TOrganization } from "@/lib/workData";

/**
 * The products built under one organisation, as a row of marks and names on
 * its Experience entry. Returns null when the org lists none, so callers can
 * mount it unconditionally, the same contract as `ClientStrip`.
 *
 * It deliberately mirrors `ClientStrip`'s idiom (mono label, overlapping
 * 20px marks, names as running text) so the two rows read as one system:
 * "Worked with" says whose brands, "Products" says what was built. Unlike the
 * client avatars these marks are squircles, not circles, because they are
 * app icons rather than brand avatars. Always in full colour, like every
 * other logo on the site.
 */
export default function ProductStrip({
  products,
}: {
  products?: TOrganization["products"];
}) {
  if (!products || products.length === 0) return null;

  return (
    <div className="group flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
      <span className="font-mono text-2xs uppercase tracking-label text-subtle">
        Products
      </span>

      <span className="flex items-center">
        {products.map((p, i) => (
          <span
            key={p.name}
            className={`relative h-5 w-5 shrink-0 overflow-hidden rounded-md outline outline-1 outline-border ring-2 ring-background ${
              i > 0 ? "-ml-1" : ""
            }`}
          >
            <Image
              src={p.logo}
              alt=""
              fill
              sizes="20px"
              className="object-cover"
            />
          </span>
        ))}
      </span>

      <span className="min-w-0 text-xs text-muted-foreground">
        {products.map((p, i) => (
          <span key={p.name}>
            {i > 0 && <span className="text-border-strong">, </span>}
            {p.link ? (
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-base ease-out hover:text-foreground"
              >
                {p.name}
              </a>
            ) : (
              p.name
            )}
          </span>
        ))}
      </span>
    </div>
  );
}
