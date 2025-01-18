import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req)

    const history = await prisma.quizAnswer.findMany({
      where: {
        userId: user.uid,
      },
      include: {
        quiz: {
          select: {
            question: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10, // 最新10件を取得
    })

    return NextResponse.json({
      message: "Quiz history fetched successfully",
      data: {
        history: history.map((item) => ({
          quizId: item.quizId,
          question: item.quiz.question,
          answer: item.answer,
          isCorrect: item.isCorrect,
          createdAt: item.createdAt,
        })),
      },
    })
  } catch (error) {
    console.error("Failed to fetch quiz history:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
} 