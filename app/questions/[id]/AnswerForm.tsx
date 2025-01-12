"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import AuthModal from "@/components/common/AuthModal"

interface AnswerFormProps {
  questionId: string
  isAuthenticated: boolean
}

export function AnswerForm({ questionId, isAuthenticated }: AnswerFormProps) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    if (!content.trim()) {
      setError("回答を入力してください")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/questions/${questionId}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setContent("")
        router.refresh()
      } else {
        setError(data.message || "回答の投稿に失敗しました")
      }
    } catch (error) {
      setError("回答の投稿に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">回答を投稿</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="あなたの回答を入力してください"
            rows={6}
            disabled={isSubmitting}
          />
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "投稿中..." : "回答を投稿"}
          </Button>
        </div>
      </form>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="ログインが必要です"
        message="回答を投稿するにはログインが必要です。"
      />
    </div>
  )
} 