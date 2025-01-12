"use client";

import { TableOfContents } from "@/components/TableOfContents";
import BookmarkButton from "@/components/BookmarkButton";

interface ArticleViewProps {
  article: {
    slug: string;
    title: string;
    content: string;
    tags: Array<{
      id: string;
      name: string;
    }>;
  };
  isBookmarked: boolean;
}

export default function ArticleView({ article, isBookmarked }: ArticleViewProps) {
  return (
    <article className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">{article.title}</h1>

      <div className="flex gap-2 mb-6">
        <BookmarkButton
          slug={article.slug}
          initialIsBookmarked={isBookmarked}
        />
      </div>

      <div className="flex gap-2 mb-4">
        {article.tags.map((tag) => (
          <span
            key={tag.id}
            className="px-2 py-1 bg-gray-100 text-sm rounded-md"
          >
            {tag.name}
          </span>
        ))}
      </div>

      <div className="prose max-w-none">{article.content}</div>

      <TableOfContents />
    </article>
  );
} 