import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth().verifyIdToken(token);

    // カスタムクレームで管理者権限を確認
    if (!decodedToken.admin) {
      return NextResponse.json({ error: "管理者権限がありません" }, { status: 403 });
    }

    return NextResponse.json({ isAdmin: true });
  } catch (error) {
    console.error("Admin verification error:", error);
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }
} 