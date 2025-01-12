"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai"

type Props = {
  articleId: string
  initialIsFavorited?: boolean
}

export default function FavoriteButton({ articleId, initialIsFavorited = false }: Props) {
  const { user } = useAuth()
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [isLoading, setIsLoading] = useState(false)

  const toggleFavorite = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      if (isFavorited) {
        await fetch(`/api/favorites`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ articleId })
        })
        setIsFavorited(false)
      } else {
        await fetch(`/api/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ articleId })
        })
        setIsFavorited(true)
      }
    } catch (error) {
      console.error("お気に入り操作エラー:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={!user || isLoading}
      className="flex items-center gap-1 text-pink-500 hover:text-pink-600 disabled:opacity-50"
      title={user ? "お気に入りに追加/削除" : "ログインが必要です"}
    >
      {isFavorited ? <AiFillHeart size={20} /> : <AiOutlineHeart size={20} />}
      <span className="text-sm">
        {isFavorited ? "お気に入り済み" : "お気に入り"}
      </span>
    </button>
  )
} 