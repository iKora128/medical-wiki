import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Admin APIのみチェック
  if (
    request.nextUrl.pathname.startsWith("/api/articles") &&
    (request.method === "POST" || request.method === "PUT" || request.method === "DELETE")
  ) {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }
  }

  return NextResponse.next()
} 