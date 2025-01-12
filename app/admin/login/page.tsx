"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { Header } from "../../../components/Header"
import { Footer } from "../../../components/Footer"
import { useAuth } from "@/contexts/AuthContext"

export default function AdminLogin() {
  const [error, setError] = useState("")
  const router = useRouter()
  const { auth } = useAuth()

  const handleAdminLogin = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth!, provider)
      
      // 管理者権限の確認
      const idToken = await result.user.getIdToken()
      const response = await fetch("/api/auth/verify-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      })

      if (response.ok) {
        router.push("/admin/post")
      } else {
        setError("管理者権限がありません。")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("ログインに失敗しました。")
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-bold mb-6 text-center">管理者ログイン</h2>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex items-center justify-center">
              <button
                onClick={handleAdminLogin}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  />
                </svg>
                Googleで管理者ログイン
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}


