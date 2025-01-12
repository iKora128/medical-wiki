import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyUser } from "@/lib/auth"

// プロフィール取得
export async function GET(request: Request) {
  try {
    const user = await verifyUser(request)
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.uid },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          }
        }
      }
    })

    if (!profile) {
      // プロフィールが存在しない場合は新規作成
      const newProfile = await prisma.profile.create({
        data: {
          userId: user.uid,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true,
            }
          }
        }
      })
      return NextResponse.json(newProfile)
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("プロフィール取得エラー:", error)
    return NextResponse.json({ error: "プロフィールの取得に失敗しました" }, { status: 500 })
  }
}

// プロフィール更新
export async function PUT(request: Request) {
  try {
    const user = await verifyUser(request)
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const data = await request.json()
    const { bio, specialty, occupation, website } = data

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: user.uid },
      update: {
        bio,
        specialty,
        occupation,
        website,
      },
      create: {
        userId: user.uid,
        bio,
        specialty,
        occupation,
        website,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          }
        }
      }
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("プロフィール更新エラー:", error)
    return NextResponse.json({ error: "プロフィールの更新に失敗しました" }, { status: 500 })
  }
} 