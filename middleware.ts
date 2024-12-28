import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "firebase-admin"
import { initAdmin } from "@/lib/firebase-admin"

initAdmin()

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

    try {
      const token = await auth().verifyIdToken(authHeader.split("Bearer ")[1])
      // カスタムクレームでadmin権限をチェック
      if (!token.admin) {
        return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 })
      }
    } catch (error) {
      console.error("Token verification failed:", error)
      return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 })
    }
  }

  return NextResponse.next()
} 