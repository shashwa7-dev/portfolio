"use client";

import Accordion from "@/components/common/Accordion";

export default function AccordionDemo() {
  return (
    <div className="w-full max-w-sm">
      <Accordion summary="Why grid-template-rows?">
        Height animates with pure CSS.
      </Accordion>
    </div>
  );
}
