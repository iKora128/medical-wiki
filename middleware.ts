import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// 認証が必要なパスのパターン
const PROTECTED_PATHS = [
  '/api/articles/:path*',
  '/api/bookmarks/:path*',
  '/api/profile/:path*',
  '/api/comments/:path*',
]

// 管理者権限が必要なパスのパターン
const ADMIN_PATHS = [
  '/api/admin/:path*',
]

// パスがパターンにマッチするかチェック
function matchesPattern(path: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/:path/g, '[^/]+')
    return new RegExp(`^${regexPattern}$`).test(path)
  })
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 認証が必要なパスかチェック
  const requiresAuth = matchesPattern(path, [...PROTECTED_PATHS, ...ADMIN_PATHS])
  if (!requiresAuth) {
    return NextResponse.next()
  }

  // Bearerトークンの存在チェック
  const token = request.headers.get('Authorization')?.split('Bearer ')[1]
  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: '認証が必要です',
        code: 'UNAUTHORIZED'
      },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
} 