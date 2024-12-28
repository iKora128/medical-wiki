"use client"

import { useState } from "react"
import { Header } from "../../../components/Header"
import { Footer } from "../../../components/Footer"
import ReactMarkdown from "react-markdown"

export default function AdminPost() {
  const [title, setTitle] = useState("''")
  const [content, setContent] = useState("''")
  const [preview, setPreview] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // ここで記事をサーバーに送信する処理を実装します
    console.log("'Title:'", title)
    console.log("'Content:'", content)
    alert("'記事が投稿されました。'")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">新規記事投稿</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border border-neutral-200 border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:border-neutral-800"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              内容 (Markdown形式)
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="mt-1 block w-full border border-neutral-200 border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:border-neutral-800"
              required
            ></textarea>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              投稿
            </button>
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {preview ? "'プレビューを閉じる'" : "'プレビュー'"}
            </button>
          </div>
        </form>
        {preview && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">プレビュー</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <h1 className="text-3xl font-bold mb-4">{title}</h1>
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

