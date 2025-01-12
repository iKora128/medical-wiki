import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyRole, setUserRole } from "@/lib/auth"
import type { UserRole } from "@/lib/auth"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    // ADMIN権限を要求
    await verifyRole(authHeader.split("Bearer ")[1], "ADMIN")

    const { role } = await request.json()
    if (!role) {
      return NextResponse.json(
        { error: "権限の指定が必要です" },
        { status: 400 }
      )
    }

    // ユーザーの存在確認
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      )
    }

    // Firebaseのカスタムクレームを更新
    await setUserRole(params.id, role as UserRole)

    // DBのユーザー情報を更新
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json(
      { error: "権限の更新に失敗しました" },
      { status: 500 }
    )
  }
} 