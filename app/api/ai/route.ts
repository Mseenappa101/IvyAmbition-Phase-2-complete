import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { AI_TOOL_PROMPTS, AI_TOOL_MODELS, AI_TOOL_MAX_TOKENS } from "@/lib/ai/prompts";

// In-memory rate limiting: userId → { count, resetDate }
const rateLimitMap = new Map<string, { count: number; resetDate: string }>();
const DAILY_LIMIT = 50;

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const today = new Date().toISOString().slice(0, 10);
  const entry = rateLimitMap.get(userId);

  if (!entry || entry.resetDate !== today) {
    return { allowed: true, remaining: DAILY_LIMIT - 1 };
  }

  if (entry.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: DAILY_LIMIT - entry.count - 1 };
}

function incrementRateLimit(userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const entry = rateLimitMap.get(userId);

  if (!entry || entry.resetDate !== today) {
    rateLimitMap.set(userId, { count: 1, resetDate: today });
  } else {
    entry.count += 1;
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    // 1. Parse request body
    const { tool_type, messages } = await req.json();

    if (!tool_type || !messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "Missing required fields: tool_type, messages" },
        { status: 400 }
      );
    }

    // 2. Validate tool type
    const systemPrompt = AI_TOOL_PROMPTS[tool_type];
    if (!systemPrompt) {
      return Response.json(
        { error: `Unknown tool type: ${tool_type}` },
        { status: 400 }
      );
    }

    // 3. Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a student
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "student") {
      return Response.json(
        { error: "Only students can use AI tools" },
        { status: 403 }
      );
    }

    // 4. Rate limit check
    const { allowed, remaining } = checkRateLimit(user.id);
    if (!allowed) {
      return Response.json(
        {
          error: "Daily AI request limit reached (50/day). Try again tomorrow.",
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // 5. Call Anthropic API with streaming
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const model = AI_TOOL_MODELS[tool_type] ?? "claude-sonnet-4-5-20250929";
    const maxTokens = AI_TOOL_MAX_TOKENS[tool_type] ?? 2048;

    const stream = client.messages.stream({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    // 6. Increment rate limit on successful stream start
    incrementRateLimit(user.id);

    // 7. Create a ReadableStream that pipes text deltas
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Send remaining count as first chunk
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "meta", remaining })}\n\n`
            )
          );

          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "text", text: event.delta.text })}\n\n`
                )
              );
            }
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          );
          controller.close();
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Stream error";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", error: message })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("AI route error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
