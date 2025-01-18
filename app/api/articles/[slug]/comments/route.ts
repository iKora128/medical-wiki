import { prisma } from "@/lib/prisma"
import { withErrorHandling } from '@/lib/api-middleware'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getServerSession } from "next-auth"
import { z } from 'zod'

const commentSchema = z.object({
  content: z.string().min(1, 'コメント内容は必須です')
})

export const GET = withErrorHandling(async (request: Request, { params }: { params: { slug: string } }) => {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: {
      comments: {
        include: {
          author: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!article) {
    return errorResponse("記事が見つかりませんでした", 404)
  }

  return successResponse(article.comments)
})

export const POST = withErrorHandling(async (request: Request, { params }: { params: { slug: string } }) => {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return errorResponse("ログインが必要です", 401)
  }

  const data = commentSchema.parse(await request.json())

  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
  })

  if (!article) {
    return errorResponse("記事が見つかりませんでした", 404)
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return errorResponse("ユーザーが見つかりませんでした", 404)
  }

  const comment = await prisma.comment.create({
    data: {
      content: data.content,
      articleId: article.id,
      authorId: user.id,
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  })

  return successResponse(comment, 'コメントを投稿しました')
}) 