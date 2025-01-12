"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Dialog } from "@headlessui/react"
import { AiOutlineLike, AiFillLike } from "react-icons/ai"

interface LikeButtonProps {
  slug: string
  initialLikeCount: number
  initialIsLiked: boolean
}

export default function LikeButton({ slug, initialLikeCount, initialIsLiked }: LikeButtonProps) {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const handleLikeClick = async () => {
    if (!user) {
      setIsLoginModalOpen(true)
      return
    }

    setIsLoading(true)
    try {
      const method = isLiked ? "DELETE" : "POST"
      const response = await fetch(`/api/articles/${slug}/like`, {
        method,
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`
        }
      })

      if (!response.ok) {
        throw new Error("いいねの更新に失敗しました")
      }

      setIsLiked(!isLiked)
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
    } catch (error) {
      console.error("いいね更新エラー:", error)
      alert("いいねの更新に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleLikeClick}
        disabled={isLoading}
        className="flex items-center gap-1 px-3 py-1 text-sm rounded-full border hover:bg-gray-100 transition-colors disabled:opacity-50"
        title={isLiked ? "いいねを取り消す" : "いいねする"}
      >
        {isLiked ? (
          <AiFillLike className="text-blue-500" />
        ) : (
          <AiOutlineLike />
        )}
        <span>{likeCount}</span>
      </button>

      {/* ログインモーダル */}
      <Dialog
        open={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              ログインが必要です
            </Dialog.Title>
            <p className="mb-4">
              いいね機能を利用するにはログインが必要です。
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
              <a
                href="/login"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                ログインする
              </a>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
} 