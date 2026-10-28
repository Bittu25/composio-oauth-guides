# Verification log

All curated guides were researched on 28 October 2026 by research agents that read official provider pages, then checked by `npm run validate-guides` (schema, every claim cites a real source, nothing marked "tested" without a real attempt).

On top of that, I re-checked a sample of the most surprising or highest-impact claims myself against the primary source.

| Guide | Claim | Source checked | Result |
|---|---|---|---|
| Spotify | Development mode allows up to 5 users; extended quota only for registered organisations with a launched service and at least 250k MAU (since 15 May 2025) | developer.spotify.com/documentation/web-api/concepts/quota-modes | Confirmed, wording matches |
| HubSpot | Unlisted marketplace-distribution apps are capped at 25 installs, enforced on new or migrated apps from 22 Sep 2025 | developers.hubspot.com/changelog/new-marketplace-distribution-app-install-limits | Confirmed |
| Salesforce | Spring '26 blocks new Connected App creation by default in UI and Metadata API; re-enabling needs Salesforce Support; ECAs recommended | salesforce.com/blog/spring-26-release-architect-highlights | Confirmed |
| Slack | Since 29 May 2025, new commercially distributed non-Marketplace apps get `conversations.history` / `.replies` at 1 request/min and 15 messages per call; existing installs not affected | docs.slack.dev/changelog/2025/05/29/rate-limit-changes-for-non-marketplace-apps | Confirmed. A web-search summary claimed existing installs were hit on 2 Sep 2025 or 3 Mar 2026; the official changelog says they are not, so the guide keeps that as an open question rather than a fact |

## What the research corrected

Things that differ from common knowledge or from older guides, including Composio's own:

- **Spotify:** the Development mode cap dropped from 25 to 5 users in February 2026, and Development mode now requires the owner to have Premium.
- **HubSpot:** apps can no longer be created from the "Create App" button. New apps use the Projects-based developer platform and CLI. Composio's HubSpot setup guide still shows the old UI flow.
- **Salesforce:** a "Local" External Client App only works in the org where it was created. Serving customers' orgs needs a packaged ECA (inferred from third-party guides; Salesforce's help pages blocked automated fetching).
- **GitHub:** OAuth Apps now allow up to 10 callback URLs, and user tokens expire after 8 hours by default.
- **Notion:** integrations are now called "connections". The current docs no longer list company or legal URLs as requirements for a public connection.
- **Zoom:** sharing an unpublished app with other accounts ("beta") now requires security documentation and scanner output.
- **Composio:** docs show at least three different redirect URIs for custom OAuth apps (`/api/v1/auth-apps/add`, `/api/v3/toolkits/auth/callback`, `/api/v3.1/toolkits/auth/callback`). Every guide says to copy the value from the dashboard.

## Not verified

Each guide lists its own open questions. Recurring gaps:

- Review turnaround times are rarely published (Shopify, Zoom, LinkedIn Community Management). Figures from forums are marked uncertain.
- Some official sites block automated fetching (help.salesforce.com, developer.salesforce.com, devcommunity.x.com), so those claims rest on secondary sources and are marked accordingly.
- No guide step has been tested hands-on yet.
