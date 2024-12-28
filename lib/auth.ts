import { adminAuth } from "./firebase-admin"

export async function verifyAdminToken(token: string) {
  try {
    const decodedToken = await adminAuth().verifyIdToken(token)
    if (!decodedToken.admin) {
      throw new Error("管理者権限が必要です")
    }
    return decodedToken
  } catch (error) {
    throw error
  }
} 