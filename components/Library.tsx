"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Guide } from "@/lib/schema";
import { DIFFICULTY, REVIEW } from "@/lib/labels";

type Card = Pick<Guide, "slug" | "app" | "summary" | "difficulty" | "time" | "review" | "composio">;

export function Library({ guides }: { guides: Card[] }) {
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState<string>("all");
  const [managed, setManaged] = useState<string>("all");

  const shown = useMemo(
    () =>
      guides.filter(
        (g) =>
          (diff === "all" || g.difficulty === diff) &&
          (managed === "all" || g.composio.managedApp === managed) &&
          (!q || `${g.app} ${g.composio.toolkit}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [guides, q, diff, managed],
  );

  return (
    <section>
      <div className="filters">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter the library" aria-label="Filter guides" />
        <select value={diff} onChange={(e) => setDiff(e.target.value)} aria-label="Difficulty">
          <option value="all">Any difficulty</option>
          {Object.entries(DIFFICULTY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={managed} onChange={(e) => setManaged(e.target.value)} aria-label="Composio managed app">
          <option value="all">Managed or not</option>
          <option value="available">Composio managed app available</option>
          <option value="not_available">Bring your own app only</option>
        </select>
      </div>
      <div className="grid">
        {shown.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="card">
            <div className="card-top">
              <h3>{g.app}</h3>
              <span className={`chip diff-${g.difficulty}`}>{DIFFICULTY[g.difficulty]}</span>
            </div>
            <p>{g.summary}</p>
            <dl>
              <div><dt>To production</dt><dd>{g.time.toProduction}</dd></div>
              <div><dt>Review</dt><dd>{REVIEW[g.review.level]}</dd></div>
            </dl>
            {g.composio.managedApp === "not_available" && <span className="tag byo">No Composio managed app</span>}
          </Link>
        ))}
        {!shown.length && <p className="muted">No guides match. Generate one above.</p>}
      </div>
    </section>
  );
}
