import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-response"
import { withErrorHandling } from "@/lib/api-middleware"
import { z } from 'zod'

const shareSchema = z.object({
  platform: z.string()
})

export const POST = withErrorHandling(async (request: Request, { params }: { params: { slug: string } }) => {
  const user = await verifyAuth(request)
  const body = await request.json()
  const { platform } = shareSchema.parse(body)

  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
  })

  if (!article) {
    return errorResponse("記事が見つかりません", 404)
  }

  const share = await prisma.share.create({
    data: {
      userId: user.uid,
      articleId: article.id,
      platform
    },
  })

  return successResponse(share, "記事を共有しました")
}) 