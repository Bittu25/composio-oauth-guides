"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Guide } from "@/lib/schema";
import { DIFFICULTY, REVIEW } from "@/lib/labels";
import { Logo } from "./Logo";
import { Meter } from "./Meter";

type Card = Pick<Guide, "slug" | "app" | "website" | "summary" | "difficulty" | "time" | "review" | "composio">;

export function Library({ guides }: { guides: Card[] }) {
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState<string>("all");
  const [managed, setManaged] = useState<string>("all");
  const [view, setView] = useState<"cards" | "table">("cards");

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
    <div>
      <div className="toolbar">
        <div className="search-field">
          <svg viewBox="0 0 20 20" aria-hidden><circle cx="9" cy="9" r="6" /><path d="m14 14 4 4" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter apps" aria-label="Filter guides" />
        </div>
        <select value={diff} onChange={(e) => setDiff(e.target.value)} aria-label="Difficulty">
          <option value="all">Any difficulty</option>
          {Object.entries(DIFFICULTY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={managed} onChange={(e) => setManaged(e.target.value)} aria-label="Composio managed app">
          <option value="all">Managed or not</option>
          <option value="available">Composio managed app</option>
          <option value="not_available">Bring your own app</option>
        </select>
        <div className="segmented" role="tablist" aria-label="View">
          <button role="tab" aria-selected={view === "cards"} className={view === "cards" ? "active" : ""} onClick={() => setView("cards")}>Cards</button>
          <button role="tab" aria-selected={view === "table"} className={view === "table" ? "active" : ""} onClick={() => setView("table")}>Compare</button>
        </div>
      </div>

      {!shown.length && <p className="empty">No guides match. Try generating one above.</p>}

      {view === "cards" ? (
        <div className="grid">
          {shown.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="card">
              <div className="card-top">
                <Logo name={g.app} website={g.website} />
                <div className="card-title">
                  <h3>{g.app}</h3>
                  <Meter difficulty={g.difficulty} />
                </div>
              </div>
              <p className="card-summary">{g.summary}</p>
              <div className="card-facts">
                <div><span>To production</span><strong>{g.time.toProduction}</strong></div>
                <div><span>Review</span><strong>{REVIEW[g.review.level]}</strong></div>
              </div>
              <div className="card-foot">
                {g.composio.managedApp === "available" ? (
                  <span className="pill pill-green">Composio managed app</span>
                ) : g.composio.managedApp === "not_available" ? (
                  <span className="pill pill-red">Bring your own app</span>
                ) : (
                  <span className="pill">Managed app unknown</span>
                )}
                <span className="card-arrow" aria-hidden>→</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="compare">
            <thead>
              <tr>
                <th>App</th>
                <th>Difficulty</th>
                <th>Hands-on</th>
                <th>Approval wait</th>
                <th>To production</th>
                <th>Review</th>
                <th>Composio</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((g) => (
                <tr key={g.slug}>
                  <td>
                    <Link href={`/guides/${g.slug}`} className="app-cell">
                      <Logo name={g.app} website={g.website} size={26} />
                      {g.app}
                    </Link>
                  </td>
                  <td><Meter difficulty={g.difficulty} /></td>
                  <td>{g.time.activeWork}</td>
                  <td>{g.time.approvalWait}</td>
                  <td>{g.time.toProduction}</td>
                  <td><span className={`pill review-${g.review.level}`}>{REVIEW[g.review.level]}</span></td>
                  <td>{g.composio.managedApp === "available" ? "Managed" : g.composio.managedApp === "not_available" ? <span className="text-red">Own app only</span> : "Unknown"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
