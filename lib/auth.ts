import { prisma } from '@/lib/prisma'
import { admin, adminAuth } from '@/lib/firebase-admin'
import { NextResponse } from 'next/server'

export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export type UserRole = keyof typeof ROLES;

export type AuthUser = {
  uid: string;
  email: string;
  role: UserRole;
};

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
    public code: string = 'UNAUTHORIZED'
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function verifyAuth(request: Request): Promise<AuthUser> {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1]
    if (!token) {
      throw new AuthError('認証が必要です');
    }

    const decodedToken = await adminAuth.verifyIdToken(token)
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid }
    })

    if (!user) {
      throw new AuthError('ユーザーが見つかりません', 404, 'USER_NOT_FOUND');
    }

    return {
      uid: user.id,
      email: user.email,
      role: user.role as UserRole,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error("認証エラー:", error)
    throw new AuthError('認証に失敗しました');
  }
}

export async function verifyRole(user: AuthUser, requiredRole: UserRole): Promise<void> {
  if (user.role !== requiredRole) {
    throw new AuthError('権限がありません', 403, 'FORBIDDEN');
  }
}

export async function setUserRole(uid: string, role: UserRole): Promise<boolean> {
  try {
    await Promise.all([
      adminAuth.setCustomUserClaims(uid, { role }),
      prisma.user.update({
        where: { id: uid },
        data: { role }
      })
    ]);
    return true;
  } catch (error) {
    console.error("ロール設定エラー:", error);
    return false;
  }
}

export function handleAuthError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  console.error('予期せぬエラー:', error);
  return NextResponse.json(
    {
      success: false,
      message: '予期せぬエラーが発生しました',
      code: 'INTERNAL_SERVER_ERROR',
    },
    { status: 500 }
  );
} 