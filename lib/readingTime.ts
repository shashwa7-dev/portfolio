/**
 * Whole minutes to read, at 200 words per minute, minimum 1.
 *
 * Fenced and inline code are stripped before counting. The posts here are
 * code-heavy (the one in the repo today is 696 raw words across eight sections,
 * much of it samples), and counting code inflates the estimate for exactly the
 * posts a reader skims rather than reads word by word.
 *
 * Frontmatter is already removed by `app/blogs/utils.ts` before content reaches
 * this, so it needs no handling here.
 */
export function readingTime(content: string): number {
  const prose = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`\n]*`/g, " ");
  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
