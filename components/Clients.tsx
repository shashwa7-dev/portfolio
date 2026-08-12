import React from "react";
import Image from "next/image";
import Section from "@/components/layout/Section";
import { ArrowUpRight } from "lucide-react";
import { clients } from "@/lib/clients";

const Clients = () => {
  return (
    <Section id="clients" number="04" label="Trusted by" title="Teams I've worked with" width="reading">
      <div className="grid grid-cols-2 -sm:grid-cols-1 gap-2.5">
        {clients.map((client) => (
          <a
            key={client.name}
            href={client.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-card/60 transition-[border-color,background-color,transform,box-shadow] duration-200 ease-out hover:bg-card hover:border-border-strong hover:-translate-y-px hover:shadow-sm active:scale-[0.98]"
          >
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-secondary shrink-0 ring-1 ring-border transition-[box-shadow] duration-200 group-hover:ring-border-strong">
              <Image
                src={client.img}
                alt={client.name}
                fill
                sizes="32px"
                className="object-cover opacity-60 grayscale transition-[opacity,filter] duration-300 hover:opacity-100 hover:grayscale-0"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="font-medium text-sm text-foreground transition-colors duration-150 group-hover:text-foreground truncate">
                  {client.name}
                </span>
                <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-0 -translate-x-1 transition-[opacity,transform] duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0 shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground leading-snug truncate">
                {client.contribution}
              </p>
            </div>
          </a>
        ))}
      </div>
    </Section>
  );
};

export default Clients;
