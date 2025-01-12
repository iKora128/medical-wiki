'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs'
import { Dialog } from '@headlessui/react'

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
        throw new Error('Failed to update bookmark')
      }

      setIsBookmarked(!isBookmarked)
    } catch (error) {
      console.error('Error updating bookmark:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleBookmarkClick}
        disabled={isLoading}
        className="flex items-center gap-1 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
        title={isBookmarked ? "ブックマークを解除" : "ブックマークに追加"}
      >
        {isBookmarked ? (
          <BsBookmarkFill className="w-5 h-5 text-blue-500" />
        ) : (
          <BsBookmark className="w-5 h-5" />
        )}
      </button>

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
              ブックマーク機能を使用するにはログインが必要です。
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                閉じる
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
}

