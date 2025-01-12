import { verifyAuth } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-response'
import { ProfileRepository } from '@/lib/repositories/profile'
import { withErrorHandling } from '@/lib/api-middleware'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  specialty: z.string().optional(),
  occupation: z.string().optional(),
  website: z.string().url().optional(),
})

export const GET = withErrorHandling(async (request: Request) => {
  const user = await verifyAuth(request)
  const profile = await ProfileRepository.findByUserId(user.uid)

  if (!profile) {
    return errorResponse('プロフィールが見つかりません', 404)
  }

  return successResponse(profile)
})

export const PUT = withErrorHandling(async (request: Request) => {
  const user = await verifyAuth(request)
  const body = await request.json()
  const data = profileSchema.parse(body)

  const profile = await ProfileRepository.upsert(user.uid, data)
  return successResponse(profile, 'プロフィールを更新しました')
}) 