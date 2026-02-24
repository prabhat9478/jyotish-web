import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generateStreamingReport } from "@/lib/report-generator";
import { chunkText, extractSectionTitle } from "@/lib/rag/chunker";
import { embedBatch } from "@/lib/rag/embedder";
import { enqueuePDFGeneration } from "@/lib/workers/queue";

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const body = await request.json();

  const { profileId, reportType, language, model } = body;

  if (!profileId || !reportType) {
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

  // Create report record
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert({
      profile_id: profileId,
      report_type: reportType,
      language: language || "en",
      model_used: model || "anthropic/claude-sonnet-4-5",
      generation_status: "generating",
    })
    .select()
    .single();

  if (reportError) {
    return new Response(JSON.stringify({ error: reportError.message }), {
      status: 500,
    });
  }

  // Generate streaming report
  const stream = await generateStreamingReport({
    profileId,
    reportType,
    language: language || "en",
    model,
    chartData: profile.chart_data,
  });

  let fullContent = "";

  // Transform stream to SSE format and collect content
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
                  fullContent += content;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }

        // Save full content and chunk for RAG
        await saveReportContent(supabase, report.id, profileId, fullContent, reportType);

        // Enqueue PDF generation
        await enqueuePDFGeneration(report.id);

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

async function saveReportContent(
  supabase: any,
  reportId: string,
  profileId: string,
  content: string,
  reportType: string
) {
  // Update report with content
  await supabase
    .from("reports")
    .update({
      content,
      generation_status: "complete",
    })
    .eq("id", reportId);

  // Chunk and embed for RAG
  const chunks = chunkText(content, reportType);

  // Extract embeddings
  const texts = chunks.map((c) => c.content);
  const embeddings = await embedBatch(texts);

  // Insert chunks with embeddings
  const chunkRecords = chunks.map((chunk, idx) => ({
    report_id: reportId,
    profile_id: profileId,
    chunk_index: chunk.index,
    content: chunk.content,
    embedding: embeddings[idx],
    metadata: {
      ...chunk.metadata,
      section_title: extractSectionTitle(chunk.content),
    },
  }));

  await supabase.from("report_chunks").insert(chunkRecords);
}
