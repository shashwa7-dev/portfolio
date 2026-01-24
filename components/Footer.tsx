import React from "react";
import CurrentTime from "./CurrentTime";

const Footer = () => {
  return (
    <footer className="border-t border-border py-6 mt-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <CurrentTime />
          <p>
            &copy; {new Date().getFullYear()} Shashwat Tripathi •{" "}
            <a
              href="https://github.com/shashwa7-dev/portfolio/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-accent transition-colors underline underline-offset-4"
            >
              MIT License
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
