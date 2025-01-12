"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import Image from "next/image"
import Link from "next/link"

type Profile = {
  id: string
  userId: string
  avatarUrl: string | null
  bio: string | null
  specialty: string | null
  occupation: string | null
  website: string | null
  user: {
    name: string | null
    email: string
    role: string
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchProfile()
  }, [user, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      if (!response.ok) throw new Error("プロフィールの取得に失敗しました")
      const data = await response.json()
      setProfile(data)
    } catch (error) {
      setError("プロフィールの取得に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div>読み込み中...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!profile) return null

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">プロフィール</h1>
        <Link
          href="/profile/edit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          編集
        </Link>
      </div>

      <div className="space-y-6">
        {/* プロフィール画像 */}
        <div className="flex items-center gap-4">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt="プロフィール画像"
              width={100}
              height={100}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{profile.user.name || "名前未設定"}</h2>
            <p className="text-gray-600">{profile.user.email}</p>
          </div>
        </div>

        {/* 自己紹介 */}
        {profile.bio && (
          <div>
            <h3 className="text-lg font-medium mb-2">自己紹介</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* 専門分野 */}
        {profile.specialty && (
          <div>
            <h3 className="text-lg font-medium mb-2">専門分野</h3>
            <p className="text-gray-700">{profile.specialty}</p>
          </div>
        )}

        {/* 職業 */}
        {profile.occupation && (
          <div>
            <h3 className="text-lg font-medium mb-2">職業</h3>
            <p className="text-gray-700">{profile.occupation}</p>
          </div>
        )}

        {/* ウェブサイト */}
        {profile.website && (
          <div>
            <h3 className="text-lg font-medium mb-2">ウェブサイト</h3>
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {profile.website}
            </a>
          </div>
        )}
      </div>
    </div>
  )
} 