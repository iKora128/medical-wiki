import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { action } = (await request.json()) as { action: "like" | "dislike" }
    if (!action || !["like", "dislike"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
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

    const updatedArticle = await prisma.article.update({
      where: { slug: params.slug },
      data: {
        likes: action === "like" ? article.likes + 1 : article.likes,
        dislikes: action === "dislike" ? article.dislikes + 1 : article.dislikes,
      },
    })

    return NextResponse.json(updatedArticle)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "リアクション���更新に失敗しました" },
      { status: 500 }
    )
  }
} 