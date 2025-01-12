import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Markdoc from '@markdoc/markdoc';

const prisma = new PrismaClient();

// 環境変数からAPIキーを取得
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

export async function POST(request: Request) {
  // Bearer認証の確認
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== ADMIN_API_KEY) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { articles } = await request.json();
    
    const createdArticles = await Promise.all(
      articles.map(async (article: any) => {
        const ast = Markdoc.parse(article.content);
        const content = Markdoc.transform(ast);
        const html = Markdoc.renderers.html(content);

        return prisma.article.create({
          data: {
            title: article.title,
            slug: article.slug,
            content: html,
            authorId: article.authorId,
            tags: {
              connectOrCreate: article.tags.map((tag: string) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            },
            status: article.status || 'published',
            references: article.references || '[]',
          },
        });
      })
    );

    // 記事作成後にNext.jsのISRをトリガー
    try {
      await Promise.all(
        createdArticles.map(article =>
          fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/revalidate?path=/articles/${article.slug}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        )
      );
    } catch (error) {
      console.error('Revalidation error:', error);
    }

    return NextResponse.json({ articles: createdArticles }, { status: 200 });
  } catch (error) {
    console.error('Error creating articles:', error);
    return NextResponse.json(
      { message: 'Error creating articles', error },
      { status: 500 }
    );
  }
} 