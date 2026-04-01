import type { NextRequest } from "next/server";

// Dynamic import breaks the build-time import chain:
// route → auth → db → pg → pg-native (externalRequire crash on Vercel)
export async function GET(req: NextRequest) {
  const { handlers } = await import("@/auth");
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  const { handlers } = await import("@/auth");
  return handlers.POST(req);
}
