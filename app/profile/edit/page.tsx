"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import AuthModal from "@/components/common/AuthModal"

interface Profile {
  id: string
  name: string | null
  bio: string | null
  specialty: string | null
  occupation: string | null
  website: string | null
}

export default function EditProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/profile")
      const data = await response.json()

      if (response.ok) {
        setProfile(data.data.profile)
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      setError("プロフィールの取得に失敗しました")
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile()
    }
  }, [isAuthenticated, fetchProfile])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      bio: formData.get("bio") as string,
      specialty: formData.get("specialty") as string,
      occupation: formData.get("occupation") as string,
      website: formData.get("website") as string,
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push("/profile")
      } else {
        const responseData = await response.json()
        setError(responseData.message || "プロフィールの更新に失敗しました")
      }
    } catch (error) {
      setError("プロフィールの更新に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            プロフィールを編集するにはログインが必要です。
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">プロフィール編集</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              名前
            </label>
            <Input
              id="name"
              name="name"
              defaultValue={profile?.name || ""}
              placeholder="あなたの名前"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              自己紹介
            </label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profile?.bio || ""}
              placeholder="あなたについて教えてください"
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="specialty" className="block text-sm font-medium mb-2">
              専門分野
            </label>
            <Input
              id="specialty"
              name="specialty"
              defaultValue={profile?.specialty || ""}
              placeholder="例: 内科、外科、小児科など"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="occupation" className="block text-sm font-medium mb-2">
              職業
            </label>
            <Input
              id="occupation"
              name="occupation"
              defaultValue={profile?.occupation || ""}
              placeholder="例: 医師、看護師、研修医など"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium mb-2">
              ウェブサイト
            </label>
            <Input
              id="website"
              name="website"
              type="url"
              defaultValue={profile?.website || ""}
              placeholder="https://example.com"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "更新中..." : "プロフィールを更新"}
            </Button>
          </div>
        </form>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          title="ログインが必要です"
          message="プロフィールを編集するにはログインが必要です。"
        />
      </div>
    </div>
  )
} 