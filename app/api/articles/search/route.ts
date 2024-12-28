import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || []
    const status = searchParams.get("status") || "published"

    const articles = await prisma.article.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } },
            ],
          },
          { status },
          tags.length > 0
            ? { tags: { some: { name: { in: tags } } } }
            : {},
        ],
      },
      include: {
        tags: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(articles)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to search articles" },
      { status: 500 }
    )
  }
} 