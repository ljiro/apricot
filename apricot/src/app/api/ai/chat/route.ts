import { NextRequest } from "next/server";

type Message = { role: "system" | "user" | "assistant"; content: string };

export async function POST(request: NextRequest) {
  let body: {
    provider: "gemini" | "perplexity";
    apiKey: string;
    messages: Message[];
    documentContext?: string;
    model?: string;
  };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { provider, apiKey, messages, documentContext, model: requestedModel } = body;
  if (!provider || !apiKey?.trim() || !Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "provider, apiKey, and non-empty messages are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const systemContext = documentContext?.trim()
    ? { role: "system" as const, content: `You are helping the user edit a document. Current document content:\n\n${documentContext.trim()}` }
    : null;
  const finalMessages: Message[] = systemContext ? [systemContext, ...messages] : [...messages];

  const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
  const geminiModel = requestedModel?.trim() || "gemini-2.5-flash";
  const geminiBody = () =>
    JSON.stringify({
      model: geminiModel,
      messages: finalMessages,
      max_tokens: 2048,
    });

  try {
    if (provider === "gemini") {
      let res = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: geminiBody(),
      });

      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 2000));
        res = await fetch(geminiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey.trim()}`,
          },
          body: geminiBody(),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const raw = (data.error?.message ?? data.message ?? res.statusText) as string;
        const err =
          res.status === 429
            ? "Rate limit exceeded. Please wait a moment and try again."
            : raw || "Gemini request failed";
        return new Response(JSON.stringify({ error: err }), {
          status: res.status >= 400 ? res.status : 502,
          headers: { "Content-Type": "application/json" },
        });
      }
      const content =
        data.choices?.[0]?.message?.content ??
        data.candidates?.[0]?.content?.parts?.[0]?.text ??
        "";
      return new Response(JSON.stringify({ content: String(content) }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (provider === "perplexity") {
      let res = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: "sonar",
          messages: finalMessages,
          max_tokens: 2048,
        }),
      });
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 2000));
        res = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: "sonar",
            messages: finalMessages,
            max_tokens: 2048,
          }),
        });
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const raw = (data.error?.message ?? data.message ?? res.statusText) as string;
        const err =
          res.status === 429
            ? "Rate limit exceeded. Please wait a moment and try again."
            : raw || "Perplexity request failed";
        return new Response(JSON.stringify({ error: err }), {
          status: res.status >= 400 ? res.status : 502,
          headers: { "Content-Type": "application/json" },
        });
      }
      const content = data.choices?.[0]?.message?.content ?? "";
      return new Response(JSON.stringify({ content: String(content) }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown provider" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("AI chat error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "AI request failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
