import { cookies } from 'next/headers'
import { adminAuth } from '@/lib/firebase-admin'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import BookmarkButton from '@/components/BookmarkButton'

export default async function BookmarksPage() {
  let userId = null
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value
    if (sessionCookie) {
      const decodedToken = await adminAuth.verifySessionCookie(sessionCookie)
      userId = decodedToken.uid
    }
  } catch (error) {
    console.error('Error verifying session:', error)
  }

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">ブックマーク一覧</h1>
          <p>ブックマーク一覧を表示するにはログインが必要です。</p>
        </div>
      </div>
    )
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    include: {
      article: {
        include: {
          tags: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">ブックマーク一覧</h1>
      
      {bookmarks.length === 0 ? (
        <p className="text-center text-gray-500">
          ブックマークした記事はありません。
        </p>
      ) : (
        <div className="space-y-6">
          {bookmarks.map(bookmark => (
            <div
              key={bookmark.id}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    href={`/wiki/${bookmark.article.slug}`}
                    className="text-xl font-medium hover:text-blue-600"
                  >
                    {bookmark.article.title}
                  </Link>
                  
                  <div className="flex gap-2 mt-2">
                    {bookmark.article.tags.map(tag => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 bg-gray-100 text-sm rounded-md"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
                
                <BookmarkButton
                  slug={bookmark.article.slug}
                  initialIsBookmarked={true}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 