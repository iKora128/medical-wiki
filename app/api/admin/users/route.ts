import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, verifyRole, handleAuthError, ROLES } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-response"
import { z } from "zod"

const userQuerySchema = z.object({
  email: z.string().optional(),
  role: z.enum([ROLES.ADMIN, ROLES.USER]).optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})

export async function GET(request: Request) {
  try {
    const user = await verifyAuth(request)
    await verifyRole(user, ROLES.ADMIN)

    const { searchParams } = new URL(request.url)
    const query = userQuerySchema.parse(Object.fromEntries(searchParams))

    const where = {
      ...(query.email && { email: { contains: query.email } }),
      ...(query.role && { role: query.role }),
    }

    const page = query.page || 1
    const limit = query.limit || 10
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ])

    return successResponse({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}

const userCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum([ROLES.ADMIN, ROLES.USER]).default(ROLES.USER),
})

export async function POST(request: Request) {
  try {
    const user = await verifyAuth(request)
    await verifyRole(user, ROLES.ADMIN)

    const body = await request.json()
    const data = userCreateSchema.parse(body)

    const newUser = await prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return successResponse(newUser, 'ユーザーを作成しました')
  } catch (error) {
    return handleAuthError(error)
  }
} 