"use client";

import Accordion from "@/components/common/Accordion";

export default function AccordionDemo() {
  return (
    <div className="w-full max-w-sm">
      <Accordion summary="Why grid-template-rows?">
        Animating 0fr to 1fr tweens height without measuring the content, and the inner
        overflow-hidden wrapper keeps padding out of the collapsed track.
      </Accordion>
    </div>
  );
}
