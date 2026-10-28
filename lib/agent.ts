import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { GuideSchema, type Guide } from "./schema";
import { COMPOSIO_MANAGED, MANAGED_SNAPSHOT_DATE, managedStatus } from "./composio";

const MODEL = "claude-opus-5-5";
// Server-side fallback: if a safety classifier declines, the API re-runs the
// request on a fallback model chosen by refusal category.
const BETAS = ["server-side-fallback-2026-07-01"];

export type AgentEvent =
  | { type: "status"; message: string }
  | { type: "search"; query: string }
  | { type: "fetch"; url: string }
  | { type: "note"; text: string }
  | { type: "guide"; guide: Guide }
  | { type: "error"; message: string };

const RESEARCH_SYSTEM = `You research how a developer registers their OWN OAuth app with a provider and gets it approved, so their AI agent (built on Composio) can let end users connect that provider.

Investigate with web_search and web_fetch. Prefer the provider's official developer docs, policy pages and changelogs over blogs. Fetch the key pages; do not rely on search snippets for important facts.

Find out, specifically:
1. Where the OAuth app is created (console URL) and account prerequisites: paid plan or tier, developer/partner account, test org or store, verified domain, company page, legal entity, privacy policy / terms / homepage URLs.
2. The approval regime: none, self-serve verification (domain, publisher, brand), human review by the provider, third-party security assessment, or a partner/paid program. What triggers it (e.g. certain scopes, number of users, public listing).
3. What works BEFORE approval (test users, development mode caps, unverified warnings, token expiry in testing).
4. Published timelines for review and realistic hands-on time.
5. Gotchas: redirect URI rules (https, localhost, exact match), scope classes, rate limits, recent policy changes (2024-2026), org/admin consent that customers must grant.
6. Which steps an AI agent could do for the developer (drafting policy text, choosing minimal scopes, pre-filling forms, checking config) versus what only the developer can do (accounts, payments, legal attestations, identity verification).

Be precise and honest. When a fact is not stated by a source you fetched, say it is inferred or uncertain. Note dates on policy pages.

Finish with plain research notes: findings grouped by the six points above, each important fact followed by the URL that supports it, then a list of open questions.`;

const WRITER_SYSTEM = `You turn research notes into a developer-facing OAuth setup guide that matches the given JSON schema.

Rules:
- Use only facts present in the research notes. Mark each key claim as "source" (stated by a cited page), "inferred" or "uncertain". Never use "tested".
- claims[].sources are 0-based indexes into the sources array you output; only list URLs that appear in the notes.
- Steps: 6-12 concrete steps in order, each owned by "agent", "developer" or "provider". Be honest about what an agent can do.
- Time estimates: give ranges; if no source states a number, the matching claim must be "inferred".
- composio.toolkit is the likely Composio toolkit slug (lowercase). For composio.managedApp use the managed-app list below: "available" if the app is on it; otherwise "not_available" if you are confident it is an OAuth app Composio would need a custom app for, else "unknown".
- The Composio redirect URI must be copied from the Composio dashboard when creating the auth config (docs show differing values). Mention this in redirectUri.
- Tight, specific prose. No marketing tone.

Composio-managed OAuth apps (snapshot ${MANAGED_SNAPSHOT_DATE}): ${COMPOSIO_MANAGED.join(", ")}.`;

function slugify(s: string) {
  return s.toLowerCase().replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

export async function* generateGuide(appQuery: string): AsyncGenerator<AgentEvent> {
  const client = new Anthropic();
  const today = new Date().toISOString().slice(0, 10);

  yield { type: "status", message: `Researching ${appQuery}` };

  const messages: Anthropic.Beta.BetaMessageParam[] = [
    {
      role: "user",
      content: `App to research: ${appQuery}\nToday's date: ${today}\nResearch how a developer creates and gets approval for their own OAuth app for this provider.`,
    },
  ];

  const pending: AgentEvent[] = [];
  const notes: string[] = [];

  // Research loop. Server tools run on Anthropic's side; a long turn can stop
  // with pause_turn, in which case we send the partial turn back to continue.
  for (let turn = 0; turn < 4; turn++) {
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 32000,
      betas: BETAS,
      fallbacks: "default",
      output_config: { effort: "medium" },
      system: RESEARCH_SYSTEM,
      tools: [
        { type: "web_search_20260209", name: "web_search", max_uses: 6 },
        { type: "web_fetch_20260209", name: "web_fetch", max_uses: 8 },
      ],
      messages,
    });

    stream.on("contentBlock", (block) => {
      if (block.type === "server_tool_use") {
        const input = block.input as { query?: string; url?: string };
        if (input.query) pending.push({ type: "search", query: input.query });
        else if (input.url) pending.push({ type: "fetch", url: input.url });
      } else if (block.type === "text" && block.text.trim()) {
        pending.push({ type: "note", text: block.text.trim().slice(0, 240) });
      }
    });

    // Drain progress events while the stream runs.
    const done = stream.finalMessage();
    let finished = false;
    done.then(() => (finished = true), () => (finished = true));
    while (!finished) {
      await new Promise((r) => setTimeout(r, 300));
      while (pending.length) yield pending.shift()!;
    }
    const message = await done;
    while (pending.length) yield pending.shift()!;

    if (message.stop_reason === "refusal") {
      yield { type: "error", message: "The model declined to research this request." };
      return;
    }

    for (const block of message.content) {
      if (block.type === "text") notes.push(block.text);
    }

    if (message.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: message.content });
      continue;
    }
    break;
  }

  const researchNotes = notes.join("\n\n").trim();
  if (!researchNotes) {
    yield { type: "error", message: "Research returned no notes." };
    return;
  }

  yield { type: "status", message: "Writing the guide" };

  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: BETAS,
    fallbacks: "default",
    output_config: { effort: "medium", format: betaZodOutputFormat(GuideSchema) },
    system: WRITER_SYSTEM,
    messages: [
      {
        role: "user",
        content: `App: ${appQuery}\nlastChecked: ${today}\n\nResearch notes:\n${researchNotes}`,
      },
    ],
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    yield { type: "error", message: "Could not produce a valid guide from the research." };
    return;
  }

  const guide: Guide = { ...response.parsed_output, origin: "generated", lastChecked: today };
  guide.slug = slugify(guide.slug || appQuery);
  if (managedStatus(guide.app.replace(/\s*\(.*\)$/, "")) === "available") {
    guide.composio.managedApp = "available";
  }

  yield { type: "guide", guide };
}
