/**
 * BullMQ worker for transit alert generation
 * Run with: npm run alert-worker
 */

import { Worker } from "bullmq";
import IORedis from "ioredis";
import { createClient } from "@supabase/supabase-js";
import { getCurrentTransits, getTransitsVsNatal } from "../astro-client";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const worker = new Worker(
  "transit-alerts",
  async (job) => {
    console.log(`Processing alert job ${job.id}`);

    if (job.name === "generate-alerts") {
      const { profileId } = job.data;

      // Fetch profile with chart data
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (error || !profile || !profile.chart_data) {
        throw new Error(`Profile not found or chart not calculated: ${profileId}`);
      }

      // Get current transits
      const transits = await getCurrentTransits();

      // Calculate aspects between transits and natal chart
      const aspects = await getTransitsVsNatal(profile.chart_data, transits);

      // Filter significant aspects (tight orbs < 2°)
      const significantAspects = aspects.filter(
        (aspect) => Math.abs(aspect.orb) < 2.0 && aspect.applying
      );

      // Create alert for each significant aspect
      for (const aspect of significantAspects) {
        const alertTitle = `${aspect.transiting_planet} ${aspect.aspect_type} Natal ${aspect.natal_planet}`;
        const alertContent = `Transiting ${aspect.transiting_planet} is forming a ${aspect.aspect_type} aspect with your natal ${aspect.natal_planet}. Orb: ${aspect.orb.toFixed(2)}°`;

        await supabase.from("transit_alerts").insert({
          profile_id: profileId,
          alert_type: "planet_transit",
          title: alertTitle,
          content: alertContent,
          trigger_date: new Date().toISOString().split("T")[0],
          planet: aspect.transiting_planet,
          natal_planet: aspect.natal_planet,
          orb: aspect.orb,
        });
      }

      console.log(`Generated ${significantAspects.length} alerts for profile ${profileId}`);
      return { success: true, alertCount: significantAspects.length };
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Alert job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Alert job ${job?.id} failed:`, err);
});

console.log("Alert worker started");
