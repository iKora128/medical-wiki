import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyUser } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await verifyUser(request)
    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const article = await prisma.article.findUnique({
      where: { slug: params.slug }
    })

    if (!article) {
      return NextResponse.json({ error: '記事が見つかりません' }, { status: 404 })
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: user.uid,
        articleId: article.id
      }
    })

    return NextResponse.json(bookmark)
  } catch (error) {
    console.error('Error adding bookmark:', error)
    return NextResponse.json(
      { error: 'ブックマークの追加に失敗しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await verifyUser(request)
    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const article = await prisma.article.findUnique({
      where: { slug: params.slug }
    })

    if (!article) {
      return NextResponse.json({ error: '記事が見つかりません' }, { status: 404 })
    }

    await prisma.bookmark.delete({
      where: {
        userId_articleId: {
          userId: user.uid,
          articleId: article.id
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing bookmark:', error)
    return NextResponse.json(
      { error: 'ブックマークの削除に失敗しました' },
      { status: 500 }
    )
  }
} 