"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AgentEvent } from "@/lib/agent";
import { encodeGuide } from "@/lib/share";
import { saveRecent } from "./Recent";

type Known = { slug: string; app: string; toolkit: string };

const norm = (s: string) => s.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[^a-z0-9]/g, "");

export function Generate({ known }: { known: Known[] }) {
  const router = useRouter();
  const [app, setApp] = useState("");
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<AgentEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const started = useRef<number>(0);

  const q = norm(app);
  const match = q.length > 2 ? known.find((k) => norm(k.app).startsWith(q) || norm(k.toolkit) === q || q.startsWith(norm(k.toolkit))) : undefined;

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!app.trim() || running) return;
    setRunning(true);
    setError(null);
    setLog([]);
    started.current = Date.now();
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app }),
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
            const hash = encodeGuide(ev.guide);
            saveRecent({ app: ev.guide.app, hash, at: new Date().toISOString() });
            router.push(`/g#${hash}`);
            return;
          }
          if (ev.type === "error") throw new Error(ev.message);
          setLog((l) => [...l, ev]);
        }
      }
      throw new Error("The connection closed before the guide was ready. Try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setRunning(false);
    }
  }

  return (
    <div className="generate">
      <form onSubmit={run}>
        <input
          value={app}
          onChange={(e) => setApp(e.target.value)}
          placeholder="Any app name or website, e.g. Xero, pipedrive.com, Calendly"
          aria-label="App name or website"
          disabled={running}
        />
        <button type="submit" disabled={running || !app.trim()}>
          {running ? "Researching…" : "Generate guide"}
        </button>
      </form>
      {match && !running && (
        <p className="hint">
          There is a curated guide for <Link href={`/guides/${match.slug}`}>{match.app}</Link>. You can still generate a fresh one.
        </p>
      )}
      {(running || log.length > 0) && (
        <div className="log" aria-live="polite">
          <div className="log-head">
            <span className="pulse" /> Agent working on <strong>{app}</strong>. This usually takes 2 to 4 minutes.
          </div>
          <ul>
            {log.map((ev, i) => (
              <li key={i} className={`ev ev-${ev.type}`}>
                {ev.type === "status" && <>● {ev.message}</>}
                {ev.type === "search" && <>Searching: <em>{ev.query}</em></>}
                {ev.type === "fetch" && <>Reading: <a href={ev.url} target="_blank" rel="noreferrer">{ev.url.replace(/^https?:\/\//, "").slice(0, 90)}</a></>}
                {ev.type === "note" && <span className="muted">{ev.text}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
