import type { Guide } from "./schema";
import { CLAIM, DIFFICULTY, MANAGED, OWNER, REVIEW } from "./labels";

export function toMarkdown(g: Guide): string {
  const L: string[] = [];
  L.push(`# ${g.app}: OAuth app setup guide`, "");
  L.push(`${g.summary}`, "");
  L.push(`- **Difficulty:** ${DIFFICULTY[g.difficulty]} (${g.difficultyReason})`);
  L.push(`- **Hands-on time:** ${g.time.activeWork}`);
  L.push(`- **Approval wait:** ${g.time.approvalWait}`);
  L.push(`- **To production:** ${g.time.toProduction}`);
  if (g.time.notes) L.push(`- **About these estimates:** ${g.time.notes}`);
  L.push(`- **Review:** ${REVIEW[g.review.level]}. ${g.review.details}`);
  L.push(`- **Before approval:** ${g.limitsBeforeApproval}`);
  L.push(`- **Composio:** ${MANAGED[g.composio.managedApp]} (toolkit \`${g.composio.toolkit}\`). ${g.composio.note}`);
  L.push(`- **Developer console:** ${g.developerConsole}`, "");
  L.push("## Prerequisites", "");
  for (const p of g.prerequisites) L.push(`- ${p.blocking ? "**[blocking]** " : ""}${p.item}: ${p.why}`);
  L.push("", "## Steps", "");
  g.steps.forEach((s, i) => L.push(`${i + 1}. **${s.title}** _(${OWNER[s.owner]})_: ${s.detail}${s.url ? ` ([link](${s.url}))` : ""}`));
  L.push("", "## What an agent can do for you", "");
  for (const a of g.agentCanDo) L.push(`- ${a}`);
  L.push("", "## What you must do yourself", "");
  for (const a of g.developerMustDo) L.push(`- ${a}`);
  L.push("", "## Nuances", "");
  for (const n of g.nuances) L.push(`- **${n.title}** (${n.severity}): ${n.detail}`);
  L.push("", "## If you get blocked", "");
  for (const b of g.blockers) L.push(`- **${b.problem}**: ${b.whatToDo}`);
  L.push("", "## Redirect URI", "", g.redirectUri, "");
  L.push("## Evidence", "");
  for (const c of g.claims) {
    const refs = c.sources.map((i) => (g.sources[i] ? `[${i + 1}]` : "")).join("");
    L.push(`- ${CLAIM[c.status]}: ${c.claim} ${refs}`);
  }
  L.push("", "### Sources", "");
  g.sources.forEach((s, i) => L.push(`${i + 1}. [${s.title}](${s.url})`));
  if (g.openQuestions.length) {
    L.push("", "## Open questions", "");
    for (const q of g.openQuestions) L.push(`- ${q}`);
  }
  L.push("", `_Last checked ${g.lastChecked}. ${g.origin === "generated" ? "Generated live by the research agent." : "Curated guide."}_`);
  return L.join("\n");
}
