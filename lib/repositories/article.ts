import { prisma } from '@/lib/prisma'
import type { Article, Bookmark, Tag } from '@prisma/client'

export type ArticleWithRelations = Article & {
  tags: Tag[];
  bookmarks?: Bookmark[];
  author: {
    id: string;
    name: string | null;
  };
};

export class ArticleRepository {
  static async findBySlug(slug: string, userId?: string | null): Promise<ArticleWithRelations | null> {
    return prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
        bookmarks: userId ? {
          where: { userId }
        } : false,
      },
    });
  }

  static async findMany(options?: {
    tag?: string;
    authorId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ArticleWithRelations[]> {
    return prisma.article.findMany({
      where: {
        ...(options?.tag && {
          tags: {
            some: { name: options.tag }
          }
        }),
        ...(options?.authorId && { authorId: options.authorId }),
        ...(options?.status && { status: options.status }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
      },
      take: options?.limit,
      skip: options?.offset,
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async create(data: {
    slug: string;
    title: string;
    content: string;
    authorId: string;
    tags: string[];
    status?: string;
  }): Promise<ArticleWithRelations> {
    const { tags: tagNames, ...articleData } = data;

    return prisma.article.create({
      data: {
        ...articleData,
        tags: {
          connectOrCreate: tagNames.map(name => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
      },
    });
  }

  static async update(slug: string, data: {
    title?: string;
    content?: string;
    tags?: string[];
    status?: string;
  }): Promise<ArticleWithRelations> {
    const { tags: tagNames, ...updateData } = data;

    return prisma.article.update({
      where: { slug },
      data: {
        ...updateData,
        ...(tagNames && {
          tags: {
            set: [],
            connectOrCreate: tagNames.map(name => ({
              where: { name },
              create: { name },
            })),
          },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
      },
    });
  }

  static async delete(slug: string): Promise<void> {
    await prisma.article.delete({
      where: { slug },
    });
  }
} 