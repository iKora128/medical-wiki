"use client"

import { useEffect, useState } from "react"
import { Article } from "@/types/article"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Link from "next/link"

export default function RandomArticlePage() {
  const [article, setArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRandom = async () => {
      try {
        const res = await fetch("/api/articles/random")
        if (!res.ok) {
          throw new Error("記事の取得に失敗しました")
        }
        const data = await res.json()
        setArticle(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRandom()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">ランダム記事</h1>
        
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

        {article && !isLoading && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">{article.title}</h2>
            <div className="text-sm text-gray-500 mb-4">
              最終更新: {new Date(article.updatedAt).toLocaleDateString("ja-JP")}
              {article.tags.length > 0 && (
                <span className="ml-4">
                  タグ: {article.tags.map(tag => tag.name).join(", ")}
                </span>
              )}
            </div>
            <div className="prose max-w-none mb-6">
              {article.content.length > 300 
                ? article.content.substring(0, 300) + "..."
                : article.content}
            </div>
            <Link
              href={`/wiki/${article.slug}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              記事を読む →
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
} 