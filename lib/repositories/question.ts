import { prisma } from '@/lib/prisma'
import type { Question, Answer } from '@prisma/client'

export type QuestionWithRelations = Question & {
  user: {
    name: string | null;
    email: string;
  };
  answers?: (Answer & {
    user: {
      name: string | null;
      email: string;
    };
  })[];
  tags: {
    id: string;
    name: string;
  }[];
  _count?: {
    answers: number;
  };
};

export interface QuestionQueryOptions {
  tag?: string;
  status?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export class QuestionRepository {
  static async findById(id: string): Promise<QuestionWithRelations | null> {
    return prisma.question.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        answers: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: [
            { isAccepted: 'desc' },
            { createdAt: 'desc' },
          ],
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  static async findMany(options: QuestionQueryOptions = {}): Promise<{
    questions: QuestionWithRelations[];
    total: number;
  }> {
    const {
      tag,
      status,
      userId,
      page = 1,
      limit = 10,
    } = options

    const where = {
      ...(tag && {
        tags: {
          some: {
            name: tag,
          },
        },
      }),
      ...(status && { status }),
      ...(userId && { userId }),
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
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              answers: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.question.count({ where }),
    ])

    return { questions, total }
  }

  static async create(data: {
    title: string;
    content: string;
    userId: string;
    tags?: string[];
  }): Promise<QuestionWithRelations> {
    const { title, content, userId, tags = [] } = data

    return prisma.question.create({
      data: {
        title,
        content,
        userId,
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
  }

  static async update(id: string, data: {
    title?: string;
    content?: string;
    status?: string;
  }): Promise<QuestionWithRelations> {
    return prisma.question.update({
      where: { id },
      data,
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
  }

  static async delete(id: string): Promise<void> {
    await prisma.question.delete({
      where: { id },
    })
  }
} 