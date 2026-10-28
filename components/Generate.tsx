"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AgentEvent } from "@/lib/agent";
import { encodeGuide } from "@/lib/share";
import { saveRecent } from "./Recent";

type Known = { slug: string; app: string; toolkit: string };
type Phase = "idle" | "research" | "write" | "done";

const EXAMPLES = ["Xero", "Calendly", "Pipedrive", "Intercom", "dropbox.com"];

const norm = (s: string) => s.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[^a-z0-9]/g, "");

export function Generate({ known }: { known: Known[] }) {
  const router = useRouter();
  const [app, setApp] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [log, setLog] = useState<AgentEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const target = useRef("");
  const logEnd = useRef<HTMLLIElement>(null);
  const running = phase === "research" || phase === "write";

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    logEnd.current?.scrollIntoView({ block: "nearest" });
  }, [log.length]);

  const q = norm(app);
  const match = q.length > 2 ? known.find((k) => norm(k.app).startsWith(q) || norm(k.toolkit) === q || q.startsWith(norm(k.toolkit))) : undefined;
  const searches = log.filter((e) => e.type === "search").length;
  const reads = log.filter((e) => e.type === "fetch").length;

  async function run(name: string) {
    if (!name.trim() || running) return;
    target.current = name.trim();
    setPhase("research");
    setError(null);
    setLog([]);
    setSeconds(0);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app: name }),
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const ev = JSON.parse(line) as AgentEvent;
          if (ev.type === "guide") {
            setPhase("done");
            const hash = encodeGuide(ev.guide);
            saveRecent({ app: ev.guide.app, hash, at: new Date().toISOString() });
            router.push(`/g#${hash}`);
            return;
          }
          if (ev.type === "error") throw new Error(ev.message);
          if (ev.type === "status" && ev.message.includes("Writing")) setPhase("write");
          // Skip an event identical to the previous one (a repeated query adds nothing to the log).
          setLog((l) => (l.length && JSON.stringify(l[l.length - 1]) === line ? l : [...l, ev]));
        }
      }
      throw new Error("The connection closed before the guide was ready. Try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase("idle");
    }
  }

  const steps: { key: Phase; label: string }[] = [
    { key: "research", label: "Researching official docs" },
    { key: "write", label: "Writing the guide" },
    { key: "done", label: "Ready to share" },
  ];
  const order = { idle: -1, research: 0, write: 1, done: 2 };

  return (
    <div className="generate">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(app);
        }}
        className="gen-form"
      >
        <svg viewBox="0 0 20 20" aria-hidden className="gen-icon"><circle cx="9" cy="9" r="6" /><path d="m14 14 4 4" /></svg>
        <input
          value={app}
          onChange={(e) => setApp(e.target.value)}
          placeholder="Any app name or website"
          aria-label="App name or website"
          disabled={running}
        />
        <button type="submit" disabled={running || !app.trim()}>
          {running ? "Working…" : "Generate guide"}
        </button>
      </form>

      {!running && (
        <div className="examples">
          <span className="muted">Try an app outside the library:</span>
          {EXAMPLES.map((x) => (
            <button
              key={x}
              type="button"
              className="chip-btn"
              onClick={() => {
                setApp(x);
                run(x);
              }}
            >
              {x}
            </button>
          ))}
        </div>
      )}

      {match && !running && (
        <p className="hint">
          A curated guide exists for <Link href={`/guides/${match.slug}`}>{match.app}</Link>. You can still generate a fresh one.
        </p>
      )}

      {(running || phase === "done") && (
        <div className="run" aria-live="polite">
          <div className="run-head">
            <div>
              <div className="run-title">Agent working on <strong>{target.current}</strong></div>
              <div className="muted small">Usually 2 to 4 minutes. You can watch every search and page it reads.</div>
            </div>
            <div className="run-meta">
              <span><strong>{searches}</strong> searches</span>
              <span><strong>{reads}</strong> pages read</span>
              <span className="run-time">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span>
            </div>
          </div>
          <ol className="phases">
            {steps.map((s) => (
              <li key={s.key} className={order[phase] > order[s.key] ? "done" : order[phase] === order[s.key] ? "active" : ""}>
                <span className="dot" />
                {s.label}
              </li>
            ))}
          </ol>
          <ul className="run-log">
            {log.map((ev, i) => (
              <li key={i} className={`ev ev-${ev.type}`}>
                {ev.type === "status" && <span className="ev-status">{ev.message}</span>}
                {ev.type === "search" && (
                  <>
                    <span className="ev-kind">Search</span>
                    <em>{ev.query}</em>
                  </>
                )}
                {ev.type === "fetch" && (
                  <>
                    <span className="ev-kind">Read</span>
                    <a href={ev.url} target="_blank" rel="noreferrer">{ev.url.replace(/^https?:\/\//, "").slice(0, 90)}</a>
                  </>
                )}
                {ev.type === "note" && (
                  <>
                    <span className="ev-kind">Note</span>
                    <span className="muted">{ev.text}</span>
                  </>
                )}
              </li>
            ))}
            <li ref={logEnd} aria-hidden />
          </ul>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
