import { verifyAuth } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-response"
import { withErrorHandling } from "@/lib/api-middleware"
import { AnswerRepository } from "@/lib/repositories/answer"
import { z } from 'zod'

const answerUpdateSchema = z.object({
  content: z.string().min(1, "回答内容は必須です"),
})

export const PUT = withErrorHandling(async (request: Request, { params }: { params: { id: string; answerId: string } }) => {
  const user = await verifyAuth(request)
  const answer = await AnswerRepository.findById(params.answerId)

  if (!answer) {
    return errorResponse("回答が見つかりません", 404)
  }

  if (answer.userId !== user.uid) {
    return errorResponse("この回答を編集する権限がありません", 403)
  }

  const body = await request.json()
  const { content } = answerUpdateSchema.parse(body)

  const updatedAnswer = await AnswerRepository.update(params.answerId, { content })
  return successResponse(updatedAnswer, "回答を更新しました")
})

export const DELETE = withErrorHandling(async (request: Request, { params }: { params: { id: string; answerId: string } }) => {
  const user = await verifyAuth(request)
  const answer = await AnswerRepository.findById(params.answerId)

  if (!answer) {
    return errorResponse("回答が見つかりません", 404)
  }

  if (answer.userId !== user.uid) {
    return errorResponse("この回答を削除する権限がありません", 403)
  }

  await AnswerRepository.delete(params.answerId)
  return successResponse(null, "回答を削除しました")
})

export const PATCH = withErrorHandling(async (request: Request, { params }: { params: { id: string; answerId: string } }) => {
  const user = await verifyAuth(request)
  const answer = await AnswerRepository.findById(params.answerId)

  if (!answer) {
    return errorResponse("回答が見つかりません", 404)
  }

  if (answer.questionId !== params.id) {
    return errorResponse("この回答は指定された質問に属していません", 400)
  }

  await AnswerRepository.acceptAnswer(params.answerId, params.id)
  return successResponse(null, "ベストアンサーを設定しました")
}) 