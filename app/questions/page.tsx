"use client"

import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Question } from "@prisma/client"

type QuestionWithRelations = Question & {
  author: {
    name: string | null
  }
  tags: {
    name: string
  }[]
  _count: {
    answers: number
  }
}

export default function QuestionsPage() {
  const searchParams = useSearchParams()
  const [questions, setQuestions] = useState<QuestionWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
      })

      if (searchParams) {
        const tag = searchParams.get("tag")
        const status = searchParams.get("status")
        if (tag) params.append("tag", tag)
        if (status) params.append("status", status)
      }

      const response = await fetch(`/api/questions?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setQuestions(data.data.questions)
        setTotalPages(Math.ceil(data.data.total / 10))
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchParams])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">質問一覧</h1>
        <Link href="/questions/new">
          <Button>質問を投稿</Button>
        </Link>
      </div>

      <div className="space-y-6">
        {questions.map((question) => (
          <div
            key={question.id}
            className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <Link
                href={`/questions/${question.id}`}
                className="text-xl font-semibold hover:text-blue-600 transition-colors"
              >
                {question.title}
              </Link>
              <Badge
                variant={question.status === "OPEN" ? "default" : "secondary"}
              >
                {question.status === "OPEN" ? "回答受付中" : "解決済み"}
              </Badge>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <span>
                投稿者: {question.author.name || "名無しさん"}
              </span>
              <span>
                投稿日: {format(new Date(question.createdAt), "yyyy年MM月dd日", { locale: ja })}
              </span>
              <span>
                回答数: {question._count.answers}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {question.tags.map((tag) => (
                <Link
                  key={tag.name}
                  href={`/questions?tag=${encodeURIComponent(tag.name)}`}
                >
                  <Badge variant="outline">{tag.name}</Badge>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            前のページ
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            次のページ
          </Button>
        </div>
      )}
    </div>
  )
}

