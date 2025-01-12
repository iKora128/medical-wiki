import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-response"
import { withErrorHandling } from "@/lib/api-middleware"
import { z } from 'zod'

const questionSchema = z.object({
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()).optional(),
})

export const POST = withErrorHandling(async (request: Request) => {
  const user = await verifyAuth(request)
  const body = await request.json()
  const { title, content, tags = [] } = questionSchema.parse(body)

  const question = await prisma.question.create({
    data: {
      title,
      content,
      userId: user.uid,
      tags: {
        connectOrCreate: tags.map(tag => ({
          where: { name: tag },
          create: { name: tag },
        })),
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      tags: true,
    },
  })

  return successResponse(question, "質問を作成しました")
})

export const GET = withErrorHandling(async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const tag = searchParams.get('tag')
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const skip = (page - 1) * limit

  const where = {
    ...(tag && {
      tags: {
        some: {
          name: tag,
        },
      },
    }),
    ...(status && { status }),
  }

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        tags: true,
        _count: {
          select: {
            answers: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.question.count({ where }),
  ])

  return successResponse({
    questions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}) 