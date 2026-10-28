"use client";

import { useEffect, useState } from "react";
import type { Guide } from "@/lib/schema";
import { decodeGuide } from "@/lib/share";
import { GuideView } from "@/components/GuideView";

// Generated guides live entirely in the URL fragment (see lib/share.ts).
export default function SharedGuide() {
  const [guide, setGuide] = useState<Guide | null | undefined>(undefined);
  useEffect(() => {
    const read = () => setGuide(decodeGuide(window.location.hash));
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  if (guide === undefined) return <p className="muted">Loading guide…</p>;
  if (!guide) return <p className="error">This link does not contain a valid guide. It may have been cut off when it was copied.</p>;
  return <GuideView guide={guide} />;
}
