import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-response"
import { withErrorHandling } from "@/lib/api-middleware"

export const POST = withErrorHandling(async (request: Request, { params }: { params: { id: string } }) => {
  const user = await verifyAuth(request)
  const { content } = await request.json()

  if (!content) {
    return errorResponse("回答内容は必須です", 400)
  }

  const question = await prisma.question.findUnique({
    where: { id: params.id },
  })

  if (!question) {
    return errorResponse("質問が見つかりません", 404)
  }

  const answer = await prisma.answer.create({
    data: {
      content,
      userId: user.uid,
      questionId: params.id,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  return successResponse(answer, "回答を作成しました")
})

export const GET = withErrorHandling(async (request: Request, { params }: { params: { id: string } }) => {
  const answers = await prisma.answer.findMany({
    where: { questionId: params.id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: [
      { isAccepted: "desc" },
      { createdAt: "desc" },
    ],
  })

  return successResponse(answers)
}) 