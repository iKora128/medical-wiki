"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Header from "@/components/Header"

type Quiz = {
  id: string
  question: string
  options: string[]
  answer?: string
  explanation?: string
}

type QuizHistory = {
  id: string
  quizId: string
  quiz: Quiz
  answer: string
  isCorrect: boolean
  createdAt: string
}

export default function QuizPage() {
  const { isAuthenticated } = useAuth()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [history, setHistory] = useState<QuizHistory[]>([])

  useEffect(() => {
    fetchQuiz()
    if (isAuthenticated) {
      fetchHistory()
    }
  }, [isAuthenticated])

  const fetchQuiz = async () => {
    try {
      const response = await fetch("/api/quiz")
      const data = await response.json()
      if (response.ok) {
        setQuiz(data.quiz)
      }
    } catch (error) {
      console.error("Failed to fetch quiz:", error)
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/quiz/history")
      const data = await response.json()
      if (response.ok) {
        setHistory(data.history)
      }
    } catch (error) {
      console.error("Failed to fetch history:", error)
    }
  }

  const handleAnswer = async (option: string) => {
    if (isAnswered || !quiz) return

    setSelectedOption(option)
    setIsAnswered(true)

    try {
      const response = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId: quiz.id,
          answer: option,
        }),
      })

      if (response.ok && isAuthenticated) {
        fetchHistory()
      }
    } catch (error) {
      console.error("Failed to submit answer:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {quiz ? (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{quiz.question}</h2>
              <div className="space-y-3">
                {quiz.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={
                      isAnswered
                        ? option === quiz.answer
                          ? "default"
                          : option === selectedOption
                          ? "destructive"
                          : "outline"
                        : "outline"
                    }
                    className="w-full justify-start"
                    onClick={() => handleAnswer(option)}
                    disabled={isAnswered}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              {isAnswered && quiz.explanation && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">解説</h3>
                  <p className="text-gray-700">{quiz.explanation}</p>
                </div>
              )}
            </Card>
          ) : (
            <p className="text-center text-gray-600">
              本日のクイズは終了しました。また明日チャレンジしてください！
            </p>
          )}

          {isAuthenticated && history.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">回答履歴</h2>
              <div className="space-y-4">
                {history.map((item) => (
                  <Card key={item.id} className="p-4">
                    <p className="font-medium">{item.quiz.question}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      回答: {item.answer}
                      {item.isCorrect ? (
                        <span className="text-green-600 ml-2">✓ 正解</span>
                      ) : (
                        <span className="text-red-600 ml-2">✗ 不正解</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

