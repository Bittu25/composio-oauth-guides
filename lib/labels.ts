import type { Guide } from "./schema";

export const DIFFICULTY: Record<Guide["difficulty"], string> = {
  easy: "Easy",
  moderate: "Moderate",
  hard: "Hard",
  very_hard: "Very hard",
};

export const REVIEW: Record<Guide["review"]["level"], string> = {
  none: "No review",
  self_serve: "Self-serve verification",
  provider_review: "Provider review",
  security_assessment: "Security assessment",
  partner_program: "Partner program",
};

export const MANAGED: Record<Guide["composio"]["managedApp"], string> = {
  available: "Composio managed app available",
  not_available: "Bring your own app",
  unknown: "Composio managed app: unknown",
};

export const OWNER: Record<Guide["steps"][number]["owner"], string> = {
  agent: "Agent",
  developer: "You",
  provider: "Provider",
};

export const CLAIM: Record<Guide["claims"][number]["status"], string> = {
  tested: "Tested",
  source: "Sourced",
  inferred: "Inferred",
  uncertain: "Uncertain",
};
