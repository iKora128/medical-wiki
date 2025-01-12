import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-response"
import { withErrorHandling } from "@/lib/api-middleware"
import { QuestionRepository } from "@/lib/repositories/question"
import { z } from 'zod'

const questionSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  content: z.string().min(1, "内容は必須です"),
  tags: z.array(z.string()).optional(),
})

export const POST = withErrorHandling(async (request: Request) => {
  const user = await verifyAuth(request)
  const body = await request.json()
  const data = questionSchema.parse(body)

  const question = await QuestionRepository.create({
    ...data,
    userId: user.uid,
  })

  return successResponse(question, "質問を作成しました")
})

export const GET = withErrorHandling(async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const tag = searchParams.get('tag') || undefined
  const status = searchParams.get('status') || undefined
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const { questions, total } = await QuestionRepository.findMany({
    tag,
    status,
    page,
    limit,
  })

  return successResponse({
    questions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}) 