import { adminAuth } from './firebase-admin'
import { NextResponse } from 'next/server'

export type AuthUser = {
  uid: string
  email: string | null
  role: string
}

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const

export type UserRole = typeof ROLES[keyof typeof ROLES]

export async function verifyAuth(requestOrCookie: Request | string | undefined): Promise<AuthUser> {
  try {
    let token: string | undefined

    if (requestOrCookie instanceof Request) {
      token = requestOrCookie.headers.get("Authorization")?.split("Bearer ")[1]
    } else {
      token = requestOrCookie
    }

    if (!token) {
      throw new AuthError('認証が必要です')
    }

    const decodedToken = await adminAuth.verifySessionCookie(token)
    const user = await adminAuth.getUser(decodedToken.uid)

    return {
      uid: user.uid,
      email: user.email || null,
      role: user.customClaims?.role || ROLES.USER,
    }
  } catch (error) {
    console.error('Error verifying auth:', error)
    throw new AuthError('認証に失敗しました')
  }
}

export function verifyRole(user: AuthUser, requiredRole: UserRole): void {
  if (requiredRole === ROLES.USER) return
  if (user.role !== requiredRole) {
    throw new AuthError('権限がありません', 403, 'FORBIDDEN')
  }
}

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
    public code: string = 'UNAUTHORIZED'
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export function handleAuthError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json(
      {
        message: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    )
  }
  throw error
} 