import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // 公開済みの記事のみを取得
    const articles = await prisma.article.findMany({
      where: { status: "published" },
      include: {
        tags: true,
      },
    })

    if (articles.length === 0) {
      return NextResponse.json(
        { error: "記事が見つかりませんでした" },
        { status: 404 }
      )
    }

    // ランダムに1つの記事を選択
    const randomIndex = Math.floor(Math.random() * articles.length)
    const randomArticle = articles[randomIndex]

    return NextResponse.json(randomArticle)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "ランダム記事の取得に失敗しました" },
      { status: 500 }
    )
  }
} 