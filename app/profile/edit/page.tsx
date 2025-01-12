"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import Image from "next/image"

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

export default function EditProfile() {
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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
      if (data.avatarUrl) setPreviewUrl(data.avatarUrl)
    } catch (error) {
      setError("プロフィールの取得に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      
      // プロフィール情報を更新
      const profileData = {
        bio: formData.get("bio"),
        specialty: formData.get("specialty"),
        occupation: formData.get("occupation"),
        website: formData.get("website"),
      }

      const profileResponse = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      })

      if (!profileResponse.ok) throw new Error("プロフィールの更新に失敗しました")

      // アバター画像をアップロード
      if (avatarFile) {
        const avatarFormData = new FormData()
        avatarFormData.append("avatar", avatarFile)

        const avatarResponse = await fetch("/api/profile/avatar", {
          method: "POST",
          body: avatarFormData,
        })

        if (!avatarResponse.ok) throw new Error("アバターの更新に失敗しました")
      }

      router.push("/profile")
    } catch (error) {
      setError("プロフィールの更新に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  if (isLoading) return <div>読み込み中...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!profile) return null

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">プロフィール編集</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* アバター画像 */}
        <div>
          <label className="block text-sm font-medium mb-2">プロフィール画像</label>
          <div className="flex items-center gap-4">
            {previewUrl && (
              <Image
                src={previewUrl}
                alt="プロフィール画像"
                width={100}
                height={100}
                className="rounded-full object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="text-sm"
            />
          </div>
        </div>

        {/* 基本情報 */}
        <div>
          <label className="block text-sm font-medium mb-2">メールアドレス</label>
          <input
            type="email"
            value={profile.user.email}
            disabled
            className="w-full p-2 border rounded bg-gray-50"
          />
        </div>

        {/* 自己紹介 */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-2">自己紹介</label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            defaultValue={profile.bio || ""}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* 専門分野 */}
        <div>
          <label htmlFor="specialty" className="block text-sm font-medium mb-2">専門分野</label>
          <input
            type="text"
            id="specialty"
            name="specialty"
            defaultValue={profile.specialty || ""}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* 職業 */}
        <div>
          <label htmlFor="occupation" className="block text-sm font-medium mb-2">職業</label>
          <input
            type="text"
            id="occupation"
            name="occupation"
            defaultValue={profile.occupation || ""}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* ウェブサイト */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium mb-2">ウェブサイト</label>
          <input
            type="url"
            id="website"
            name="website"
            defaultValue={profile.website || ""}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "更新中..." : "更新する"}
          </button>
        </div>
      </form>
    </div>
  )
} 