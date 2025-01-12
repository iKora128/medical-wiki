import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyUser } from "@/lib/auth"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { app } from "@/lib/firebase"

export async function POST(request: Request) {
  try {
    const user = await verifyUser(request)
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("avatar") as File
    if (!file) {
      return NextResponse.json({ error: "画像ファイルが必要です" }, { status: 400 })
    }

    // Firebase Storageにアップロード
    const storage = getStorage(app)
    const fileRef = ref(storage, `avatars/${user.uid}/${file.name}`)
    const buffer = await file.arrayBuffer()
    await uploadBytes(fileRef, buffer)
    const avatarUrl = await getDownloadURL(fileRef)

    // プロフィールを更新
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: user.uid },
      update: { avatarUrl },
      create: {
        userId: user.uid,
        avatarUrl,
      }
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("アバターアップロードエラー:", error)
    return NextResponse.json({ error: "アバターの更新に失敗しました" }, { status: 500 })
  }
} 