

export default function NoScript() {
  return (
    <noscript>
      <div className="max-w-[90dvw] md:max-w-lg mx-auto space-y-10 flex justify-center items-center p-6 fixed bottom-24 inset-x-0  rounded-xl border shadow-lg bg-background/80 z-50 backdrop-blur-sm">
        <div className="space-y-4 text-center">
          <div className="flex justify-center items-center gap-2 text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path stroke-dasharray="4" d="M12 3v2">
                  <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.2s" values="4;0" />
                  <animateTransform attributeName="transform" dur="6s" keyTimes="0;0.05;0.15;0.2;1" repeatCount="indefinite" type="rotate" values="0 12 3;3 12 3;-3 12 3;0 12 3;0 12 3" />
                </path>
                <path stroke-dasharray="30" stroke-dashoffset="30" d="M12 5c-3.31 0 -6 2.69 -6 6l0 6c-1 0 -2 1 -2 2h8M12 5c3.31 0 6 2.69 6 6l0 6c1 0 2 1 2 2h-8">
                  <animateTransform attributeName="transform" dur="6s" keyTimes="0;0.05;0.15;0.2;1" repeatCount="indefinite" type="rotate" values="0 12 3;3 12 3;-3 12 3;0 12 3;0 12 3" />
                  <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.2s" dur="0.4s" to="0" />
                </path>
                <path stroke-dasharray="10" stroke-dashoffset="10" d="M10 20c0 1.1 0.9 2 2 2c1.1 0 2 -0.9 2 -2">
                  <animateTransform attributeName="transform" begin="0.2s" dur="6s" keyTimes="0;0.05;0.15;0.2;1" repeatCount="indefinite" type="rotate" values="0 12 8;6 12 8;-6 12 8;0 12 8;0 12 8" />
                  <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.7s" dur="0.2s" to="0" />
                </path>
                <path stroke-dasharray="6" stroke-dashoffset="6" d="M22 6v4">
                  <animate attributeName="stroke-width" begin="0.9s" dur="3s" keyTimes="0;0.1;0.2;0.3;1" repeatCount="indefinite" values="2;3;3;2;2" />
                  <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.9s" dur="0.2s" to="0" />
                </path>
                <path stroke-dasharray="4" stroke-dashoffset="4" d="M22 14v0.01">
                  <animate attributeName="stroke-width" begin="1.1s" dur="3s" keyTimes="0;0.1;0.2;0.3;1" repeatCount="indefinite" values="2;3;3;2;2" />
                  <animate fill="freeze" attributeName="stroke-dashoffset" begin="1.1s" dur="0.2s" to="0" />
                </path>
              </g>
            </svg>
            <h4 className="text-xl font-semibold text-foreground leading-tight">
              JavaScript is Disabled
            </h4>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            This portfolio requires JavaScript to function properly. Please enable
            JavaScript in your browser settings to continue.
          </p>
        </div>
      </div>
    </noscript>
  );
}
