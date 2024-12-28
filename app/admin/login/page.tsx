"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "../../../components/Header"
import { Footer } from "../../../components/Footer"

export default function AdminLogin() {
  const [password, setPassword] = useState("''")
  const [error, setError] = useState("''")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // 実際の実装では、このチェックはサーバーサイドで行うべきです
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      router.push("'/admin/post'")
    } else {
      setError("'パスワードが正しくありません。'")
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-bold mb-6 text-center">管理者ログイン</h2>
            {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                パスワード
              </label>
              <input
                className="shadow appearance-none border border-neutral-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:border-neutral-800"
                id="password"
                type="password"
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                ログイン
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}

