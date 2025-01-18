import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type SearchResult = {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    createdAt: Date;
  }>;
  questions: Array<{
    id: string;
    title: string;
    createdAt: Date;
  }>;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const type = searchParams.get('type') || 'all'; // 'all', 'articles', 'questions'

  if (!q) {
    return NextResponse.json({ error: 'Missing query parameter: q' }, { status: 400 });
  }

  try {
    let results: SearchResult = {
      articles: [],
      questions: []
    };

    if (type === 'all' || type === 'articles') {
      const articles = await prisma.$queryRaw<SearchResult['articles']>`
        SELECT id, title, slug, "createdAt"
        FROM "Article"
        WHERE to_tsvector('english', title || ' ' || content) 
              @@ plainto_tsquery('english', ${q})
        AND status = 'published'
        ORDER BY "createdAt" DESC
        LIMIT 20
      `;
      results.articles = articles;
    }

    if (type === 'all' || type === 'questions') {
      const questions = await prisma.$queryRaw<SearchResult['questions']>`
        SELECT id, title, "createdAt"
        FROM "Question"
        WHERE to_tsvector('english', title || ' ' || content)
              @@ plainto_tsquery('english', ${q})
        ORDER BY "createdAt" DESC
        LIMIT 20
      `;
      results.questions = questions;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 