import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyUser } from "@/lib/auth"

// 回答更新
export async function PUT(
  request: Request,
  { params }: { params: { id: string; answerId: string } }
) {
  try {
    const user = await verifyUser(request)
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    // 回答の存在と所有権を確認
    const existingAnswer = await prisma.answer.findUnique({
      where: { id: params.answerId },
    })

    if (!existingAnswer) {
      return NextResponse.json(
        { error: "回答が見つかりません" },
        { status: 404 }
      )
    }

    if (existingAnswer.userId !== user.uid) {
      return NextResponse.json(
        { error: "この操作を行う権限がありません" },
        { status: 403 }
      )
    }

    const { content } = await request.json()
    const answer = await prisma.answer.update({
      where: { id: params.answerId },
      data: { content },
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
    console.error("回答更新エラー:", error)
    return NextResponse.json(
      { error: "回答の更新に失敗しました" },
      { status: 500 }
    )
  }
}

// 回答削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; answerId: string } }
) {
  try {
    const user = await verifyUser(request)
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    // 回答の存在と所有権を確認
    const existingAnswer = await prisma.answer.findUnique({
      where: { id: params.answerId },
    })

    if (!existingAnswer) {
      return NextResponse.json(
        { error: "回答が見つかりません" },
        { status: 404 }
      )
    }

    if (existingAnswer.userId !== user.uid) {
      return NextResponse.json(
        { error: "この操作を行う権限がありません" },
        { status: 403 }
      )
    }

    await prisma.answer.delete({
      where: { id: params.answerId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("回答削除エラー:", error)
    return NextResponse.json(
      { error: "回答の削除に失敗しました" },
      { status: 500 }
    )
  }
}

// ベストアンサー選択
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; answerId: string } }
) {
  try {
    const user = await verifyUser(request)
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    // 質問の存在と所有権を確認
    const question = await prisma.question.findUnique({
      where: { id: params.id },
    })

    if (!question) {
      return NextResponse.json(
        { error: "質問が見つかりません" },
        { status: 404 }
      )
    }

    if (question.userId !== user.uid) {
      return NextResponse.json(
        { error: "この操作を行う権限がありません" },
        { status: 403 }
      )
    }

    // 他のベストアンサーを解除
    await prisma.answer.updateMany({
      where: { questionId: params.id },
      data: { isAccepted: false },
    })

    // 新しいベストアンサーを設定
    const answer = await prisma.answer.update({
      where: { id: params.answerId },
      data: { isAccepted: true },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // 質問のステータスを更新
    await prisma.question.update({
      where: { id: params.id },
      data: { status: "CLOSED" },
    })

    return NextResponse.json(answer)
  } catch (error) {
    console.error("ベストアンサー選択エラー:", error)
    return NextResponse.json(
      { error: "ベストアンサーの選択に失敗しました" },
      { status: 500 }
    )
  }
} 