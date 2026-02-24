import { NextRequest, NextResponse } from "next/server";
import { getCurrentTransits } from "@/lib/astro-client";

export async function GET(request: NextRequest) {
  try {
    const transits = await getCurrentTransits();
    return NextResponse.json(transits);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
