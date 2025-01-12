import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyUser } from "@/lib/auth"

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await verifyUser(request)
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const article = await prisma.article.findUnique({
      where: { slug: params.slug }
    })

    if (!article) {
      return NextResponse.json({ error: "記事が見つかりません" }, { status: 404 })
    }

    const { platform } = await request.json()
    if (!platform) {
      return NextResponse.json({ error: "プラットフォームが指定されていません" }, { status: 400 })
    }

    // 共有を記録
    const share = await prisma.share.create({
      data: {
        userId: user.uid,
        articleId: article.id,
        platform
      }
    })

    return NextResponse.json(share)
  } catch (error) {
    console.error("共有記録エラー:", error)
    return NextResponse.json({ error: "共有の記録に失敗しました" }, { status: 500 })
  }
} 