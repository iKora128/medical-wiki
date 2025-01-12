import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-response"
import { withErrorHandling } from "@/lib/api-middleware"
import { z } from 'zod'

const questionUpdateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(['OPEN', 'CLOSED']).optional(),
})

export const GET = withErrorHandling(async (request: Request, { params }: { params: { id: string } }) => {
  const question = await prisma.question.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      answers: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: [
          { isAccepted: 'desc' },
          { createdAt: 'desc' },
        ],
      },
    },
  })

  if (!question) {
    return errorResponse("質問が見つかりません", 404)
  }

  return successResponse(question)
})

export const PUT = withErrorHandling(async (request: Request, { params }: { params: { id: string } }) => {
  const user = await verifyAuth(request)
  const body = await request.json()
  const data = questionUpdateSchema.parse(body)

  const question = await prisma.question.findUnique({
    where: { id: params.id },
  })

  if (!question) {
    return errorResponse("質問が見つかりません", 404)
  }

  if (question.userId !== user.uid) {
    return errorResponse("この質問を編集する権限がありません", 403)
  }

  const updatedQuestion = await prisma.question.update({
    where: { id: params.id },
    data,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  return successResponse(updatedQuestion, "質問を更新しました")
})

export const DELETE = withErrorHandling(async (request: Request, { params }: { params: { id: string } }) => {
  const user = await verifyAuth(request)

  const question = await prisma.question.findUnique({
    where: { id: params.id },
  })

  if (!question) {
    return errorResponse("質問が見つかりません", 404)
  }

  if (question.userId !== user.uid) {
    return errorResponse("この質問を削除する権限がありません", 403)
  }

  await prisma.question.delete({
    where: { id: params.id },
  })

  return successResponse(null, "質問を削除しました")
}) 