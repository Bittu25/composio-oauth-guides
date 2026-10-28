import Anthropic from "@anthropic-ai/sdk";
import { generateGuide, type AgentEvent } from "@/lib/agent";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  const { app } = (await req.json().catch(() => ({}))) as { app?: string };
  const query = (app ?? "").trim();
  if (!query || query.length > 200) {
    return Response.json({ error: "Enter an app name or website (max 200 characters)." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "Live generation is not configured: set ANTHROPIC_API_KEY on the server." }, { status: 503 });
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      const send = (e: AgentEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      try {
        for await (const event of generateGuide(query)) send(event);
      } catch (err) {
        console.error("generate failed", err);
        let message = "Something went wrong while generating the guide.";
        if (err instanceof Anthropic.AuthenticationError) message = "The server's Anthropic API key is missing or invalid.";
        else if (err instanceof Anthropic.RateLimitError) message = "Rate limited by the model API. Try again in a minute.";
        else if (err instanceof Anthropic.APIError) message = `Model API error ${err.status}: ${err.message}`;
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
