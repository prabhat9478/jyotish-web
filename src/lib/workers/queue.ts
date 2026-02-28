/**
 * BullMQ queue setup for async job processing
 *
 * Single shared Redis connection used by all queues and workers.
 */

import { Queue } from "bullmq";
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Single shared Redis connection — reused by queues and workers
export const redisConnection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null, // Required for BullMQ
});

redisConnection.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

// Report generation queue
export const reportQueue = new Queue("report-generation", {
  connection: redisConnection,
});

// Alert generation queue
export const alertQueue = new Queue("transit-alerts", {
  connection: redisConnection,
});

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
