import { NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase-admin"
import { cookies } from "next/headers"
import { ROLES } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json()
    if (!idToken) {
      return NextResponse.json({ error: "トークンが必要です" }, { status: 400 })
    }

    // トークンを検証
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const email = decodedToken.email

    // 管理者メールアドレスをチェック
    const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []
    if (!email || !ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: "管理者権限がありません" }, { status: 403 })
    }

    // カスタムクレームを設定
    await adminAuth.setCustomUserClaims(decodedToken.uid, { role: ROLES.ADMIN })

    // セッションCookieを作成
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5日
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })

    const cookieStore = await cookies()
    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/"
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 })
  }
} 