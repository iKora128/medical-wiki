import { prisma } from '@/lib/prisma'
import { admin, adminAuth } from '@/lib/firebase-admin'

export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export type UserRole = keyof typeof ROLES;

export async function verifyUser(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1]
    if (!token) return null

    const decodedToken = await adminAuth.verifyIdToken(token)
    return decodedToken
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

export async function verifyRole(idToken: string, requiredRole: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.uid }
    })
    
    if (!user || user.role !== requiredRole) {
      throw new Error('権限がありません')
    }
    
    return user
  } catch (error) {
    throw new Error('認証に失敗しました')
  }
}

export async function setUserRole(uid: string, role: UserRole) {
  try {
    await adminAuth.setCustomUserClaims(uid, { role })
    return true
  } catch (error) {
    console.error("Role setting error:", error)
    return false
  }
} 