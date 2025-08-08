import React from "react";
import { Stack } from "./Project";
import { Link } from "./common/Link";

const TechStack = () => {
  return (
    <div className="text-sm grid gap-3">
      <p className="text-lg font-medium border-b text-secondary-foreground font-sans">
        Tech Stack
      </p>
      <div className="grid gap-2">
        <p className="italic font-sans text-muted-foreground">Frontend</p>
        <div className="flex flex-wrap gap-2">
          <Stack name={"Typescript"} />
          <Stack name={"React"} />
          <Stack name={"Next"} />
          <Stack name={"Tailwind CSS"} />
          <Stack name={"GSAP"} />
          <Stack name={"Motion"} />
          <Stack name={"React Query"} />
          <Stack name={"Apollo GraphQL"} />
          <Stack name={"Zustand"} />
        </div>
      </div>
      <div className="grid gap-2">
        <p className="italic font-sans text-muted-foreground">Backend</p>
        <div className="flex flex-wrap gap-2">
          <Stack name={"Node JS"} />
          <Stack name={"GraphQL"} />
          <Stack name={"Websocket"} />
          <Stack name={"WebRTC"} />
          <Stack name={"Postgress (SQL)"} />
          <Stack name={"MongoDB (No-SQL)"} />
          <Stack name={"Firebase (No-SQL)"} />
          <Stack name={"AWS (Cloud)"} />
          <Stack name={"Docker"} />
        </div>
      </div>
      <div className="grid gap-2">
        <p className="italic font-sans text-muted-foreground">Tools & Softwares</p>
        <div className="flex flex-wrap gap-2">
          <Stack name={"VS Code"} />
          <Stack name={"Postman"} />
          <Stack name={"Figma"} />
          <Stack name={"Git"} />
          <Stack name={"Notion"} />
          <Stack name={"Canva"} />
          <Stack name={"OBS"} />
          <Stack name={"ETH IDE"} />
          <Stack name={"SOL PLayground"} />
        </div>
      </div>
      <div className="grid gap-2">
        <p className="italic font-sans text-muted-foreground">Hardware Setup</p>
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
    </div>
  );
};

export default TechStack;
