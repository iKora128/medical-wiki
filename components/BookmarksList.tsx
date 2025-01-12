"use client"

import { Bookmark } from '@prisma/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BookmarkButton from './BookmarkButton'
import { Button } from './ui/button'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface BookmarksListProps {
  bookmarks: (Bookmark & {
    article: {
      slug: string
      title: string
      tags: { id: string; name: string }[]
      author: { name: string | null }
      createdAt: Date
    }
  })[]
  total: number
  currentPage: number
  limit: number
}

const BookmarksList = ({
  bookmarks,
  total,
  currentPage,
  limit
}: BookmarksListProps) => {
  const router = useRouter()
  const totalPages = Math.ceil(total / limit)

  const handlePageChange = (page: number) => {
    router.push(`/bookmarks?page=${page}`)
  }

  if (bookmarks.length === 0) {
    return (
      <p className="text-center text-gray-500">
        ブックマークした記事はありません。
      </p>
    )
  }

  return (
    <div>
      <div className="space-y-6">
        {bookmarks.map(bookmark => (
          <div
            key={bookmark.id}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <Link
                  href={`/wiki/${bookmark.article.slug}`}
                  className="text-xl font-medium hover:text-blue-600"
                >
                  {bookmark.article.title}
                </Link>

                <div className="mt-2 text-sm text-gray-600">
                  <span>作成者: {bookmark.article.author.name || '不明'}</span>
                  <span className="mx-2">•</span>
                  <span>
                    作成日: {format(bookmark.article.createdAt, 'yyyy年MM月dd日', { locale: ja })}
                  </span>
                </div>

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

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            前へ
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  )
}

export default BookmarksList 