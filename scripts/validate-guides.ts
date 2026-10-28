// Checks every curated guide against the schema and basic consistency rules.
// Run: npm run validate-guides
import fs from "node:fs";
import path from "node:path";
import { GuideSchema } from "../lib/schema";

const dir = path.join(process.cwd(), "data", "guides");
let failed = 0;
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const problems: string[] = [];
  const parsed = GuideSchema.safeParse(JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")));
  if (!parsed.success) {
    problems.push(...parsed.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`));
  } else {
    const g = parsed.data;
    if (`${g.slug}.json` !== file) problems.push(`slug "${g.slug}" does not match file name`);
    g.claims.forEach((c, i) => c.sources.forEach((s) => { if (!g.sources[s]) problems.push(`claims[${i}] cites missing source ${s}`); }));
    if (g.claims.some((c) => c.status === "tested")) problems.push("claims marked tested; only mark tested after a real setup attempt");
    if (g.steps.length < 5) problems.push("fewer than 5 steps");
    const counts = g.claims.reduce<Record<string, number>>((a, c) => ((a[c.status] = (a[c.status] ?? 0) + 1), a), {});
    console.log(`${file.padEnd(18)} ${g.difficulty.padEnd(10)} ${g.review.level.padEnd(20)} claims ${JSON.stringify(counts)} sources ${g.sources.length}`);
  }
  if (problems.length) { failed++; console.log(`  ✗ ${file}\n    ${problems.join("\n    ")}`); }
}
process.exit(failed ? 1 : 0);
