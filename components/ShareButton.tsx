"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Dialog } from "@headlessui/react"
import { FiShare } from "react-icons/fi"
import { FaTwitter, FaFacebook, FaLine } from "react-icons/fa"

interface ShareButtonProps {
  slug: string
  title: string
}

export default function ShareButton({ slug, title }: ShareButtonProps) {
  const { user } = useAuth()
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${slug}`
  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(articleUrl)

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`
  }

  const handleShare = async (platform: string) => {
    // 共有を記録
    if (user) {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/articles/${slug}/share`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await user.getIdToken()}`
          },
          body: JSON.stringify({ platform })
        })

        if (!response.ok) {
          throw new Error("共有の記録に失敗しました")
        }
      } catch (error) {
        console.error("共有記録エラー:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // 共有用ウィンドウを開く
    window.open(shareUrls[platform as keyof typeof shareUrls], "_blank")
    setIsShareModalOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsShareModalOpen(true)}
        className="flex items-center gap-1 px-3 py-1 text-sm rounded-full border hover:bg-gray-100 transition-colors"
        title="共有する"
      >
        <FiShare />
        <span>共有</span>
      </button>

      <Dialog
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              共有する
            </Dialog.Title>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleShare("twitter")}
                disabled={isLoading}
                className="p-3 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="Twitterで共有"
              >
                <FaTwitter className="text-[#1DA1F2] text-2xl" />
              </button>
              <button
                onClick={() => handleShare("facebook")}
                disabled={isLoading}
                className="p-3 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="Facebookで共有"
              >
                <FaFacebook className="text-[#1877F2] text-2xl" />
              </button>
              <button
                onClick={() => handleShare("line")}
                disabled={isLoading}
                className="p-3 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="LINEで共有"
              >
                <FaLine className="text-[#00B900] text-2xl" />
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
} 