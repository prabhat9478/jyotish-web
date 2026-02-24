/**
 * BullMQ queue setup for async job processing
 */

import { Queue } from "bullmq";
import IORedis from "ioredis";

// Redis connection (use REDIS_URL from env)
const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

// Report generation queue
export const reportQueue = new Queue("report-generation", { connection });

// Alert generation queue
export const alertQueue = new Queue("transit-alerts", { connection });

/**
 * Add PDF generation job to queue
 */
export async function enqueuePDFGeneration(reportId: string) {
  await reportQueue.add(
    "generate-pdf",
    { reportId },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    }
  );
}

/**
 * Add daily alert generation job
 */
export async function enqueueAlertGeneration(profileId: string) {
  await alertQueue.add(
    "generate-alerts",
    { profileId },
    {
      attempts: 2,
      backoff: {
        type: "fixed",
        delay: 5000,
      },
    }
  );
}
