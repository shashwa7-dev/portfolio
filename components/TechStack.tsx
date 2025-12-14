import React from "react";
import { Link } from "./common/Link";
import SectionTitle from "./common/SectionTitle";
import { Layers } from "feather-icons-react";
import StackIcon from "./common/StackIcon";

const frontendStacks = [
  "html",
  "css",
  "javascript",
  "typescript",
  "react",
  "next",
  "tailwind",
  "shadcn",
  "chakraui",
  "gsap",
  "motion",
  "reactQuery",
  "zustand",
  "wagmi",
  "solana",
] as const;
const aiStacks = ["openai", "googleGemini", "claude"] as const;
const protocolStaks = ["restAPI", "graphql", "websocket", "webrtc"] as const;
const backendStacks = [
  "node",
  "bun",
  "postgres",
  "mongodb",
  "firebase",
  "supabase",
] as const;
const devopsStacks = [
  "git",
  "github",
  "docker",
  "aws",
  "cloudflare",
  "vercel",
] as const;
const toolStacks = ["vscode", "figma", "notion", "postman"] as const;
const mixStacks = ["coffee", "spotify", "youtube", "playstation"] as const;
const TechStack = () => {
  return (
    <div className="text-sm grid gap-3">
      <SectionTitle
        title="Tech Stack"
        icon={<Layers className={"w-4 h-4"} />}
      />
      <div className="grid gap-2 h-fit">
        <p className="italic font-sans text-muted-foreground">Frontend</p>
        <div className="flex flex-wrap gap-2">
          {frontendStacks.map((name) => (
            <StackIcon key={name} name={name} />
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="grid gap-2 h-fit">
          <p className="italic font-sans text-muted-foreground">
            Backend & Database
          </p>
          <div className="flex flex-wrap gap-2">
            {backendStacks.map((name) => (
              <StackIcon key={name} name={name} />
            ))}
          </div>
        </div>
        <div className="grid gap-2 h-fit">
          <p className="italic font-sans text-muted-foreground">
            DevOps & Infra
          </p>
          <div className="flex flex-wrap gap-2">
            {devopsStacks.map((name) => (
              <StackIcon key={name} name={name} />
            ))}
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="grid gap-2 h-fit">
          <p className="italic font-sans text-muted-foreground">
            Protocols / APIs
          </p>
          <div className="flex flex-wrap gap-2">
            {protocolStaks.map((name) => (
              <StackIcon key={name} name={name} />
            ))}
          </div>
        </div>
        <div className="grid gap-2 h-fit">
          <p className="italic font-sans text-muted-foreground">AI Stack</p>
          <div className="flex flex-wrap gap-2">
            {aiStacks.map((name) => (
              <StackIcon key={name} name={name} />
            ))}
          </div>
        </div>

        <div className="grid gap-2 h-fit">
          <p className="italic font-sans text-muted-foreground">
            Tools & Softwares
          </p>
          <div className="flex flex-wrap gap-2">
            {toolStacks.map((name) => (
              <StackIcon key={name} name={name} />
            ))}
          </div>
        </div>
        <div className="grid gap-2 h-fit">
          <p className="italic font-sans text-muted-foreground">
            Hardware Setup
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              name={"Mac M1 Air"}
              link="https://www.amazon.in/Apple-MacBook-Chip-13-inch-256GB/dp/B08N5W4NNB"
            />
            <Link
              name={"LG UHD 27Inch"}
              link="https://www.amazon.in/LG-68-58-Inches-3840x2160-DisplayHDR/dp/B0B2JVLDFQ/ref=sr_1_5?crid=2P10F3B7LZ1TT&dib=eyJ2IjoiMSJ9.5m7FvKdXOUWf_VbvpmmSnyjv9t1_uE5yxZ2t8Im_FnyCImTUFhbLSvCnAR6rih64pz5BeJUHQSKUdMc3vMKVS_IaimdtG45tPXSsy7PNR5bOM_nhkb-1qr2TdGMoJxQTguwO5cmTfVxDkki2cr33_9vON3LlZrDo8hB24Zy-C4JBP6sJbfXnheuxS77vKMVB84KnEEqtUg7WdnTbdoax-7e8IJ2ouaz8xcYkQhFN0-8.58D6QrY8gsCsqSnn-OoqqD6NX-hQPezotcTtKDYqUdM&dib_tag=se&keywords=lg+27+inch+monitor+usb+c&nsdOptOutParam=true&qid=1736677594&sprefix=lg+27+inch+monitor+usb+c%2Caps%2C206&sr=8-5"
            />
            <Link
              name={"Keychron K2"}
              link="https://keychron.in/product/keychron-k2-v-2/"
            />
          </div>
        </div>
        <div className="grid gap-2 h-fit">
          <p className="italic font-sans text-muted-foreground">Powered By</p>
          <div className="flex flex-wrap gap-2">
            {mixStacks.map((name) => (
              <StackIcon key={name} name={name} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechStack;
