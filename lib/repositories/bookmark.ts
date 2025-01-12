import { prisma } from '@/lib/prisma'
import type { Bookmark } from '@prisma/client'

export type BookmarkWithArticle = Bookmark & {
  article: {
    slug: string;
    title: string;
    tags: Array<{
      id: string;
      name: string;
    }>;
  };
};

export class BookmarkRepository {
  static async findByUser(userId: string): Promise<BookmarkWithArticle[]> {
    return prisma.bookmark.findMany({
      where: { userId },
      include: {
        article: {
          include: {
            tags: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async create(userId: string, articleId: string): Promise<Bookmark> {
    return prisma.bookmark.create({
      data: {
        userId,
        articleId,
      },
    });
  }

  static async delete(userId: string, articleId: string): Promise<void> {
    await prisma.bookmark.delete({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });
  }

  static async exists(userId: string, articleId: string): Promise<boolean> {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });
    return !!bookmark;
  }
} 