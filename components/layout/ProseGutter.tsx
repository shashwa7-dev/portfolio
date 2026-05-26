export default function ProseGutter({
  gutter,
  children,
}: {
  gutter: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr] md:gap-11">
      <aside className="md:sticky md:top-24 md:self-start">{gutter}</aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
