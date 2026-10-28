"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Guide } from "@/lib/schema";
import { CLAIM, DIFFICULTY, MANAGED, OWNER, REVIEW } from "@/lib/labels";
import { toMarkdown } from "@/lib/markdown";
import { Logo } from "./Logo";
import { Meter } from "./Meter";

const SECTIONS = [
  ["overview", "Overview"],
  ["split", "Agent vs you"],
  ["prereqs", "Before you start"],
  ["steps", "Steps"],
  ["nuances", "Nuances"],
  ["blockers", "If you get blocked"],
  ["redirect", "Redirect URI"],
  ["evidence", "Evidence"],
] as const;

export function GuideView({ guide: g, shareUrl }: { guide: Guide; shareUrl?: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [done, setDone] = useState<boolean[]>(() => g.steps.map(() => false));
  const [active, setActive] = useState<string>("overview");
  const storeKey = `oauth-guides:progress:${g.slug}:${g.lastChecked}`;

  // Step progress is a per-viewer convenience, so it lives in localStorage.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey) ?? "null");
      if (Array.isArray(saved) && saved.length === g.steps.length) setDone(saved);
    } catch {}
  }, [storeKey, g.steps.length]);

  useEffect(() => {
    const els = SECTIONS.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const toggle = (i: number) =>
    setDone((d) => {
      const next = d.map((v, j) => (j === i ? !v : v));
      try {
        localStorage.setItem(storeKey, JSON.stringify(next));
      } catch {}
      return next;
    });

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

  const counts = { source: 0, tested: 0, inferred: 0, uncertain: 0 } as Record<string, number>;
  g.claims.forEach((c) => (counts[c.status] += 1));
  const total = g.claims.length || 1;
  const doneCount = done.filter(Boolean).length;

  return (
    <div className="guide-layout">
      <aside className="toc no-print">
        <Link href="/#library" className="back">← All guides</Link>
        <div className="toc-title">On this page</div>
        <nav>
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? "active" : ""}>{label}</a>
          ))}
        </nav>
        <div className="toc-progress">
          <div className="toc-title">Your progress</div>
          <div className="bar"><span style={{ width: `${(doneCount / g.steps.length) * 100}%` }} /></div>
          <div className="small muted">{doneCount} of {g.steps.length} steps done</div>
        </div>
      </aside>

      <article className="guide">
        <header className="guide-head" id="overview">
          <div className="eyebrow">{g.origin === "generated" ? "Generated live by the research agent" : "Curated guide"} · checked {g.lastChecked}</div>
          <div className="guide-title">
            <Logo name={g.app} website={g.website} size={52} />
            <h1>{g.app}</h1>
          </div>
          <p className="lede">{g.summary}</p>
          <div className="chips">
            <Meter difficulty={g.difficulty} />
            <span className={`pill review-${g.review.level}`}>{REVIEW[g.review.level]}</span>
            <span className={`pill managed-${g.composio.managedApp}`}>{MANAGED[g.composio.managedApp]}</span>
          </div>
          <div className="actions no-print">
            <button className="primary" onClick={() => copy(shareUrl ?? window.location.href, "link")}>{copied === "link" ? "Link copied" : "Copy share link"}</button>
            <button onClick={() => copy(toMarkdown(g), "md")}>{copied === "md" ? "Copied" : "Copy as Markdown"}</button>
            <button onClick={download}>Download .md</button>
            <a className="button" href={g.developerConsole} target="_blank" rel="noreferrer">Developer console ↗</a>
          </div>
        </header>

        <section className="stats">
          <div><span>Hands-on time</span><strong>{g.time.activeWork}</strong></div>
          <div><span>Approval wait</span><strong>{g.time.approvalWait}</strong></div>
          <div className="highlight"><span>Until any user can connect</span><strong>{g.time.toProduction}</strong></div>
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
            <p>Toolkit <code>{g.composio.toolkit}</code>. {g.composio.note}</p>
          </div>
        </section>

        <section className="split" id="split">
          <div className="panel agent">
            <h2><span className="panel-icon">✦</span> What an agent can do for you</h2>
            <ul>{g.agentCanDo.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
          <div className="panel you">
            <h2><span className="panel-icon">●</span> What you must do yourself</h2>
            <ul>{g.developerMustDo.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
        </section>

        {g.prerequisites.length > 0 && (
          <section id="prereqs">
            <h2>Before you start</h2>
            <ul className="prereqs">
              {g.prerequisites.map((p, i) => (
                <li key={i}>
                  <div>
                    <strong>{p.item}</strong>
                    {p.blocking && <span className="pill pill-red">Required</span>}
                  </div>
                  <span className="muted">{p.why}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section id="steps">
          <div className="section-row">
            <h2>Steps</h2>
            <div className="legend small">
              <span className="owner owner-agent">Agent</span>
              <span className="owner owner-developer">You</span>
              <span className="owner owner-provider">Provider</span>
            </div>
          </div>
          <ol className="steps">
            {g.steps.map((s, i) => (
              <li key={i} className={done[i] ? "is-done" : ""}>
                <button className="check no-print" aria-pressed={done[i]} aria-label={`Mark step ${i + 1} done`} onClick={() => toggle(i)}>
                  {done[i] ? "✓" : i + 1}
                </button>
                <div className="step-body">
                  <div className="step-head">
                    <strong>{s.title}</strong>
                    <span className={`owner owner-${s.owner}`}>{OWNER[s.owner]}</span>
                  </div>
                  <p>{s.detail}</p>
                  {s.url && <a href={s.url} target="_blank" rel="noreferrer" className="step-link">{s.url.replace(/^https?:\/\//, "")} ↗</a>}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="nuances">
          <h2>Nuances that affect your setup</h2>
          <div className="nuances">
            {g.nuances.map((n, i) => (
              <div key={i} className={`nuance sev-${n.severity}`}>
                <span className="sev-tag">{n.severity === "blocker" ? "Blocker" : n.severity === "warning" ? "Watch out" : "Good to know"}</span>
                <strong>{n.title}</strong>
                <p>{n.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="blockers">
          <h2>If you get blocked</h2>
          <div className="blockers">
            {g.blockers.map((b, i) => (
              <div key={i} className="blocker-row">
                <div className="blocker-problem">{b.problem}</div>
                <div className="blocker-fix">{b.whatToDo}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="redirect">
          <h2>Redirect URI</h2>
          <div className="callout"><p>{g.redirectUri}</p></div>
        </section>

        <section id="evidence">
          <h2>Evidence</h2>
          <div className="evidence-bar" aria-label="Claim status breakdown">
            {(["tested", "source", "inferred", "uncertain"] as const).map((k) =>
              counts[k] ? <span key={k} className={`seg seg-${k}`} style={{ width: `${(counts[k] / total) * 100}%` }} title={`${counts[k]} ${CLAIM[k]}`} /> : null,
            )}
          </div>
          <div className="evidence-legend small">
            {(["tested", "source", "inferred", "uncertain"] as const).map((k) =>
              counts[k] ? <span key={k}><i className={`dot seg-${k}`} /> {counts[k]} {CLAIM[k].toLowerCase()}</span> : null,
            )}
          </div>
          <p className="muted small">Sourced means stated on a page listed below. Inferred means reasoned from those pages. Uncertain means it could not be confirmed.</p>
          <ul className="claims">
            {g.claims.map((c, i) => (
              <li key={i}>
                <span className={`pill claim-${c.status}`}>{CLAIM[c.status]}</span>
                <span>
                  {c.claim}{" "}
                  {c.sources.filter((s) => g.sources[s]).map((s) => (
                    <a key={s} href={g.sources[s].url} target="_blank" rel="noreferrer" className="ref">[{s + 1}]</a>
                  ))}
                </span>
              </li>
            ))}
          </ul>
          <h3>Sources</h3>
          <ol className="sources">
            {g.sources.map((s, i) => (
              <li key={i}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a> <span className="muted small">{s.url.replace(/^https?:\/\//, "").split("/")[0]}</span></li>
            ))}
          </ol>
          {g.openQuestions.length > 0 && (
            <div className="callout open-q">
              <h3>Still uncertain</h3>
              <ul>{g.openQuestions.map((q, i) => <li key={i}>{q}</li>)}</ul>
            </div>
          )}
        </section>

        <footer className="muted small guide-foot">Last checked {g.lastChecked}. Provider policies change; confirm against the sources before you submit for review.</footer>
      </article>
    </div>
  );
}
