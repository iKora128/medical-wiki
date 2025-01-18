import { withErrorHandling } from '@/lib/api-middleware'
import { successResponse, errorResponse } from '@/lib/api-response'
import { adminAuth } from "@/lib/firebase-admin"
import { ROLES } from "@/lib/auth"
import { z } from 'zod'

const loginSchema = z.object({
  idToken: z.string().min(1, 'トークンが必要です')
})

export const POST = withErrorHandling(async (request: Request) => {
  const { idToken } = loginSchema.parse(await request.json())

  // トークンを検証
  const decodedToken = await adminAuth.verifyIdToken(idToken)
  const email = decodedToken.email

  // 管理者メールアドレスをチェック
  const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []
  if (!email || !ADMIN_EMAILS.includes(email)) {
    return errorResponse("管理者権限がありません", 403)
  }

  // カスタムクレームを設定
  await adminAuth.setCustomUserClaims(decodedToken.uid, { role: ROLES.ADMIN })

  // セッションCookieを作成
  const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5日
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })

  const response = successResponse({ success: true }, '管理者としてログインしました')
  response.cookies.set("session", sessionCookie, {
    maxAge: expiresIn / 1000, // 秒単位に変換
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/"
  })

  return response
}) 