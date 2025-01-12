import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, handleAuthError } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function PUT(request: Request) {
  try {
    const user = await verifyAuth(request)
    const { avatarUrl } = await request.json()

    if (!avatarUrl) {
      return errorResponse('アバターURLが必要です', 400)
    }

    const profile = await prisma.profile.upsert({
      where: { userId: user.uid },
      create: {
        userId: user.uid,
        avatarUrl,
      },
      update: {
        avatarUrl,
      },
    })

    return successResponse(profile, 'アバターを更新しました')
  } catch (error) {
    return handleAuthError(error)
  }
} 