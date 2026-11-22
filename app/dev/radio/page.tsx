import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import RadioEditor from "@/components/dev/RadioEditor";

// proxy.ts answers /dev/* with a real 404 outside `npm run dev`; the check
// below is a second guard (it alone would stream the 404 page with a 200).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vice FM editor",
  robots: { index: false, follow: false },
};

/**
 * Dev only: preview, reorder, edit, remove and add the songs on Vice FM, the
 * GTA 6 mode's radio. Saving rewrites `components/gta6/track.ts` on disk
 * (through `app/api/dev/playlist`), so the change is an ordinary diff to
 * commit. Any build other than `npm run dev` is a 404 here.
 */
export default function RadioEditorPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <main className="pt-8 md:pt-12 pb-8 md:pb-12">
      <Container width="wide">
        <RadioEditor />
      </Container>
    </main>
  );
}
