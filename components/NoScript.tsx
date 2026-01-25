import { Icon } from "@iconify/react";

export default function NoScript() {
  return (
    <noscript>
      <div className="max-w-2xl mx-auto space-y-10 flex justify-center items-center">
        <div className="max-w-lg w-full space-y-4 text-center">
          <div className="flex justify-center items-center gap-2">
            <Icon icon="line-md:speedometer-loop" className="text-accent w-8 h-8" />
            <h1 className="text-3xl font-semibold text-foreground leading-tight">
              JavaScript is Disabled
            </h1>
          </div>

          <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
            This portfolio requires JavaScript to function properly. Please enable
            JavaScript in your browser settings to continue.
          </p>
        </div>
      </div>
    </noscript>
  );
}
