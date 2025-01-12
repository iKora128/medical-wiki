import { PrismaClient } from '@prisma/client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

interface ArticleProps {
  params: {
    slug: string;
  };
}

// このページは完全に静的に生成
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateMetadata({ params }: ArticleProps): Promise<Metadata> {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: {
      author: {
        select: { name: true },
      },
    },
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

export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    select: { slug: true },
  });

  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function Article({ params }: ArticleProps) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: {
      author: {
        select: { name: true },
      },
      tags: {
        select: { name: true },
      },
    },
  });

  if (!article) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
      <div className="flex gap-2 mb-4">
        {article.tags.map((tag) => (
          <span key={tag.name} className="bg-gray-100 px-2 py-1 rounded-full text-sm">
            {tag.name}
          </span>
        ))}
      </div>
      <div className="text-gray-600 mb-8">
        <span>By {article.author.name}</span>
        <span className="mx-2">•</span>
        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
      </div>
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
} 