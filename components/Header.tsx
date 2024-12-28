"use client"

import Link from "next/link"
import { useState } from "react"
import { useAuth } from "../contexts/AuthContext";
import { Login } from "./Login";

export function Header() {
  const { user, auth } = useAuth();
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-white">医療Wiki</span>
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <Link href="/" className="text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              ホーム
            </Link>
            <Link href="/random" className="text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              ランダム記事
            </Link>
            <Link href="/contact" className="text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              お問い合わせ
            </Link>
            {user ? (
              <>
                <Link href="/user" className="text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  マイページ
                </Link>
                <button
                  onClick={() => auth?.signOut()}
                  className="text-white hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  disabled={!auth}
                >
                  ログアウト
                </button>
              </>
            ) : (
              <Login />
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">メニューを開く</span>
              {isOpen ? (
                <svg 
                  className="block h-6 w-6" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg 
                  className="block h-6 w-6" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link href="/" className="text-white hover:bg-blue-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
            ホーム
          </Link>
          <Link href="/random" className="text-white hover:bg-blue-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
            ランダム記事
          </Link>
          <Link href="/contact" className="text-white hover:bg-blue-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
            お問い合わせ
          </Link>
        </div>
      </div>
    </header>
  )
}

