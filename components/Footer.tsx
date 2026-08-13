import Container from "@/components/layout/Container";
import Brand from "./Brand";
import FooterScenery from "./FooterScenery";

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

      {/* Scenery band, full viewport width: it sits directly on the footer
          rather than inside the Container above, which is scoped to the
          copyright line. */}
      <FooterScenery />

      {/* Wordmark, bleeding off the bottom edge, above the scenery. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] overflow-hidden"
      >
        <Brand />
      </div>
    </footer>
  );
};

export default Footer;
