import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-response"
import { withErrorHandling } from "@/lib/api-middleware"

export const PUT = withErrorHandling(async (request: Request, { params }: { params: { id: string; answerId: string } }) => {
  const user = await verifyAuth(request)
  const { content } = await request.json()

  if (!content) {
    return errorResponse("回答内容は必須です", 400)
  }

  const answer = await prisma.answer.findUnique({
    where: { id: params.answerId },
    include: { question: true }
  })

  if (!answer) {
    return errorResponse("回答が見つかりません", 404)
  }

  if (answer.userId !== user.uid) {
    return errorResponse("この回答を編集する権限がありません", 403)
  }

  const updatedAnswer = await prisma.answer.update({
    where: { id: params.answerId },
    data: { content },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  return successResponse(updatedAnswer, "回答を更新しました")
})

export const DELETE = withErrorHandling(async (request: Request, { params }: { params: { id: string; answerId: string } }) => {
  const user = await verifyAuth(request)

  const answer = await prisma.answer.findUnique({
    where: { id: params.answerId },
    include: { question: true }
  })

  if (!answer) {
    return errorResponse("回答が見つかりません", 404)
  }

  if (answer.userId !== user.uid) {
    return errorResponse("この回答を削除する権限がありません", 403)
  }

  await prisma.answer.delete({
    where: { id: params.answerId },
  })

  return successResponse(null, "回答を削除しました")
}) 