"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function AdminPost() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [slug, setSlug] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [preview, setPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")

  useEffect(() => {
    if (slug.trim() === "") {
      setIsEditing(false)
      return
    }

    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/articles/${slug}`)
        if (res.ok) {
          const data = await res.json()
          setIsEditing(true)
          setTitle(data.title)
          setContent(data.content)
          setTags(data.tags.map((t: { name: string }) => t.name).join(", "))
        } else {
          setIsEditing(false)
          setStatusMessage("記事が存在しません。新規投稿モードです。")
        }
      } catch (error) {
        console.error(error)
        setStatusMessage("記事取得時にエラーが発生しました。")
      }
    }

    fetchArticle()
  }, [slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setIsSubmitting(true)
      setStatusMessage("")

      const idToken = await user.getIdToken()
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== "")

      const endpoint = isEditing ? `/api/articles/${slug}` : "/api/articles"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          slug: isEditing ? undefined : slug,
          title,
          content,
          tags: tagsArray,
          status: "draft",
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "操作に失敗しました")
      }

      const article = await res.json()
      setStatusMessage(
        `記事「${article.title}」を${isEditing ? "更新" : "作成"}しました。`
      )

      if (!isEditing) {
        // 新規作成後は編集モードに切り替え
        setSlug(article.slug)
        setIsEditing(true)
      }
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "エラーが発生しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div>Loading...</div>

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          {isEditing ? "記事編集" : "新規記事投稿"}
        </h1>

        {statusMessage && (
          <div
            className={`mb-4 p-4 rounded ${
              statusMessage.includes("エラー")
                ? "bg-red-50 text-red-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {statusMessage}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            スラッグ (URL の一部)
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
            placeholder="例: hypertension"
            disabled={isEditing}
          />
          <p className="text-sm text-gray-500 mt-1">
            {isEditing
              ? "編集モード中はスラッグを変更できません"
              : "既存記事のスラッグを入力すると編集モードになります"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              タイトル
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              タグ（カンマ区切り）
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
              placeholder="例: 循環器, 高血圧"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              本文 (Markdown��式)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
              required
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting
                ? "送信中..."
                : isEditing
                ? "更新する"
                : "投稿する"}
            </button>
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              {preview ? "プレビューを閉じる" : "プレビュー"}
            </button>
          </div>
        </form>

        {preview && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">プレビュー</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <h1 className="text-3xl font-bold mb-4">{title}</h1>
              <div className="prose prose-blue max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </div>
              {tags && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {tags.split(",").map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

