import { prisma } from '@/lib/prisma'
import { verifyAuth, handleAuthError } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function GET(request: Request) {
  try {
    const user = await verifyAuth(request)
    
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.uid },
      include: {
        article: {
          include: {
            tags: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return successResponse(bookmarks, 'ブックマーク一覧を取得しました')
  } catch (error) {
    return handleAuthError(error)
  }
} 