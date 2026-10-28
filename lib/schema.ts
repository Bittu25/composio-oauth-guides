import { z } from "zod";

// One guide = everything a developer needs to get their own OAuth app for a
// provider registered, approved and plugged into Composio.
// The same schema is used for the curated library (data/guides/*.json) and for
// guides the agent generates live, so both render through one component.

export const Difficulty = z.enum(["easy", "moderate", "hard", "very_hard"]);
export const ReviewLevel = z.enum([
  "none", // register and go
  "self_serve", // toggles / domain or publisher verification you complete yourself
  "provider_review", // a human at the provider reviews the app
  "security_assessment", // third-party audit (e.g. Google CASA)
  "partner_program", // must be accepted into a partner / paid program first
]);
export const Owner = z.enum(["agent", "developer", "provider"]);
export const Severity = z.enum(["info", "warning", "blocker"]);
export const ClaimStatus = z.enum([
  "tested", // someone actually did it
  "source", // stated in an official / primary source
  "inferred", // reasoned from sources, not stated directly
  "uncertain", // could not confirm
]);

export const GuideSchema = z.object({
  slug: z.string().describe("kebab-case id, e.g. 'gmail'"),
  app: z.string().describe("Display name, e.g. 'Gmail (Google)'"),
  website: z.string(),
  developerConsole: z.string().describe("URL where the OAuth app is created"),
  composio: z.object({
    toolkit: z.string().describe("Composio toolkit slug, e.g. 'gmail'"),
    managedApp: z
      .enum(["available", "not_available", "unknown"])
      .describe("Does Composio offer a managed OAuth app for this toolkit?"),
    note: z.string(),
  }),
  summary: z.string().describe("2-3 sentences: the honest bottom line"),
  difficulty: Difficulty,
  difficultyReason: z.string(),
  time: z.object({
    activeWork: z.string().describe("Hands-on time, at most 6 words, e.g. '15-30 min'"),
    approvalWait: z.string().describe("Waiting on the provider, at most 6 words, e.g. 'None' or '2-6 weeks'"),
    toProduction: z.string().describe("Realistic total until any user can connect, at most 6 words"),
    notes: z.string().describe("One or two sentences explaining the estimates and what drives them"),
  }),
  review: z.object({
    level: ReviewLevel,
    details: z.string(),
  }),
  limitsBeforeApproval: z
    .string()
    .describe("What works before approval, e.g. '100 test users, consent screen shows unverified warning'"),
  prerequisites: z.array(
    z.object({ item: z.string(), why: z.string(), blocking: z.boolean() }),
  ),
  steps: z.array(
    z.object({
      title: z.string(),
      detail: z.string(),
      owner: Owner,
      url: z.string().nullable(),
    }),
  ),
  nuances: z.array(
    z.object({ title: z.string(), detail: z.string(), severity: Severity }),
  ),
  blockers: z.array(z.object({ problem: z.string(), whatToDo: z.string() })),
  agentCanDo: z.array(z.string()),
  developerMustDo: z.array(z.string()),
  redirectUri: z.string().describe("Rules for redirect / callback URIs on this provider"),
  sources: z.array(z.object({ title: z.string(), url: z.string() })),
  claims: z.array(
    z.object({
      claim: z.string(),
      status: ClaimStatus,
      sources: z.array(z.number()).describe("Indexes into sources[]"),
    }),
  ),
  openQuestions: z.array(z.string()).describe("What remains uncertain"),
  lastChecked: z.string().describe("ISO date"),
});

export type Guide = z.infer<typeof GuideSchema> & { origin?: "curated" | "generated" };
