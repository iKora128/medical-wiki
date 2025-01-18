import { NextRequest, NextResponse } from "next/server"
import { QuizRepository } from "@/lib/repositories/quiz"
import { verifySystemUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifySystemUser(req)
    if (!authResult.isValid) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await req.json()
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { message: "Invalid request body. Expected an array of quizzes." },
        { status: 400 }
      )
    }

    // バリデーション
    for (const quiz of data) {
      if (!quiz.question || !Array.isArray(quiz.options) || !quiz.answer || !quiz.explanation) {
        return NextResponse.json(
          { message: "Invalid quiz data. Each quiz must have question, options, answer, and explanation." },
          { status: 400 }
        )
      }
    }

    const result = await QuizRepository.createMany(data)

    return NextResponse.json({
      message: "Quizzes created successfully",
      data: { count: result.count },
    })
  } catch (error) {
    console.error("Failed to create quizzes:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
} 