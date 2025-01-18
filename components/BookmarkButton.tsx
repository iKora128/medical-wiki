'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs'
import AuthGuardModal from './common/AuthGuardModal'

interface BookmarkButtonProps {
  slug: string
  initialIsBookmarked: boolean
}

export default function BookmarkButton({ slug, initialIsBookmarked }: BookmarkButtonProps) {
  const { user, getIdToken } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const handleBookmarkClick = async () => {
    if (!user) {
      setIsLoginModalOpen(true)
      return
    }

    setIsLoading(true)
    try {
      const token = await getIdToken()
      const method = isBookmarked ? 'DELETE' : 'POST'
      const response = await fetch(`/api/articles/${slug}/bookmark`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'ブックマークの更新に失敗しました')
      }

      setIsBookmarked(!isBookmarked)
    } catch (error) {
      console.error('Error updating bookmark:', error)
      alert(error instanceof Error ? error.message : 'ブックマークの更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleBookmarkClick}
        disabled={isLoading}
        className="flex items-center gap-1 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
        title={isBookmarked ? "ブックマークを解除" : "ブックマークに追加"}
      >
        {isBookmarked ? (
          <BsBookmarkFill className="w-5 h-5 text-blue-500" />
        ) : (
          <BsBookmark className="w-5 h-5" />
        )}
      </button>

      <AuthGuardModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="ブックマークするにはログインが必要です"
        message="ブックマーク機能を使用するにはログインが必要です。"
      />
    </>
  )
}

