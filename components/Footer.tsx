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

      {/* Scenery: a contained block at the base of the footer, deliberately not
          a page background and not full-bleed. It is in normal flow, so it
          drives the footer's height and only comes into view once the visitor
          reaches the bottom of the page. Constrained to the same 1080px as
          Container width="wide" so it lines up with the copy above it.

          The mask fades the top edge to transparent so the image dissolves
          into the page instead of starting on a hard horizon line, and the
          gradient wash pulls it toward --background so it tracks the theme. */}
      <div
        aria-hidden
        className="pointer-events-none relative z-0 mx-auto w-full max-w-[1080px] select-none px-6"
      >
        <div className="relative h-[16rem] overflow-hidden rounded-t-2xl md:h-[24rem]">
          <Image
            src="/images/footer-scenery.jpg"
            alt=""
            fill
            sizes="(max-width: 1080px) 100vw, 1080px"
            quality={85}
            className="object-cover object-center opacity-55 dark:opacity-40"
            style={{
              maskImage:
                "linear-gradient(to top, black 0%, black 35%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to top, black 0%, black 35%, transparent 100%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-background/20 to-background" />
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
