import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyUser } from "@/lib/auth"

// 回答作成
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyUser(request)
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const { content } = await request.json()
    if (!content) {
      return NextResponse.json(
        { error: "回答内容は必須です" },
        { status: 400 }
      )
    }

    // 質問の存在確認
    const question = await prisma.question.findUnique({
      where: { id: params.id },
    })

    if (!question) {
      return NextResponse.json(
        { error: "質問が見つかりません" },
        { status: 404 }
      )
    }

    const answer = await prisma.answer.create({
      data: {
        content,
        userId: user.uid,
        questionId: params.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(answer)
  } catch (error) {
    console.error("回答作成エラー:", error)
    return NextResponse.json(
      { error: "回答の作成に失敗しました" },
      { status: 500 }
    )
  }
}

// 回答一覧取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const answers = await prisma.answer.findMany({
      where: { questionId: params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { isAccepted: "desc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(answers)
  } catch (error) {
    console.error("回答一覧取得エラー:", error)
    return NextResponse.json(
      { error: "回答一覧の取得に失敗しました" },
      { status: 500 }
    )
  }
} 