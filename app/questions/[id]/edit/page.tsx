"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import AuthModal from "@/components/common/AuthModal"
import { useAuth } from "@/hooks/useAuth"
import { Question } from "@prisma/client"

type QuestionWithRelations = Question & {
  author: {
    name: string | null
  }
  tags: {
    name: string
  }[]
}

export default function EditQuestionPage() {
  const params = useParams()
  const router = useRouter()
  const questionId = params?.id as string
  const { isAuthenticated } = useAuth()
  const [question, setQuestion] = useState<QuestionWithRelations | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const fetchQuestion = useCallback(async () => {
    if (!questionId) {
      setError("質問IDが見つかりませんでした")
      return
    }

    try {
      const response = await fetch(`/api/questions/${questionId}`)
      const data = await response.json()

      if (response.ok) {
        const question = data.data.question
        setQuestion(question)
        setTitle(question.title)
        setContent(question.content)
        setTags(question.tags.map((tag: { name: string }) => tag.name))
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error("Failed to fetch question:", error)
      setError("質問の取得に失敗しました")
    }
  }, [questionId])

  useEffect(() => {
    fetchQuestion()
  }, [fetchQuestion])

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const newTag = tagInput.trim()
      if (newTag && !tags.includes(newTag) && tags.length < 5) {
        setTags([...tags, newTag])
        setTagInput("")
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    if (!title.trim() || !content.trim()) {
      setError("タイトルと内容は必須です")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tags,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/questions/${questionId}`)
      } else {
        setError(data.message || "質問の更新に失敗しました")
      }
    } catch (error) {
      setError("質問の更新に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!question) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">質問を編集</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              タイトル
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="質問のタイトルを入力してください"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              内容
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
              placeholder="質問の内容を入力してください"
              rows={10}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              タグ (最大5つ)
            </label>
            <Input
              id="tags"
              value={tagInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="タグを入力してEnterで追加"
              disabled={isSubmitting || tags.length >= 5}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "更新中..." : "質問を更新"}
            </Button>
          </div>
        </form>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          title="ログインが必要です"
          message="質問を編集するにはログインが必要です。"
        />
      </div>
    </div>
  )
} 