import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils/slug'
import { Prisma } from '@prisma/client'
import type { Article, Tag } from '@prisma/client'

export type ArticleWithRelations = Article & {
  tags: Tag[]
  author: {
    name: string | null
  } | null
  _count?: {
    bookmarks: number
  }
}

export class ArticleRepository {
  static async findBySlug(slug: string, userId?: string | null): Promise<ArticleWithRelations | null> {
    return prisma.article.findUnique({
      where: { slug },
      include: {
        tags: true,
        author: {
          select: {
            name: true
          }
        },
        ...(userId && {
          bookmarks: {
            where: { userId }
          }
        })
      }
    })
  }

  static async findMany(params: {
    tag?: string
    authorId?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<{ articles: ArticleWithRelations[]; total: number }> {
    const { tag, authorId, status, page = 1, limit = 10 } = params
    const skip = (page - 1) * limit

    const where: Prisma.ArticleWhereInput = {
      ...(tag && {
        tags: {
          some: { name: tag }
        }
      }),
      ...(authorId && { authorId }),
      ...(status && { status })
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          tags: true,
          author: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.article.count({ where })
    ])

    return { articles, total }
  }

  static async create(data: {
    title: string
    content: string
    slug?: string
    status: string
    authorId?: string | null
    tags: string[]
  }): Promise<ArticleWithRelations> {
    const slug = data.slug || generateSlug(data.title)

    return prisma.article.create({
      data: {
        title: data.title,
        content: data.content,
        slug,
        status: data.status,
        authorId: data.authorId || null,
        tags: {
          connectOrCreate: data.tags.map(name => ({
            where: { name },
            create: { name }
          }))
        }
      },
      include: {
        tags: true,
        author: {
          select: {
            name: true
          }
        }
      }
    })
  }

  static async update(slug: string, data: {
    title?: string
    content?: string
    status?: string
    tags?: string[]
  }): Promise<ArticleWithRelations> {
    const { tags, ...rest } = data

    return prisma.article.update({
      where: { slug },
      data: {
        ...rest,
        ...(tags && {
          tags: {
            set: [],
            connectOrCreate: tags.map(name => ({
              where: { name },
              create: { name }
            }))
          }
        })
      },
      include: {
        tags: true,
        author: {
          select: {
            name: true
          }
        }
      }
    })
  }

  static async delete(slug: string): Promise<void> {
    await prisma.article.delete({
      where: { slug }
    })
  }
} 