"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Dialog } from "@headlessui/react"

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
  answers: Array<{
    id: string
  }>
}

type PaginationData = {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function QuestionsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          ...(search && { search }),
          ...(selectedTag && { tag: selectedTag }),
          ...(selectedStatus && { status: selectedStatus }),
        })

        const response = await fetch(`/api/questions?${queryParams}`)
        if (!response.ok) throw new Error("質問の取得に失敗しました")
        
        const data = await response.json()
        setQuestions(data.questions)
        setPagination(data.pagination)
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました")
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [pagination.page, search, selectedTag, selectedStatus])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleActionClick = () => {
    if (!user) {
      setIsLoginModalOpen(true)
      return
    }
    // ユーザーがログインしている場合の処理
  }

  if (isLoading) return <div>読み込み中...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">質問一覧</h1>
        {user && (
          <Link
            href="/questions/new"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            質問する
          </Link>
        )}
      </div>

      {/* 検索フォーム */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="キーワードで検索..."
            className="flex-1 p-2 border rounded"
          />
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">タグを選択</option>
            {/* タグ一覧を動的に表示 */}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">ステータス</option>
            <option value="OPEN">未解決</option>
            <option value="CLOSED">解決済み</option>
          </select>
          <button
            type="submit"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            検索
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* 質問一覧 */}
      <div className="space-y-4">
        {questions.map((question) => (
          <div
            key={question.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <Link
              href={`/questions/${question.id}`}
              className="text-xl font-semibold hover:text-blue-600"
            >
              {question.title}
            </Link>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
              <span>
                回答: {question.answers.length}件
              </span>
              <span>
                投稿者: {question.user.name || "名前未設定"}
              </span>
              <span>
                {new Date(question.createdAt).toLocaleDateString()}
              </span>
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
            <div className="mt-2 flex flex-wrap gap-2">
              {question.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 bg-gray-100 text-sm rounded"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ページネーション */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          全{pagination.total}件中 {(pagination.page - 1) * pagination.limit + 1}-
          {Math.min(pagination.page * pagination.limit, pagination.total)}件を表示
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
            }
            disabled={pagination.page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            前へ
          </button>
          <span className="px-3 py-1">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            次へ
          </button>
        </div>
      </div>

      {/* ログインモーダル */}
      <Dialog
        open={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
            <Dialog.Title className="text-lg font-medium mb-4">ログインが必要です</Dialog.Title>
            <p className="mb-4">この機能を利用するにはログインが必要です。</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                ログインする
              </Link>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
}

