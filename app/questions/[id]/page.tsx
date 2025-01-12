"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

type Answer = {
  id: string
  content: string
  isAccepted: boolean
  createdAt: string
  user: {
    name: string | null
    email: string
  }
}

type Question = {
  id: string
  title: string
  content: string
  status: string
  createdAt: string
  user: {
    name: string | null
    email: string
  }
  tags: Array<{
    id: string
    name: string
  }>
  answers: Answer[]
}

export default function QuestionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, getIdToken } = useAuth()
  const [question, setQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchQuestion()
  }, [params.id])

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`/api/questions/${params.id}`)
      if (!response.ok) throw new Error("質問の取得に失敗しました")
      
      const data = await response.json()
      setQuestion(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError("回答を投稿するにはログインが必要です")
      return
    }

    if (!answer.trim()) {
      setError("回答を入力してください")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const token = await getIdToken()
      if (!token) {
        throw new Error("認証トークンの取得に失敗しました")
      }

      const response = await fetch(`/api/questions/${params.id}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: answer.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "回答の投稿に失敗しました")
      }

      setAnswer("")
      await fetchQuestion()
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAcceptAnswer = async (answerId: string) => {
    if (!user || !question || user.email !== question.user.email) {
      setError("この操作を実行する権限がありません")
      return
    }

    try {
      const token = await getIdToken()
      if (!token) {
        throw new Error("認証トークンの取得に失敗しました")
      }

      const response = await fetch(`/api/questions/${params.id}/answers/${answerId}/accept`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "ベストアンサーの選択に失敗しました")
      }

      await fetchQuestion()
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました")
    }
  }

  if (isLoading) return <div>読み込み中...</div>
  if (!question) return <div>質問が見つかりません</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span>投稿者: {question.user.name || "名前未設定"}</span>
          <span>{new Date(question.createdAt).toLocaleDateString()}</span>
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              question.status === "OPEN"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {question.status === "OPEN" ? "未解決" : "解決済み"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {question.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-1 bg-gray-100 text-sm rounded"
            >
              {tag.name}
            </span>
          ))}
        </div>
        <div className="prose max-w-none">
          {question.content}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">
          回答 ({question.answers.length}件)
        </h2>
        <div className="space-y-6">
          {question.answers.map((answer) => (
            <div
              key={answer.id}
              className={`p-4 rounded-lg ${
                answer.isAccepted
                  ? "bg-green-50 border border-green-200"
                  : "bg-white border"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {answer.user.name || "名前未設定"}
                  </span>
                  <span className="text-sm text-gray-600">
                    {new Date(answer.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {answer.isAccepted && (
                  <span className="text-green-600 text-sm font-medium">
                    ベストアンサー
                  </span>
                )}
              </div>
              <div className="prose max-w-none mb-2">{answer.content}</div>
              {user &&
                question.user.email === user.email &&
                question.status === "OPEN" &&
                !answer.isAccepted && (
                  <button
                    onClick={() => handleAcceptAnswer(answer.id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    ベストアンサーに選ぶ
                  </button>
                )}
            </div>
          ))}
        </div>
      </div>

      {user && question.status === "OPEN" && (
        <div>
          <h2 className="text-xl font-bold mb-4">回答を投稿</h2>
          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <div>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="あなたの回答を入力してください"
                rows={6}
                className="w-full p-2 border rounded"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "投稿中..." : "回答を投稿"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!user && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          回答を投稿するにはログインが必要です
        </div>
      )}
    </div>
  )
} 