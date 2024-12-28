import { getApps, initializeApp, cert, getApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

export const initAdmin = () => {
  if (getApps().length > 0) {
    return getApp()
  }

  if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error('Firebase Admin credentials are missing')
  }

  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }

  return initializeApp({
    credential: cert(serviceAccount),
  })
}

export const adminAuth = () => {
  const app = initAdmin()
  return getAuth(app)
} 