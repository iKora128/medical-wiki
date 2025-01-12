import { verifyAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import BookmarksList from '../../components/BookmarksList'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value
    const user = await verifyAuth(sessionCookie)
    if (!user) {
      redirect('/login')
    }

    const page = Number(searchParams.page) || 1
    const limit = 10
    const skip = (page - 1) * limit

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId: user.uid },
        include: {
          article: {
            include: {
              tags: true,
              author: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.bookmark.count({
        where: { userId: user.uid }
      })
    ])

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">ブックマーク一覧</h1>
        <BookmarksList
          bookmarks={bookmarks}
          total={total}
          currentPage={page}
          limit={limit}
        />
      </div>
    )
  } catch (error) {
    console.error('Error in BookmarksPage:', error)
    redirect('/login')
  }
} 