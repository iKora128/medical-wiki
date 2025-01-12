import { verifyAuth } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-response"
import { withErrorHandling } from "@/lib/api-middleware"
import { QuestionRepository } from "@/lib/repositories/question"
import { AnswerRepository } from "@/lib/repositories/answer"
import { z } from 'zod'

const answerSchema = z.object({
  content: z.string().min(1, "回答内容は必須です"),
})

export const POST = withErrorHandling(async (request: Request, { params }: { params: { id: string } }) => {
  const user = await verifyAuth(request)
  const body = await request.json()
  const { content } = answerSchema.parse(body)

  const question = await QuestionRepository.findById(params.id)
  if (!question) {
    return errorResponse("質問が見つかりません", 404)
  }

  const answer = await AnswerRepository.create({
    content,
    userId: user.uid,
    questionId: params.id,
  })

  return successResponse(answer, "回答を作成しました")
})

export const GET = withErrorHandling(async (request: Request, { params }: { params: { id: string } }) => {
  const question = await QuestionRepository.findById(params.id)
  if (!question) {
    return errorResponse("質問が見つかりません", 404)
  }

  return successResponse(question.answers || [])
}) 