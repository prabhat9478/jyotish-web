/**
 * BullMQ worker for PDF report generation
 * Run with: npm run worker
 */

import { Worker } from "bullmq";
import IORedis from "ioredis";
import { createClient } from "@supabase/supabase-js";
import { generatePDF } from "../astro-client";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const worker = new Worker(
  "report-generation",
  async (job) => {
    console.log(`Processing job ${job.id}: ${job.name}`);

    if (job.name === "generate-pdf") {
      const { reportId } = job.data;

      // Fetch report content from database
      const { data: report, error } = await supabase
        .from("reports")
        .select("*")
        .eq("id", reportId)
        .single();

      if (error || !report) {
        throw new Error(`Report not found: ${reportId}`);
      }

      // Generate PDF via astro-engine
      const pdfBuffer = await generatePDF(reportId, report.content, report.report_type);

      // Upload to Supabase Storage
      const fileName = `${reportId}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("reports")
        .upload(fileName, pdfBuffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`PDF upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("reports").getPublicUrl(fileName);

      // Update report with PDF URL
      await supabase
        .from("reports")
        .update({
          pdf_url: urlData.publicUrl,
          pdf_generated_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      console.log(`PDF generated for report ${reportId}`);
      return { success: true, pdfUrl: urlData.publicUrl };
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

console.log("Report worker started");
