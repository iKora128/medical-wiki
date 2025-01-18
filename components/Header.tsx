"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import AuthModal from "@/components/common/AuthModal"

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <>
      <header className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl font-bold">
                Medical Wiki
              </Link>
              <nav className="flex items-center gap-4">
                <Link href="/search" className="text-gray-600 hover:text-gray-900">
                  記事検索
                </Link>
                <Link href="/quiz" className="text-gray-600 hover:text-gray-900">
                  クイズ
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  {user?.role === "ADMIN" && (
                    <Link href="/admin">
                      <Button variant="outline">管理画面</Button>
                    </Link>
                  )}
                  <Button variant="ghost" onClick={logout}>
                    ログアウト
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setShowAuthModal(true)}>
                  ログイン
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}

