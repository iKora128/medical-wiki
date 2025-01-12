import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyUser } from "@/lib/auth"

// 質問一覧取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status")
    const tag = searchParams.get("tag")

    // 検索条件の構築
    const where = {
      AND: [
        {
          OR: [
            { title: { contains: search } },
            { content: { contains: search } },
          ],
        },
        status ? { status } : {},
        tag ? { tags: { some: { name: tag } } } : {},
      ],
    }

    // 総件数の取得
    const total = await prisma.question.count({ where })

    // 質問一覧の取得
    const questions = await prisma.question.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        tags: true,
        answers: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    })

    return NextResponse.json({
      questions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("質問一覧取得エラー:", error)
    return NextResponse.json(
      { error: "質問一覧の取得に失敗しました" },
      { status: 500 }
    )
  }
}

// 質問作成
export async function POST(request: Request) {
  try {
    const user = await verifyUser(request)
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const { title, content, tags } = await request.json()
    if (!title || !content) {
      return NextResponse.json(
        { error: "タイトルと内容は必須です" },
        { status: 400 }
      )
    }

    const question = await prisma.question.create({
      data: {
        title,
        content,
        userId: user.uid,
        tags: {
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        tags: true,
      },
    })

    return NextResponse.json(question)
  } catch (error) {
    console.error("質問作成エラー:", error)
    return NextResponse.json(
      { error: "質問の作成に失敗しました" },
      { status: 500 }
    )
  }
} 