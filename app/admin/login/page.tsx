"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function AdminLogin() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { user, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleLogin = async () => {
    try {
      setLoading(true)
      setError(null)

      // Googleログイン
      const userCredential = await signInWithGoogle()
      if (!userCredential) {
        throw new Error("ログインに失敗しました")
      }

      // IDトークンの取得
      const idToken = await userCredential.user.getIdToken()

      // 管理者認証
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      })

      if (!response.ok) {
        throw new Error("管理者権限がありません")
      }

      router.push("/admin")
    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : "ログインに失敗しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            管理者ログイン
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? "ログイン中..." : "Googleでログイン"}
        </button>
      </div>
    </div>
  )
}


