"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

export default function Header() {
  const { user } = useAuth()

  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">Medical Wiki</span>
            </Link>
          </div>

          <div className="flex items-center">
            {user ? (
              <>
                <Link href="/questions" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                  質問一覧
                </Link>
                <Link href="/questions/new" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                  質問する
                </Link>
                <Link href="/profile" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                  プロフィール
                </Link>
                <Link href="/favorites" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                  お気に入り
                </Link>
              </>
            ) : (
              <Link href="/login" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                ログイン
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

