import { NextResponse } from "next/server"
import { QuizRepository } from "@/lib/repositories/quiz"

export async function GET() {
  try {
    const quiz = await QuizRepository.getActiveQuiz()
    
    if (!quiz) {
      return NextResponse.json(
        { message: "No active quiz found" },
        { status: 404 }
      )
    }

    // 回答は含めずに返す
    const { answer, ...quizWithoutAnswer } = quiz

    return NextResponse.json({
      message: "Quiz fetched successfully",
      data: { quiz: quizWithoutAnswer },
    })
  } catch (error) {
    console.error("Failed to fetch active quiz:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
} 