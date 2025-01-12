import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyRole } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    // ADMIN権限を要求
    await verifyRole(authHeader.split("Bearer ")[1], "ADMIN")

    // URLパラメータの取得
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const order = searchParams.get("order") || "desc"
    const role = searchParams.get("role")

    // 検索条件の構築
    const where = {
      AND: [
        {
          OR: [
            { email: { contains: search } },
            { name: { contains: search } },
          ],
        },
        role ? { role } : {},
      ],
    }

    // 総件数の取得
    const total = await prisma.user.count({ where })

    // ユーザー一覧の取得
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        [sortBy]: order,
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "ユーザー一覧の取得に失敗しました" },
      { status: 500 }
    )
  }
}

// バルク更新用のエンドポイント
export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    // ADMIN権限を要求
    await verifyRole(authHeader.split("Bearer ")[1], "ADMIN")

    const { userIds, role } = await request.json()
    if (!userIds || !Array.isArray(userIds) || !role) {
      return NextResponse.json(
        { error: "無効なリクエストです" },
        { status: 400 }
      )
    }

    // バルク更新の実行
    await prisma.user.updateMany({
      where: {
        id: {
          in: userIds,
        },
      },
      data: {
        role,
      },
    })

    return NextResponse.json({ message: "更新が完了しました" })
  } catch (error) {
    console.error("Error updating users:", error)
    return NextResponse.json(
      { error: "ユーザーの更新に失敗しました" },
      { status: 500 }
    )
  }
} 