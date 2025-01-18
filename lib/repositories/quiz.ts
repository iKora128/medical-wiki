import { prisma } from "@/lib/prisma"

export const QuizRepository = {
  async create(data: {
    question: string
    options: string[]
    answer: string
    explanation: string
  }) {
    return await prisma.quiz.create({
      data: {
        ...data,
        isActive: false,
      },
    })
  },

  async createMany(data: {
    question: string
    options: string[]
    answer: string
    explanation: string
  }[]) {
    return await prisma.quiz.createMany({
      data: data.map((quiz) => ({
        ...quiz,
        isActive: false,
      })),
    })
  },

  async getActiveQuiz() {
    // 今日の日付の0時0分0秒を取得
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 最後に表示されたクイズを取得
    const lastShownQuiz = await prisma.quiz.findFirst({
      orderBy: {
        lastShown: 'desc'
      }
    })

    // 最後に表示されたクイズが今日のものであれば、それを返す
    if (lastShownQuiz && lastShownQuiz.lastShown && lastShownQuiz.lastShown >= today) {
      return lastShownQuiz
    }

    // ランダムなクイズを1つ取得
    const randomQuiz = await prisma.quiz.findFirst({
      orderBy: {
        lastShown: 'asc'
      }
    })

    if (!randomQuiz) {
      return null
    }

    // クイズを更新して返す
    return await prisma.quiz.update({
      where: {
        id: randomQuiz.id
      },
      data: {
        lastShown: new Date()
      }
    })
  }
} 