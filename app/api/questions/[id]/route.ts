import { verifyAuth } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-response"
import { withErrorHandling } from "@/lib/api-middleware"
import { QuestionRepository } from "@/lib/repositories/question"
import { z } from 'zod'

const questionUpdateSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").optional(),
  content: z.string().min(1, "内容は必須です").optional(),
  status: z.enum(['OPEN', 'CLOSED']).optional(),
})

export const GET = withErrorHandling(async (request: Request, { params }: { params: { id: string } }) => {
  const question = await QuestionRepository.findById(params.id)

  if (!question) {
    return errorResponse("質問が見つかりません", 404)
  }

  return successResponse(question)
})

export const PUT = withErrorHandling(async (request: Request, { params }: { params: { id: string } }) => {
  const user = await verifyAuth(request)
  const question = await QuestionRepository.findById(params.id)

  if (!question) {
    return errorResponse("質問が見つかりません", 404)
  }

  if (question.userId !== user.uid) {
    return errorResponse("この質問を編集する権限がありません", 403)
  }

  const body = await request.json()
  const data = questionUpdateSchema.parse(body)

  const updatedQuestion = await QuestionRepository.update(params.id, data)
  return successResponse(updatedQuestion, "質問を更新しました")
})

export const DELETE = withErrorHandling(async (request: Request, { params }: { params: { id: string } }) => {
  const user = await verifyAuth(request)
  const question = await QuestionRepository.findById(params.id)

  if (!question) {
    return errorResponse("質問が見つかりません", 404)
  }

  if (question.userId !== user.uid) {
    return errorResponse("この質問を削除する権限がありません", 403)
  }

  await QuestionRepository.delete(params.id)
  return successResponse(null, "質問を削除しました")
}) 