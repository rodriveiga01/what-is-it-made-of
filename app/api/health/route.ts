import { NextResponse } from "next/server";

export async function GET() {
  // Deliberately minimal: revealing whether an API key is configured lets
  // attackers probe deploy config. Liveness only.
  return NextResponse.json({ ok: true });
}
