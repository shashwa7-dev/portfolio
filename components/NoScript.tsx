export default function NoScript() {
  return (
    <noscript>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full rounded-lg border border-border bg-card p-8 text-center shadow-lg">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-foreground">
            JavaScript is Disabled
          </h1>
          <p className="mb-6 text-muted-foreground">
            This portfolio requires JavaScript to function properly. Please enable
            JavaScript in your browser settings to view the full experience.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">How to enable JavaScript:</p>
            <ul className="list-disc list-inside space-y-1 text-left">
              <li>
                <strong>Chrome/Edge:</strong> Settings → Privacy and security →
                Site settings → JavaScript → Allowed
              </li>
              <li>
                <strong>Firefox:</strong> Settings → Privacy & Security → Permissions
                → Enable JavaScript
              </li>
              <li>
                <strong>Safari:</strong> Preferences → Security → Enable JavaScript
              </li>
            </ul>
          </div>
        </div>
      </div>
    </noscript>
  );
}
