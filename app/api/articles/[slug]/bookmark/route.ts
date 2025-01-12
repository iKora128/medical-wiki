import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth, handleAuthError } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-response'
import { BookmarkRepository } from '@/lib/repositories/bookmark'
import { ArticleRepository } from '@/lib/repositories/article'

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await verifyAuth(request)

    const article = await ArticleRepository.findBySlug(params.slug)
    if (!article) {
      return errorResponse('記事が見つかりません', 404)
    }

    await BookmarkRepository.create(user.uid, article.id)
    return successResponse({ success: true }, 'ブックマークを追加しました')
  } catch (error) {
    return handleAuthError(error)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await verifyAuth(request)

    const article = await ArticleRepository.findBySlug(params.slug)
    if (!article) {
      return errorResponse('記事が見つかりません', 404)
    }

    await BookmarkRepository.delete(user.uid, article.id)
    return successResponse({ success: true }, 'ブックマークを削除しました')
  } catch (error) {
    return handleAuthError(error)
  }
} 