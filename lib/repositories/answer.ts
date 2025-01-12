import { prisma } from '@/lib/prisma'
import type { Answer } from '@prisma/client'

export type AnswerWithUser = Answer & {
  user: {
    name: string | null;
    email: string;
  };
};

export class AnswerRepository {
  static async findById(id: string): Promise<AnswerWithUser | null> {
    return prisma.answer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })
  }

  static async create(data: {
    content: string;
    userId: string;
    questionId: string;
  }): Promise<AnswerWithUser> {
    return prisma.answer.create({
      data,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })
  }

  static async update(id: string, data: {
    content?: string;
    isAccepted?: boolean;
  }): Promise<AnswerWithUser> {
    return prisma.answer.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })
  }

  static async delete(id: string): Promise<void> {
    await prisma.answer.delete({
      where: { id },
    })
  }

  static async acceptAnswer(answerId: string, questionId: string): Promise<void> {
    await prisma.$transaction([
      // 他の回答のisAcceptedをfalseに設定
      prisma.answer.updateMany({
        where: { 
          questionId,
          NOT: { id: answerId }
        },
        data: { isAccepted: false },
      }),
      // 指定された回答をベストアンサーに設定
      prisma.answer.update({
        where: { id: answerId },
        data: { isAccepted: true },
      }),
      // 質問のステータスを更新
      prisma.question.update({
        where: { id: questionId },
        data: { status: 'CLOSED' },
      }),
    ])
  }
} 