import fs from "node:fs";
import path from "node:path";
import { GuideSchema, type Guide } from "./schema";

const DIR = path.join(process.cwd(), "data", "guides");

let cache: Guide[] | null = null;

/** Curated guides checked into data/guides. Invalid files are skipped loudly. */
export function getGuides(): Guide[] {
  if (cache) return cache;
  const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith(".json")) : [];
  const guides: Guide[] = [];
  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8"));
    const parsed = GuideSchema.safeParse(raw);
    if (!parsed.success) {
      console.warn(`Skipping invalid guide ${file}:`, parsed.error.issues.slice(0, 3));
      continue;
    }
    guides.push({ ...parsed.data, origin: "curated" });
  }
  const order = { easy: 0, moderate: 1, hard: 2, very_hard: 3 } as const;
  guides.sort((a, b) => order[a.difficulty] - order[b.difficulty] || a.app.localeCompare(b.app));
  cache = guides;
  return guides;
}

export function getGuide(slug: string): Guide | undefined {
  return getGuides().find((g) => g.slug === slug);
}
