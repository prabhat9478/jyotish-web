import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const searchParams = request.nextUrl.searchParams;
  const profileId = searchParams.get("profileId");

  let query = supabase.from("transit_alerts").select("*").order("created_at", { ascending: false });

  if (profileId) {
    query = query.eq("profile_id", profileId);
  }

  const { data: alerts, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(alerts);
}

export async function PATCH(request: NextRequest) {
  const supabase = await createServerClient();
  const body = await request.json();

  const { alertId, updates } = body;

  if (!alertId) {
    return NextResponse.json({ error: "alertId required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("transit_alerts")
    .update(updates)
    .eq("id", alertId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
