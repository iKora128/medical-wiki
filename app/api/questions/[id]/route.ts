import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyUser } from "@/lib/auth"

// 質問詳細取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        tags: true,
        answers: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            isAccepted: "desc",
            createdAt: "desc",
          },
        },
      },
    })

    if (!question) {
      return NextResponse.json(
        { error: "質問が見つかりません" },
        { status: 404 }
      )
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error("質問取得エラー:", error)
    return NextResponse.json(
      { error: "質問の取得に失敗しました" },
      { status: 500 }
    )
  }
}

// 質問更新
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyUser(request)
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    // 質問の存在と所有権を確認
    const existingQuestion = await prisma.question.findUnique({
      where: { id: params.id },
    })

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "質問が見つかりません" },
        { status: 404 }
      )
    }

    if (existingQuestion.userId !== user.uid) {
      return NextResponse.json(
        { error: "この操作を行う権限がありません" },
        { status: 403 }
      )
    }

    const { title, content, tags, status } = await request.json()
    const question = await prisma.question.update({
      where: { id: params.id },
      data: {
        title,
        content,
        status,
        tags: {
          set: [],
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
    console.error("質問更新エラー:", error)
    return NextResponse.json(
      { error: "質問の更新に失敗しました" },
      { status: 500 }
    )
  }
}

// 質問削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyUser(request)
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    // 質問の存在と所有権を確認
    const existingQuestion = await prisma.question.findUnique({
      where: { id: params.id },
    })

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "質問が見つかりません" },
        { status: 404 }
      )
    }

    if (existingQuestion.userId !== user.uid) {
      return NextResponse.json(
        { error: "この操作を行う権限がありません" },
        { status: 403 }
      )
    }

    await prisma.question.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("質問削除エラー:", error)
    return NextResponse.json(
      { error: "質問の削除に失敗しました" },
      { status: 500 }
    )
  }
} 