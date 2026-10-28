import { getGuides } from "@/lib/guides";
import { COMPOSIO_MANAGED, MANAGED_SNAPSHOT_DATE } from "@/lib/composio";

export const metadata = { title: "How it works" };

export default function About() {
  const guides = getGuides();
  const claims = guides.flatMap((g) => g.claims);
  const by = (s: string) => claims.filter((c) => c.status === s).length;
  const sources = new Set(guides.flatMap((g) => g.sources.map((s) => s.url))).size;

  return (
    <div className="about">
      <h1>How it works</h1>

      <h2>The problem</h2>
      <p>
        On Composio, most toolkits work out of the box with a Composio-managed OAuth app. Developers still end up registering their own
        app with the provider: to show their own name on the consent screen, to get scopes the managed app lacks, to stop sharing rate
        limits, or because no managed app exists. As of {MANAGED_SNAPSHOT_DATE}, Composio&apos;s directory lists {COMPOSIO_MANAGED.length} toolkits
        with a managed OAuth app and 258 that require your own.
      </p>
      <p>
        Registering the app takes minutes. Getting it approved can take an afternoon or several months, and the rules that decide which
        one you get are scattered across policy pages: scope classes, user caps, partner programs, security assessments, admin consent.
        Composio&apos;s own setup guides cover the console steps well but say little about review and timelines. That gap is what this tool
        fills.
      </p>

      <h2>What I chose to build, and why</h2>
      <ul>
        <li>
          <strong>A decision page first, a tutorial second.</strong> Each guide leads with difficulty, hands-on time, approval wait and what
          works before approval, because the first question a developer has is &quot;can I ship this week?&quot;
        </li>
        <li>
          <strong>Agent versus you.</strong> Every step is labelled Agent, You or Provider, and each guide lists what an agent can do (draft
          policy text, pick minimal scopes, pre-fill forms, check redirect URIs) and what only the developer can do (accounts, payments,
          legal attestations, identity checks).
        </li>
        <li>
          <strong>Honest evidence.</strong> Key claims are marked Sourced, Inferred or Uncertain and linked to the pages that support them,
          with open questions listed rather than hidden.
        </li>
        <li>
          <strong>Live generation for any app.</strong> Type an app name or website and the research agent investigates it in real time,
          including apps outside the library.
        </li>
        <li>
          <strong>Shareable without accounts.</strong> A generated guide is compressed into its own URL, so the link is the artifact. Guides
          also export to Markdown.
        </li>
      </ul>

      <h2>How the agent works</h2>
      <ol>
        <li>
          <strong>Research.</strong> Claude Opus 5.5 with Anthropic&apos;s server-side web search and web fetch tools investigates the provider,
          favouring official developer docs and policy pages, and writes notes with a URL behind each fact. Progress (searches, pages read)
          streams to the browser as it happens.
        </li>
        <li>
          <strong>Write.</strong> A second call turns the notes into a guide that must match a strict schema (structured outputs), using only
          facts in the notes and labelling each claim. Composio&apos;s managed-app status comes from a snapshot of the official directory.
        </li>
      </ol>

      <h2>How the library was checked</h2>
      <p>
        The {guides.length} curated guides were researched against official provider documentation on 28 October 2026 and cover very different
        setups: no review (GitHub, Notion), paid credits (X), self-serve verification and admin consent (Slack, Microsoft, LinkedIn, Salesforce),
        marketplace review (HubSpot, Shopify, Zoom), a third-party security assessment (Gmail restricted scopes) and a closed partner
        program (Spotify extended quota). I then re-checked a sample of the most surprising claims against the primary source myself.
      </p>
      <p>
        Across the library there are {claims.length} key claims: {by("source")} sourced, {by("inferred")} inferred, {by("uncertain")} uncertain,
        {by("tested") ? ` ${by("tested")} tested,` : ""} drawn from {sources} distinct sources. A validation script checks every guide against
        the schema and that each claim cites a real source.
      </p>

      <h2>What the research turned up</h2>
      <ul>
        <li>Spotify cut Development mode to 5 users in February 2026; going beyond needs a registered organisation with 250k+ monthly users.</li>
        <li>Slack apps distributed outside the Marketplace since May 2025 can read channel history only once a minute, 15 messages at a time.</li>
        <li>HubSpot caps unlisted marketplace apps at 25 installs, and new apps must be built with its CLI. Composio&apos;s HubSpot setup guide still shows the old flow.</li>
        <li>Salesforce blocks new Connected Apps by default since Spring &apos;26; serving other orgs needs a packaged External Client App.</li>
        <li>For Gmail, <code>gmail.send</code> is only &quot;sensitive&quot;, so a send-only agent avoids the security assessment that read access triggers.</li>
        <li>Composio&apos;s docs show at least three different redirect URIs for custom OAuth apps; every guide says to copy it from the dashboard.</li>
      </ul>

      <h2>Limitations</h2>
      <ul>
        <li>Policies change. Each guide shows the date it was checked; re-verify before submitting for review.</li>
        <li>Time estimates are ranges. Where no source states a number, the claim is marked inferred.</li>
        <li>The live agent reads public pages only. It cannot log in to provider consoles, so it does not create apps itself.</li>
        <li>Live generation takes 1 to 3 minutes and costs model tokens per run; there is no caching or rate limiting yet.</li>
        <li>Generated guides are not stored server-side. Very long guides make long URLs.</li>
      </ul>
    </div>
  );
}
