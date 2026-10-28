"use client";

import { useState } from "react";

function host(url: string) {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Provider favicon with a monogram fallback. */
export function Logo({ name, website, size = 36 }: { name: string; website: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const domain = host(website);
  const style = { width: size, height: size };
  if (!domain || failed) {
    return (
      <span className="logo logo-fallback" style={{ ...style, fontSize: size * 0.45 }} aria-hidden>
        {name.trim()[0]?.toUpperCase()}
      </span>
    );
  }
  return (
    <span className="logo" style={style} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt="" width={size * 0.6} height={size * 0.6} onError={() => setFailed(true)} />
    </span>
  );
}
