"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Dialog } from "@headlessui/react"
import { FcGoogle } from "react-icons/fc"
import { HiMail } from "react-icons/hi"

type AuthMode = "login" | "signup" | "forgotPassword"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      switch (mode) {
        case "login":
          await signInWithEmail(email, password)
          break
        case "signup":
          await signUpWithEmail(email, password)
          break
        case "forgotPassword":
          await resetPassword(email)
          setError("パスワードリセットメールを送信しました")
          break
      }
      onClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "エラーが発生しました"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setError(null)
      setLoading(true)
      await signInWithGoogle()
      onClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "エラーが発生しました"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <Dialog.Panel className="relative mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <div className="mb-6 text-center">
            <Dialog.Title className="text-2xl font-bold">
              {mode === "login" && "ログイン"}
              {mode === "signup" && "アカウント作成"}
              {mode === "forgotPassword" && "パスワードをリセット"}
            </Dialog.Title>
          </div>

          {error && (
            <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>

            {mode !== "forgotPassword" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  パスワード
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "処理中..." : (
                mode === "login" ? "ログイン" :
                mode === "signup" ? "アカウント作成" :
                "パスワードをリセット"
              )}
            </button>
          </form>

          {mode !== "forgotPassword" && (
            <>
              <div className="my-4 flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-gray-500">または</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="mb-4 flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <FcGoogle className="mr-2 h-5 w-5" />
                Googleでログイン
              </button>
            </>
          )}

          <div className="mt-4 text-center text-sm">
            {mode === "login" && (
              <>
                <button
                  onClick={() => setMode("forgotPassword")}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  パスワードをお忘れですか？
                </button>
                <div className="mt-2">
                  アカウントをお持ちでない方は
                  <button
                    onClick={() => setMode("signup")}
                    className="ml-1 text-indigo-600 hover:text-indigo-500"
                  >
                    新規登録
                  </button>
                </div>
              </>
            )}
            {mode === "signup" && (
              <div>
                すでにアカウントをお持ちの方は
                <button
                  onClick={() => setMode("login")}
                  className="ml-1 text-indigo-600 hover:text-indigo-500"
                >
                  ログイン
                </button>
              </div>
            )}
            {mode === "forgotPassword" && (
              <button
                onClick={() => setMode("login")}
                className="text-indigo-600 hover:text-indigo-500"
              >
                ログインに戻る
              </button>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 