import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { calculateChart } from "@/lib/astro-client";

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const body = await request.json();

  const { profileId, birthData } = body;

  if (!profileId || !birthData) {
    return NextResponse.json(
      { error: "profileId and birthData required" },
      { status: 400 }
    );
  }

  try {
    // Calculate chart via astro-engine
    const chartData = await calculateChart(birthData);

    // Update profile with calculated chart
    const { error } = await supabase
      .from("profiles")
      .update({
        chart_data: chartData,
        chart_calculated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, chartData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
