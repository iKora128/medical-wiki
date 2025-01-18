import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    const { quizId, answer } = await req.json()

    if (!quizId || !answer) {
      return NextResponse.json(
        { message: "Quiz ID and answer are required" },
        { status: 400 }
      )
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    })

    if (!quiz) {
      return NextResponse.json(
        { message: "Quiz not found" },
        { status: 404 }
      )
    }

    const isCorrect = quiz.answer === answer

    // 回答を保存
    await prisma.quizAnswer.create({
      data: {
        userId: user.uid,
        quizId,
        answer,
        isCorrect,
      },
    })

    return NextResponse.json({
      message: "Answer submitted successfully",
      data: {
        isCorrect,
        explanation: quiz.explanation,
        correctAnswer: quiz.answer,
      },
    })
  } catch (error) {
    console.error("Failed to submit answer:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
} 