"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import FavoriteButton from "@/components/FavoriteButton"

type Favorite = {
  id: string
  articleId: string
  createdAt: string
  article: {
    id: string
    slug: string
    title: string
    createdAt: string
    tags: Array<{ id: string; name: string }>
  }
}

export default function FavoritesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchFavorites()
  }, [user, router])

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/favorites")
      if (!response.ok) throw new Error("お気に入りの取得に失敗しました")
      const data = await response.json()
      setFavorites(data)
    } catch (error) {
      setError("お気に入りの取得に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div>読み込み中...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">お気に入り記事</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">お気に入りの記事はありません</p>
          <Link
            href="/articles"
            className="mt-4 inline-block text-blue-500 hover:underline"
          >
            記事一覧を見る
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {favorites.map(favorite => (
            <div
              key={favorite.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    href={`/articles/${favorite.article.slug}`}
                    className="text-xl font-semibold hover:text-blue-600"
                  >
                    {favorite.article.title}
                  </Link>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {favorite.article.tags.map(tag => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 bg-gray-100 text-sm rounded"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
                <FavoriteButton
                  articleId={favorite.article.id}
                  initialIsFavorited={true}
                />
              </div>
              <div className="mt-2 text-sm text-gray-500">
                追加日: {new Date(favorite.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 