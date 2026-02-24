import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generateChatResponse, buildSourcesMetadata } from "@/lib/rag/chat";
import { searchReportChunks } from "@/lib/rag/retriever";

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const body = await request.json();

  const { profileId, sessionId, message, model } = body;

  if (!profileId || !message) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  // Fetch profile with chart data
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  if (profileError || !profile?.chart_data) {
    return new Response(JSON.stringify({ error: "Profile or chart data not found" }), {
      status: 404,
    });
  }

  // Get or create session
  let currentSessionId = sessionId;
  if (!currentSessionId) {
    const { data: newSession } = await supabase
      .from("chat_sessions")
      .insert({
        profile_id: profileId,
        title: message.slice(0, 100),
      })
      .select()
      .single();

    currentSessionId = newSession?.id;
  }

  // Fetch conversation history
  const { data: messages } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("session_id", currentSessionId)
    .order("created_at", { ascending: true })
    .limit(10);

  const conversationHistory = messages || [];

  // Retrieve search results for sources
  const searchResults = await searchReportChunks(profileId, message, 5);
  const sources = buildSourcesMetadata(searchResults);

  // Generate streaming response
  const stream = await generateChatResponse({
    profileId,
    chartData: profile.chart_data as any,
    query: message,
    conversationHistory: conversationHistory.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    model,
  });

  let fullResponse = "";

  // Transform stream to SSE format
  const encoder = new TextEncoder();
  const transformedStream = new ReadableStream({
    async start(controller) {
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const json = JSON.parse(data);
                const content = json.choices[0]?.delta?.content;
                if (content) {
                  fullResponse += content;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }

        // Save messages to database
        await supabase.from("chat_messages").insert([
          {
            session_id: currentSessionId,
            role: "user",
            content: message,
          },
          {
            session_id: currentSessionId,
            role: "assistant",
            content: fullResponse,
            sources,
            model_used: model || "anthropic/claude-sonnet-4-5",
          },
        ]);

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ sources, sessionId: currentSessionId })}\n\n`)
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(transformedStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
