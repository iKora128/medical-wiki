"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "./ui/button"

export default function Header() {
  const { user, isAuthenticated, login, logout } = useAuth()

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Medical Wiki
            </Link>
            <nav className="ml-8">
              <div className="flex space-x-4">
                <Link
                  href="/articles"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2"
                >
                  記事一覧
                </Link>
                <Link
                  href="/questions"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2"
                >
                  質問一覧
                </Link>
                {isAuthenticated && (
                  <Link
                    href="/bookmarks"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2"
                  >
                    ブックマーク
                  </Link>
                )}
              </div>
            </nav>
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-gray-900"
                >
                  {user?.name || "プロフィール"}
                </Link>
                <Button variant="outline" onClick={logout}>
                  ログアウト
                </Button>
              </div>
            ) : (
              <Button onClick={login}>ログイン</Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

