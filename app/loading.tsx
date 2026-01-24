export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center gap-8 bg-background">
      <div className="relative flex flex-col items-center gap-6">
        {/* Favicon with subtle pulse */}
        <div className="relative">
          <div
            className="absolute inset-0 animate-pulse rounded-2xl bg-accent/10 blur-xl"
            aria-hidden
          />
          <img
            src="/favicon.svg"
            alt=""
            width={56}
            height={56}
            className="relative size-14 animate-pulse object-contain"
          />
        </div>

        {/* Loading bar */}
        <div className="flex w-48 flex-col items-center gap-2">
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-loading-bar rounded-full bg-accent" />
          </div>
          <p className="text-xs text-muted-foreground">Loading</p>
        </div>
      </div>
    </div>
  );
}
