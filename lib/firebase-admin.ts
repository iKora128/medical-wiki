import { getApps, initializeApp, cert } from "firebase-admin/app"

export const initAdmin = () => {
  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
    )

    initializeApp({
      credential: cert(serviceAccount),
    })
  }
} 