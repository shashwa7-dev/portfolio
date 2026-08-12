import Container from "@/components/layout/Container";
import Brand from "./Brand";

const Footer = () => {
  return (
    // No top rule: the boundary is carried by whitespace and by the scenery
    // fading in behind, not by a border. `relative z-10` keeps the footer above
    // <ViewportScenery />, which is pinned to the viewport bottom at z-0 from
    // the layout.
    <footer className="relative z-10 mt-12 h-[10rem] overflow-hidden py-6 md:h-[15rem]">
      <Container width="wide" className="relative z-[1] text-sm text-subtle">
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
      <Brand />
    </footer>
  );
};

export default Footer;
