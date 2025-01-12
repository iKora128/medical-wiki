"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
import type { Answer as AnswerType } from "@prisma/client"

interface AnswerProps {
  answer: AnswerType & {
    author: {
      id: string
      name: string | null
    }
  }
  questionId: string
  isQuestionAuthor: boolean
  isAnswerAuthor: boolean
  onAnswerUpdate: () => void
}

export function Answer({
  answer,
  questionId,
  isQuestionAuthor,
  isAnswerAuthor,
  onAnswerUpdate,
}: AnswerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(answer.content)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpdate = async () => {
    if (!content.trim()) {
      setError("回答を入力してください")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/questions/${questionId}/answers/${answer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content.trim() }),
      })

      if (response.ok) {
        setIsEditing(false)
        onAnswerUpdate()
      } else {
        const data = await response.json()
        setError(data.message || "回答の更新に失敗しました")
      }
    } catch (error) {
      setError("回答の更新に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/questions/${questionId}/answers/${answer.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onAnswerUpdate()
      } else {
        const data = await response.json()
        setError(data.message || "回答の削除に失敗しました")
      }
    } catch (error) {
      setError("回答の削除に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAccept = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/questions/${questionId}/answers/${answer.id}/accept`, {
        method: "PATCH",
      })

      if (response.ok) {
        onAnswerUpdate()
      } else {
        const data = await response.json()
        setError(data.message || "ベストアンサーの選択に失敗しました")
      }
    } catch (error) {
      setError("ベストアンサーの選択に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>
            回答者: {answer.author.name || "名無しさん"}
          </span>
          <span>
            回答日: {format(new Date(answer.createdAt), "yyyy年MM月dd日", { locale: ja })}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {answer.isAccepted && (
            <Badge variant="secondary">ベストアンサー</Badge>
          )}
          {isQuestionAuthor && !answer.isAccepted && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAccept}
              disabled={isSubmitting}
            >
              ベストアンサーに選ぶ
            </Button>
          )}
          {isAnswerAuthor && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isSubmitting}
              >
                編集
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    削除
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>回答を削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>
                      この操作は取り消すことができません。
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

      {isEditing ? (
        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            disabled={isSubmitting}
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isSubmitting}
            >
              更新
            </Button>
          </div>
        </div>
      ) : (
        <div className="prose max-w-none">
          {answer.content}
        </div>
      )}
    </div>
  )
} 