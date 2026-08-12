import Image from "next/image";
import Container from "@/components/layout/Container";
import Brand from "./Brand";

const Footer = () => {
  return (
    <footer className="relative mt-12 h-[10rem] overflow-hidden py-6 md:h-[15rem]">
      {/* Scenery. Sits furthest back and fades upward so it dissolves into the
          page rather than reading as a pasted photo with a hard top edge. The
          mask does the fade, the gradient wash pulls it toward --background so
          it tracks whichever theme is active, and the opacity keeps it quiet
          enough that the copy on top stays legible. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 select-none"
      >
        <Image
          src="/images/footer-scenery.jpg"
          alt=""
          fill
          sizes="100vw"
          quality={85}
          className="object-cover object-center opacity-45 dark:opacity-25"
          style={{
            maskImage:
              "linear-gradient(to top, black 0%, black 20%, transparent 90%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, black 20%, transparent 90%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-background/60 to-background" />
      </div>

      <Container width="wide" className="text-sm text-subtle">
        <p>
          &copy; {new Date().getFullYear()}
          {" / S7.dev / "}
          <a
            href="https://github.com/shashwa7-dev/portfolio/blob/master/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground decoration-subtle hover:decoration-foreground transition-colors underline underline-offset-4"
          >
            MIT License
          </a>
        </p>
      </Container>
      <Brand />
    </footer>
  );
};

export default Footer;
