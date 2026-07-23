import Accordion from "@/components/common/Accordion";
import Section from "@/components/layout/Section";
import { faqLd } from "@/lib/seo";

const faqs = [
  { q: "Are you available for new work?", a: "Yes. I'm open to senior frontend and full-stack roles, plus freelance or consulting engagements. The fastest way to start is an email to contact@shashwa7.in." },
  { q: "What's your core stack?", a: "React, Next.js, TypeScript and Tailwind on the frontend. On the backend I work with Node, PostgreSQL, Vercel, AWS and event/trigger workflows (Trigger.dev). I've shipped a lot of AI-integrated interfaces (agents, chat, workflow authoring, generated-asset review) and Web3 (wagmi, Solana) across the stack." },
  { q: "Do you work remotely?", a: "Yes, remote-first. I've collaborated with distributed teams and partners including ShopOS, Coinbase, Polygon and Sentient." },
  { q: "What kind of projects do you take on?", a: "Product UIs, design systems, complex AI and Web3 frontends, and performance work. I can own a build end to end or embed with an existing team." },
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
      <div className="overflow-hidden rounded-2xl border border-border">
        {faqs.map((f) => (
          <Accordion key={f.q} summary={f.q}>
            {f.a}
          </Accordion>
        ))}
      </div>
    </Section>
  );
}
