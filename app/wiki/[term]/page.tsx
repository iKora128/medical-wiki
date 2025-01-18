import { Metadata } from "next";
import { notFound } from "next/navigation";
import { TableOfContents } from "@/components/TableOfContents";
import BookmarkButton from "@/components/BookmarkButton";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

interface ArticleData {
  title: string;
  content: string;
  tags: Array<{ id: string; name: string }>;
  isBookmarked: boolean;
}

export default async function ArticlePage({
  params,
}: {
  params: { term: string };
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  let userId: string | null = null;
  if (sessionCookie) {
    try {
      const decodedClaim = await adminAuth.verifySessionCookie(sessionCookie);
      userId = decodedClaim.uid;
    } catch (error) {
      console.error("Error verifying session cookie:", error);
    }
  }

  const article = await prisma.article.findUnique({
    where: { slug: params.term },
    include: {
      tags: true,
      bookmarks: {
        where: { userId: userId || "" },
      },
    },
  });

  if (!article) {
    notFound();
  }

  const articleData: ArticleData = {
    title: article.title,
    content: article.content,
    tags: article.tags,
    isBookmarked: article.bookmarks.length > 0,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{articleData.title}</h1>
          <BookmarkButton
            slug={params.term}
            initialIsBookmarked={articleData.isBookmarked}
          />
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: articleData.content }}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {articleData.tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

