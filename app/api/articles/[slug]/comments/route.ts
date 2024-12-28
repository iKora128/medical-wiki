import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
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
      return NextResponse.json(
        { error: "記事が見つかりませんでした" },
        { status: 404 }
      )
    }

    return NextResponse.json(article.comments)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "コメントの取得に失敗しました" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      )
    }

    const { content } = await request.json()
    if (!content?.trim()) {
      return NextResponse.json(
        { error: "コメント内容は必須です" },
        { status: 400 }
      )
    }

    const article = await prisma.article.findUnique({
      where: { slug: params.slug },
    })

    if (!article) {
      return NextResponse.json(
        { error: "記事が見つかりませんでした" },
        { status: 404 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりませんでした" },
        { status: 404 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content,
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

    return NextResponse.json(comment)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "コメントの投稿に失敗しました" },
      { status: 500 }
    )
  }
} 