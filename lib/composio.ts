// Snapshot of https://docs.composio.dev/toolkits/managed-auth taken 2026-10-28.
// Toolkits with at least one Composio-managed OAuth method. Everything else
// that supports OAuth needs the developer to bring their own OAuth app.
export const MANAGED_SNAPSHOT_DATE = "2026-10-28";

export const COMPOSIO_MANAGED = [
  "Aircall", "Airtable", "Apaleo", "Asana", "Attio", "Basecamp", "Bitbucket", "Blackbaud",
  "Boldsign", "Box", "Cal", "Calendly", "Canva", "Capsule CRM", "ClickUp", "Confluence",
  "Contentful", "Crowdin", "Dart", "Daytona", "Dialpad", "Discord", "Discord Bot", "Dropbox",
  "Dub", "Dynamics 365", "Eventbrite", "Excel", "Exist", "Facebook", "Fathom", "Figma",
  "Freeagent", "FreshBooks", "GitHub", "GitLab", "Gmail", "Gong", "Google Ads",
  "Google Analytics", "Google BigQuery", "Google Calendar", "Google Classroom", "Google Docs",
  "Google Drive", "Google Maps", "Google Meet", "Google Photos", "Google Search Console",
  "Google Sheets", "Google Slides", "Google Super", "Google Tasks", "Gorgias", "Greenhouse",
  "Gumroad", "Harvest", "HubSpot", "Hugging Face", "Instagram", "Intercom", "Jira", "Kit",
  "Linear", "LinkedIn", "Linkhut", "Mailchimp", "Microsoft Teams", "Miro", "Monday",
  "Moneybird", "Mural", "NotebookLM", "Notion", "Omnisend", "OneDrive", "Outlook",
  "PagerDuty", "Pinterest", "Pinterest Ads", "Prisma", "Productboard", "Pushbullet",
  "QuickBooks", "Reddit", "Reddit Ads", "Roam", "Salesforce", "Sentry", "Servicem8",
  "SharePoint", "Shippo", "Slack", "Slackbot", "Splitwise", "Square", "Stack Exchange",
  "Stripe", "Supabase", "Ticketmaster", "Ticktick", "TikTok Ads", "Timely", "Todoist",
  "Trello", "Twitch", "Typeform", "WakaTime", "Webex", "WhatsApp", "Wrike", "Yandex", "YNAB",
  "YouTube", "Zendesk", "Zeplin", "Zoho", "Zoho Bigin", "Zoho Books", "Zoho Desk",
  "Zoho Inventory", "Zoho Invoice", "Zoho Mail", "Zoom",
];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Best-effort lookup of an app name against the managed snapshot. */
export function managedStatus(app: string): "available" | "not_available" | "unknown" {
  const n = norm(app);
  if (!n) return "unknown";
  return COMPOSIO_MANAGED.some((m) => norm(m) === n) ? "available" : "unknown";
}
