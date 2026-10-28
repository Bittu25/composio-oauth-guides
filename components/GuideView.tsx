"use client";

import { useState } from "react";
import type { Guide } from "@/lib/schema";
import { CLAIM, DIFFICULTY, MANAGED, OWNER, REVIEW } from "@/lib/labels";
import { toMarkdown } from "@/lib/markdown";

export function GuideView({ guide: g, shareUrl }: { guide: Guide; shareUrl?: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, what: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(what);
    setTimeout(() => setCopied(null), 1600);
  };

  const download = () => {
    const blob = new Blob([toMarkdown(g)], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${g.slug}-oauth-guide.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const counts = g.claims.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <article className="guide">
      <header className="guide-head">
        <div className="eyebrow">{g.origin === "generated" ? "Generated live by the research agent" : "Curated guide"}</div>
        <h1>{g.app}</h1>
        <p className="lede">{g.summary}</p>
        <div className="chips">
          <span className={`chip diff-${g.difficulty}`}>{DIFFICULTY[g.difficulty]}</span>
          <span className={`chip review-${g.review.level}`}>{REVIEW[g.review.level]}</span>
          <span className={`chip managed-${g.composio.managedApp}`}>{MANAGED[g.composio.managedApp]}</span>
        </div>
        <div className="actions no-print">
          <button onClick={() => copy(shareUrl ?? window.location.href, "link")}>{copied === "link" ? "Copied" : "Copy share link"}</button>
          <button onClick={() => copy(toMarkdown(g), "md")}>{copied === "md" ? "Copied" : "Copy as Markdown"}</button>
          <button onClick={download}>Download .md</button>
          <a className="button" href={g.developerConsole} target="_blank" rel="noreferrer">Open developer console ↗</a>
        </div>
      </header>

      <section className="stats">
        <div><span>Hands-on time</span><strong>{g.time.activeWork}</strong></div>
        <div><span>Approval wait</span><strong>{g.time.approvalWait}</strong></div>
        <div><span>Until any user can connect</span><strong>{g.time.toProduction}</strong></div>
      </section>
      {g.time.notes && <p className="muted small time-notes">{g.time.notes}</p>}

      <section className="callouts">
        <div className="callout">
          <h3>Why it&apos;s {DIFFICULTY[g.difficulty].toLowerCase()}</h3>
          <p>{g.difficultyReason}</p>
        </div>
        <div className="callout">
          <h3>Review: {REVIEW[g.review.level]}</h3>
          <p>{g.review.details}</p>
        </div>
        <div className="callout">
          <h3>What works before approval</h3>
          <p>{g.limitsBeforeApproval}</p>
        </div>
        <div className="callout">
          <h3>On Composio</h3>
          <p>
            Toolkit <code>{g.composio.toolkit}</code>. {g.composio.note}
          </p>
        </div>
      </section>

      <section className="split">
        <div className="panel agent">
          <h2>What an agent can do for you</h2>
          <ul>{g.agentCanDo.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </div>
        <div className="panel you">
          <h2>What you must do yourself</h2>
          <ul>{g.developerMustDo.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </div>
      </section>

      {g.prerequisites.length > 0 && (
        <section>
          <h2>Before you start</h2>
          <ul className="prereqs">
            {g.prerequisites.map((p, i) => (
              <li key={i}>
                {p.blocking && <span className="tag blocker">Required</span>}
                <strong>{p.item}</strong> <span className="muted">{p.why}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2>Steps</h2>
        <ol className="steps">
          {g.steps.map((s, i) => (
            <li key={i}>
              <div className="step-head">
                <span className={`owner owner-${s.owner}`}>{OWNER[s.owner]}</span>
                <strong>{s.title}</strong>
              </div>
              <p>{s.detail}</p>
              {s.url && <a href={s.url} target="_blank" rel="noreferrer">{s.url.replace(/^https?:\/\//, "")}</a>}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2>Nuances that affect your setup</h2>
        <ul className="nuances">
          {g.nuances.map((n, i) => (
            <li key={i} className={`sev-${n.severity}`}>
              <strong>{n.title}</strong>
              <p>{n.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>If you get blocked</h2>
        <table className="blockers">
          <thead><tr><th>Problem</th><th>What to do</th></tr></thead>
          <tbody>
            {g.blockers.map((b, i) => (
              <tr key={i}><td>{b.problem}</td><td>{b.whatToDo}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Redirect URI</h2>
        <p>{g.redirectUri}</p>
      </section>

      <section>
        <h2>Evidence</h2>
        <p className="muted">
          {g.claims.length} key claims: {Object.entries(counts).map(([k, v]) => `${v} ${CLAIM[k as keyof typeof CLAIM].toLowerCase()}`).join(", ")}.
          Sourced means stated on a page listed below; inferred means reasoned from those pages.
        </p>
        <ul className="claims">
          {g.claims.map((c, i) => (
            <li key={i}>
              <span className={`tag claim-${c.status}`}>{CLAIM[c.status]}</span>
              {c.claim}{" "}
              {c.sources.filter((s) => g.sources[s]).map((s) => (
                <a key={s} href={g.sources[s].url} target="_blank" rel="noreferrer" className="ref">[{s + 1}]</a>
              ))}
            </li>
          ))}
        </ul>
        <h3>Sources</h3>
        <ol className="sources">
          {g.sources.map((s, i) => (
            <li key={i}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>
          ))}
        </ol>
        {g.openQuestions.length > 0 && (
          <>
            <h3>Still uncertain</h3>
            <ul>{g.openQuestions.map((q, i) => <li key={i}>{q}</li>)}</ul>
          </>
        )}
      </section>

      <footer className="muted small">Last checked {g.lastChecked}. Provider policies change; confirm against the sources before you submit for review.</footer>
    </article>
  );
}
