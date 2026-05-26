import Section from "@/components/layout/Section";
import { faqLd } from "@/lib/seo";

const faqs = [
  { q: "Are you available for new work?", a: "Yes. I'm open to senior frontend and full-stack roles, plus freelance or consulting engagements. The fastest way to start is an email to contact@shashwa7.in." },
  { q: "What's your core stack?", a: "React, Next.js, TypeScript and Tailwind on the frontend, with comfort across the full stack. I've shipped a lot of Web3 (wagmi, Solana) and AI-integrated interfaces." },
  { q: "Do you work remotely?", a: "Yes, remote-first. I've collaborated with distributed teams and partners including Coinbase, Polygon and Sentient." },
  { q: "What kind of projects do you take on?", a: "Product UIs, design systems, complex Web3 and AI frontends, and performance work. I can own a build end to end or embed with an existing team." },
  { q: "How do we get started?", a: "Email contact@shashwa7.in with a short note about your project or role, and I'll reply quickly." },
];

export default function Faq() {
  return (
    <Section id="faq" number="06" label="FAQ" title="Questions, answered" width="reading">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd(faqs)) }}
      />
      <dl className="space-y-6">
        {faqs.map((f) => (
          <div key={f.q} className="space-y-1.5">
            <dt className="font-medium text-foreground">{f.q}</dt>
            <dd className="text-[15px] leading-relaxed text-muted-foreground">{f.a}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
