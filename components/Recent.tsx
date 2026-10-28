"use client";

import { useEffect, useState } from "react";

type Item = { app: string; hash: string; at: string };
const KEY = "oauth-guides:recent";

export function saveRecent(item: Item) {
  try {
    const list: Item[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    localStorage.setItem(KEY, JSON.stringify([item, ...list.filter((i) => i.app !== item.app)].slice(0, 8)));
  } catch {
    // storage unavailable: the share link still works
  }
}

export function Recent() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
    } catch {
      setItems([]);
    }
  }, []);
  if (!items.length) return null;
  return (
    <section className="recent">
      <h2>Guides you generated</h2>
      <ul>
        {items.map((i) => (
          <li key={i.hash}>
            <a href={`/g#${i.hash}`}>{i.app}</a> <span className="muted small">{i.at.slice(0, 10)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
