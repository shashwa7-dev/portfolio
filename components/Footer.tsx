import Image from "next/image";
import Container from "@/components/layout/Container";
import Brand from "./Brand";

const Footer = () => {
  return (
    // No top rule: the boundary is carried by whitespace and by the scenery
    // fading in, not by a border.
    //
    // `isolate` is load-bearing. It creates a stacking context so the layers
    // below sort against each other. Without it, a child on a negative
    // z-index would paint behind `body`'s own `bg-background` and disappear
    // entirely, which is what happened on the first attempt. Every layer here
    // is therefore non-negative: scenery 0, wordmark 1, copy 2.
    <footer className="relative isolate mt-12 overflow-hidden">
      <Container width="wide" className="relative z-[2] py-6 text-sm text-subtle">
        <p>
          &copy; {new Date().getFullYear()}
          {" / S7.dev / "}
          <a
            href="https://github.com/shashwa7-dev/portfolio/blob/master/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground decoration-subtle underline underline-offset-4 transition-colors hover:decoration-foreground"
          >
            MIT License
          </a>
        </p>
      </Container>

      {/* Scenery: a full-bleed band at the base of the footer. It spans the
          whole viewport width while the copy above stays inside Container, so
          the artwork is edge to edge and the text is not. It is in normal flow,
          so it drives the footer's height and only comes into view once the
          visitor reaches the bottom of the page, rather than sitting behind
          the whole page as a background.

          The mask fades the top edge to transparent so it dissolves into the
          page instead of starting on a hard edge, and the gradient wash pulls it
          toward --background so it tracks the theme. No rounded corners: a
          full-bleed band should meet the viewport edges squarely.

          Three things about serving an animated GIF here:

          1. `unoptimized` is required. Next's image optimizer re-encodes to
             webp/avif, which drops GIF animation entirely, so without this the
             band renders as a single frozen frame.
          2. Because the optimizer is bypassed, the full ~500KB ships as-is and
             the 480px-wide source is upscaled roughly 3x to reach full viewport
             width. The softness that results is tolerable for lo-fi anime
             artwork in a decorative band; it would not be for a photograph.
          3. `motion-reduce:hidden` is the accessibility escape hatch. A GIF's
             loop cannot be paused by CSS, so `prefers-reduced-motion` has no
             effect on it, and this is the only way to honour that setting for a
             looping image. It is purely decorative, so hiding it costs nothing
             for those users. */}
      <div
        aria-hidden
        className="pointer-events-none relative z-0 w-full select-none"
      >
        <div className="relative h-[16rem] overflow-hidden md:h-[26rem]">
          <Image
            src="/images/footer-scenery.gif"
            alt=""
            fill
            unoptimized
            sizes="100vw"
            className="object-cover object-center opacity-90 motion-reduce:hidden dark:opacity-75"
            style={{
              maskImage:
                "linear-gradient(to top, black 0%, black 72%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to top, black 0%, black 72%, transparent 100%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-background" />
        </div>
      </div>

      {/* Wordmark, bleeding off the bottom edge, above the scenery. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1]"
      >
        <Brand />
      </div>
    </footer>
  );
};

export default Footer;
