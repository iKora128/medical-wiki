"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { getAuth, onAuthStateChanged, signOut, User, UserCredential, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { app } from "@/lib/firebase"

export type AuthContextType = {
  user: User | null
  loading: boolean
  getIdToken: () => Promise<string | null>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<UserCredential>
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>
  signUpWithEmail: (email: string, password: string) => Promise<UserCredential>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  getIdToken: async () => null,
  signOut: async () => {},
  signInWithGoogle: async () => {
    throw new Error('Not implemented')
  },
  signInWithEmail: async () => {
    throw new Error('Not implemented')
  },
  signUpWithEmail: async () => {
    throw new Error('Not implemented')
  },
  resetPassword: async () => {
    throw new Error('Not implemented')
  },
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authInitialized, setAuthInitialized] = useState(false)
  const auth = getAuth(app)

  useEffect(() => {
    const auth = getAuth(app)
    
    // Firebase Auth の初期化を待つ
    const waitForAuth = async () => {
      return new Promise<void>((resolve) => {
        const unsubscribe = auth.onAuthStateChanged(() => {
          unsubscribe()
          resolve()
        })
      })
    }

    // 初期化処理
    const initializeAuth = async () => {
      await waitForAuth()
      setAuthInitialized(true)
    }

    initializeAuth()
  }, [])

  useEffect(() => {
    if (!authInitialized) return

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth, authInitialized])

  const getIdToken = async () => {
    try {
      return user ? await user.getIdToken(true) : null
    } catch (error) {
      console.error("Error getting ID token:", error)
      return null
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const value = {
    user,
    loading: loading || !authInitialized,
    getIdToken,
    signOut: handleSignOut,
    signInWithGoogle: () => {
      const provider = new GoogleAuthProvider()
      return signInWithPopup(auth, provider)
    },
    signInWithEmail: (email: string, password: string) => {
      return signInWithEmailAndPassword(auth, email, password)
    },
    signUpWithEmail: (email: string, password: string) => {
      return createUserWithEmailAndPassword(auth, email, password)
    },
    resetPassword: (email: string) => {
      return sendPasswordResetEmail(auth, email)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

