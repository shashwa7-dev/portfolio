import Container from "@/components/layout/Container";
import Brand from "./Brand";

const Footer = () => {
  return (
    <footer className="border-t border-border py-6 mt-12 overflow-hidden relative h-[10rem] md:h-[15rem]">
      <Container width="wide" className="text-sm text-subtle">
        <p>
          &copy; {new Date().getFullYear()}{" / S7.dev / "}
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
