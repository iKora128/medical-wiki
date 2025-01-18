import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Article as PrismaArticle } from '@prisma/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Clock } from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookmarkButton from '@/components/BookmarkButton';
import { TableOfContents } from "@/components/TableOfContents";
import ShareButton from './ShareButton';

interface ArticleProps {
  params: Promise<{
    slug: string;
  }>;
}

interface ArticleWithRelations extends PrismaArticle {
  tags: Array<{
    name: string;
  }>;
}

// 動的レンダリングを有効化
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateMetadata({ params }: ArticleProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) {
    return {
      title: 'Article Not Found',
    };
  }

  const article = await prisma.article.findUnique({
    where: { slug },
  });

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: `${article.title} | Medical Wiki`,
    description: article.content.substring(0, 200),
    openGraph: {
      title: article.title,
      description: article.content.substring(0, 200),
      type: 'article',
    },
  };
}

export default async function Article({ params }: ArticleProps) {
  const { slug } = await params;
  if (!slug) {
    notFound();
  }

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      tags: {
        select: { name: true },
      },
    },
  }) as ArticleWithRelations | null;

  if (!article) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-4xl font-bold text-gray-900 mb-6 relative first-letter:text-5xl first-letter:text-blue-600 first-letter:font-extrabold after:content-[''] after:block after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-transparent after:mt-2">
              {article.title}
            </h1>
            <div className="flex items-center space-x-4">
              <BookmarkButton slug={article.slug} initialIsBookmarked={false} />
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                最終更新: {new Date(article.createdAt).toLocaleDateString("ja-JP")}
              </span>
              <ShareButton />
            </div>
            <div className="mb-8">
              <TableOfContents />
            </div>
            <div className="grid grid-cols-1 gap-8">
              <div>
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({node, ...props}) => (
                        <h2 
                          {...props} 
                          className="text-2xl font-semibold text-gray-900 mb-4 relative first-letter:text-3xl first-letter:text-blue-600 first-letter:font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-blue-400 after:via-purple-400 after:to-transparent"
                        />
                      ),
                      h3: ({node, ...props}) => (
                        <h3 
                          {...props} 
                          className="text-xl font-semibold text-gray-900 mb-2 relative first-letter:text-2xl first-letter:text-purple-600 first-letter:font-bold pl-4 border-l-4 border-purple-400"
                        />
                      ),
                      p: ({node, ...props}) => (
                        <p {...props} className="text-gray-700 mb-4" />
                      ),
                      ul: ({node, ...props}) => (
                        <ul {...props} className="list-disc list-inside text-gray-700 mb-4" />
                      ),
                      strong: ({node, ...props}) => (
                        <strong {...props} className="font-bold text-gray-900 bg-yellow-50 px-1 rounded" />
                      ),
                    }}
                  >
                    {article.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 