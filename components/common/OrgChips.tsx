import { ExternalLink, ArrowUpRight } from "lucide-react";

/**
 * Small inline pill that labels an org's engagement type. Renders nothing
 * when `employment` is undefined so callers can drop it in unconditionally.
 *
 * Used in two places today: the experience-section card on the homepage and
 * the org page header. Add new employment values to `TOrganization.employment`
 * and extend the switch below.
 */
export function EmploymentTag({
  employment,
}: {
  employment?: "full-time" | "contract";
}) {
  if (!employment) return null;
  const label = employment === "full-time" ? "Full-time" : "Contract";
  return (
    <span className="inline-flex items-center rounded-full border border-border-strong px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
  );
}

/**
 * Small outbound-link pill for org sites / apps / X profiles. Two icon
 * variants — `arrow` (default, in tight rows) and `external` (slightly
 * wider, in section headers).
 */
export function OrgLinkChip({
  href,
  label,
  icon = "arrow",
}: {
  href: string;
  label: string;
  icon?: "arrow" | "external";
}) {
  const Icon = icon === "external" ? ExternalLink : ArrowUpRight;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-accent/60 hover:text-accent"
    >
      {label}
      <Icon className="h-2.5 w-2.5" />
    </a>
  );
}
