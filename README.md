# OAuth App Guides

A tool for developers and agent builders who need their **own OAuth app** registered and approved by a provider before their users can connect it (for example, to move off Composio's managed app or to integrate an app Composio has no managed app for).

Look up an app to see:

- how hard it is and why
- hands-on time, approval wait and realistic time to production
- what works before approval (test-user caps, unverified warnings, token expiry)
- requirements and nuances that change the setup
- which steps an agent can do for you and where you must take over
- what to do when you hit a blocker
- the evidence behind each claim (sourced, inferred or uncertain) and what is still unknown

It has two parts:

1. **A curated library** of guides for 12 apps with very different setup paths, each researched against official provider docs.
2. **Live generation**: enter any app name or website and a research agent investigates it in real time and produces a shareable guide in the same format, including for apps outside the library.

## Run it locally

Requirements: Node 20+ and an Anthropic API key.

```bash
npm install
cp .env.example .env.local   # then set ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

Other scripts:

```bash
npm run build            # production build
npm run typecheck        # TypeScript
npm run validate-guides  # schema and evidence checks for data/guides/*.json
```

## Deploy

The app is a standard Next.js 15 project. On Vercel: import the repo, set `ANTHROPIC_API_KEY` in the project's environment variables and deploy. The generate route sets `maxDuration = 300`, so live generation needs a plan that allows 300-second functions (Vercel's default with Fluid compute).

## How it works

```
app/page.tsx              home: generate box + library
app/guides/[slug]         curated guide pages (static)
app/g                     generated guide, decoded from the URL fragment
app/api/generate          streams agent progress and the final guide as NDJSON
lib/agent.ts              research + writing agent
lib/schema.ts             the guide schema (shared by library and agent)
lib/composio.ts           snapshot of Composio's managed OAuth app directory
data/guides/*.json        curated guides
scripts/validate-guides   checks every curated guide
```

**Live generation** runs in two steps on Claude Opus 5.5:

1. **Research.** The model uses Anthropic's server-side `web_search` and `web_fetch` tools to investigate the provider, preferring official developer docs and policy pages, and writes notes with a URL behind each fact. Each search and page read streams to the browser so the developer can watch it work.
2. **Write.** A second call converts the notes into the guide schema with structured outputs. It may only use facts from the notes and must label each claim as sourced, inferred or uncertain. Composio managed-app status comes from the directory snapshot, not the model.

Both calls opt into server-side fallback (`fallbacks: "default"`), so a safety-classifier decline is retried on a fallback model rather than failing the run.

**Sharing.** Generated guides are not stored on a server. The whole guide is compressed into the URL fragment (`/g#...`), so the link is the guide. Every guide also exports to Markdown.

## Key decisions

- **Lead with the decision, not the tutorial.** A developer's first question is "can I ship this week?", so each guide opens with difficulty, time and what works before approval. The console click-path comes after.
- **Make the agent / human split explicit.** Every step is owned by Agent, You or Provider. Agents can draft privacy policies and scope justifications, choose minimal scopes, pre-fill forms and check redirect URIs. Account creation, payments, legal attestations and identity checks stay with the developer.
- **Show the evidence.** Each key claim carries a status and source links, and open questions are listed instead of hidden. Time estimates without a published number are marked inferred.
- **Pick a varied library over a large one.** The 12 apps cover every review regime I found: none (GitHub, Notion, X with paid credits), self-serve (Slack public distribution, Microsoft publisher verification, LinkedIn self-serve products, Salesforce External Client Apps), provider review (HubSpot Marketplace, Shopify App Store, Zoom Marketplace), a third-party security assessment (Gmail restricted scopes) and a closed partner program (Spotify extended quota). Three of them (Shopify, X, Spotify) have no Composio-managed app at all.
- **Ground it in Composio.** Each guide states whether Composio offers a managed app for the toolkit and how the custom app plugs into a Composio auth config.

## What I verified, and what I didn't

See [VERIFICATION.md](VERIFICATION.md) for the spot-check log and the findings the research corrected.

- Every curated guide was researched against official provider documentation on 28 October 2026. Claims are labelled per guide; `npm run validate-guides` prints the counts.
- Things I could not confirm are listed in each guide's "Still uncertain" section. Two cross-cutting ones:
  - Composio's docs show three different redirect URIs for custom OAuth apps (`/api/v1/auth-apps/add`, `/api/v3/toolkits/auth/callback`, `/api/v3.1/toolkits/auth/callback`). Guides tell developers to copy the value from the Composio dashboard.
  - Whether Google's CASA assessment is triggered for a developer's own client when Gmail data flows through Composio's servers is inferred, not confirmed by Google.
- No claim is marked "tested" unless someone actually performed that setup step.

## Limitations

- Provider policies change; guides show the date they were checked.
- The live agent reads public pages only. It does not log in to provider consoles or create apps.
- Live generation takes 1 to 3 minutes and spends model tokens on every run. There is no caching or rate limiting yet, so a public deployment should add both.
- Generated guides are not persisted server-side, and very long guides produce long URLs.

## Next steps I'd take

- Cache generated guides and let a reviewer promote them into the library after checking.
- Re-check curated guides on a schedule and diff the claims to catch policy changes.
- Add hands-on verification: a browser agent that walks through app creation in a sandbox account and records what actually happened, upgrading claims to "tested".
- Cover all OAuth toolkits in Composio's directory, prioritising the 258 without a managed app.
