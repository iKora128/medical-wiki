"use client"

import { useEffect, useState } from "react"
import { Article } from "@/types/article"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Link from "next/link"

export default function CategoryPage({ params }: { params: { name: string } }) {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(`/api/articles/search?tags=${encodeURIComponent(params.name)}`)
        if (!res.ok) {
          throw new Error("記事の取得に失敗しました")
        }
        const data = await res.json()
        setArticles(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました")
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticles()
  }, [params.name])

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          カテゴリー: {decodeURIComponent(params.name)}
        </h1>

        {isLoading && (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {!isLoading && articles.length === 0 && !error && (
          <p className="text-gray-600">
            このカテゴリーの記事はまだありません。
          </p>
        )}

        {articles.length > 0 && (
          <div className="grid gap-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
              >
                <h2 className="text-2xl font-semibold mb-2">
                  <Link
                    href={`/wiki/${article.slug}`}
                    className="text-gray-900 hover:text-blue-600"
                  >
                    {article.title}
                  </Link>
                </h2>
                <div className="text-sm text-gray-500 mb-4">
                  最終更新: {new Date(article.updatedAt).toLocaleDateString("ja-JP")}
                  {article.tags.length > 0 && (
                    <span className="ml-4">
                      タグ: {article.tags.map(tag => tag.name).join(", ")}
                    </span>
                  )}
                </div>
                <div className="prose max-w-none mb-4">
                  {article.content.length > 200
                    ? article.content.substring(0, 200) + "..."
                    : article.content}
                </div>
                <Link
                  href={`/wiki/${article.slug}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  続きを読む →
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
} 