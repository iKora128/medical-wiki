"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Question, Answer as AnswerType } from "@prisma/client"
import { AnswerForm } from "./AnswerForm"
import { Answer } from "./Answer"
import { useAuth } from "@/hooks/useAuth"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type QuestionWithRelations = Question & {
  author: {
    id: string
    name: string | null
  }
  tags: {
    name: string
  }[]
  answers: (AnswerType & {
    author: {
      id: string
      name: string | null
    }
  })[]
}

export default function QuestionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const questionId = params?.id as string
  const { user, isAuthenticated } = useAuth()
  const [question, setQuestion] = useState<QuestionWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchQuestion = useCallback(async () => {
    if (!questionId) {
      setError("質問IDが見つかりませんでした")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/questions/${questionId}`)
      const data = await response.json()

      if (response.ok) {
        setQuestion(data.data.question)
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error("Failed to fetch question:", error)
      setError("質問の取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }, [questionId])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/questions")
      } else {
        const data = await response.json()
        setError(data.message || "質問の削除に失敗しました")
      }
    } catch (error) {
      setError("質問の削除に失敗しました")
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    fetchQuestion()
  }, [fetchQuestion])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error || !question) {
    return <div className="text-red-500">{error || "質問が見つかりませんでした"}</div>
  }

  const canEdit = isAuthenticated && user?.id === question.author.id

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{question.title}</h1>
          <div className="flex items-center space-x-4">
            <Badge variant={question.status === "OPEN" ? "default" : "secondary"}>
              {question.status === "OPEN" ? "回答受付中" : "解決済み"}
            </Badge>
            {canEdit && (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/questions/${questionId}/edit`)}
                >
                  編集
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                      {isDeleting ? "削除中..." : "削除"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>質問を削除しますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        この操作は取り消すことができません。質問に対する回答もすべて削除されます。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        削除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
          <span>
            投稿者: {question.author.name || "名無しさん"}
          </span>
          <span>
            投稿日: {format(new Date(question.createdAt), "yyyy年MM月dd日", { locale: ja })}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {question.tags.map((tag) => (
            <Badge key={tag.name} variant="outline">
              {tag.name}
            </Badge>
          ))}
        </div>

        <div className="prose max-w-none mb-8">
          {question.content}
        </div>

        <div className="border-t pt-8">
          <h2 className="text-xl font-bold mb-6">回答 ({question.answers.length})</h2>
          {question.answers.length === 0 ? (
            <p className="text-gray-500">まだ回答がありません。</p>
          ) : (
            <div className="space-y-6">
              {question.answers.map((answer) => (
                <Answer
                  key={answer.id}
                  answer={answer}
                  questionId={questionId}
                  isQuestionAuthor={canEdit}
                  isAnswerAuthor={isAuthenticated && user?.id === answer.author.id}
                  onAnswerUpdate={fetchQuestion}
                />
              ))}
            </div>
          )}

          {question.status === "OPEN" && (
            <AnswerForm
              questionId={questionId}
              isAuthenticated={isAuthenticated}
            />
          )}
        </div>
      </div>
    </div>
  )
} 