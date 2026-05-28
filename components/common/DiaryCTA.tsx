import { getDiary } from "@/lib/diaryData";
import MarkerLink from "@/components/common/MarkerLink";

type Props = {
  /** Org slug — must match a `TOrganization.slug` and a `TOrgDiary.org`. */
  orgSlug: string;
  /** Pretty org name, only used when `includeOrgName` is true. */
  orgName?: string;
  /** When true, the CTA reads "Read the diary at <Org>"; otherwise just "Read the diary". */
  includeOrgName?: boolean;
  /** Visual size of the link — `sm` in tight surfaces, `md` for standalone CTAs. */
  size?: "sm" | "md";
  /** Optional extra class for wrapper styling. */
  className?: string;
};

/**
 * Conditional CTA pointing at `/work/<org>/log`. Renders nothing when the org
 * has no diary record — so callers can drop it in unconditionally and rely on
 * this component to gate visibility.
 *
 * Used in `#experience` (size sm, no org name) and `/work/[org]` (size md,
 * org name included). Future diary surfaces should consume this instead of
 * re-implementing the gate + link.
 */
export default function DiaryCTA({
  orgSlug,
  orgName,
  includeOrgName,
  size = "sm",
  className,
}: Props) {
  if (!getDiary(orgSlug)) return null;

  const label =
    includeOrgName && orgName
      ? `Read the diary at ${orgName}`
      : "Read the diary";

  return (
    <div className={className}>
      <MarkerLink
        href={`/work/${orgSlug}/log`}
        size={size}
        tone="foreground"
      >
        {label}
      </MarkerLink>
    </div>
  );
}
