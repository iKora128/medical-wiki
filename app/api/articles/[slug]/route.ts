import { prisma } from '@/lib/prisma';
import { withErrorHandling } from '@/lib/api-middleware';
import { successResponse, errorResponse } from '@/lib/api-response';
import { z } from 'zod';

const articleUpdateSchema = z.object({
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  status: z.enum(['draft', 'published']).optional(),
  references: z.array(z.string()).optional(),
});

export const GET = withErrorHandling(async (request: Request, { params }: { params: { slug: string } }) => {
  const { slug } = await params
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      tags: true,
    },
  });

  if (!article) {
    return errorResponse('記事が見つかりません', 404);
  }

  return successResponse(article);
});

export const PUT = withErrorHandling(async (request: Request, { params }: { params: { slug: string } }) => {
  const authHeader = request.headers.get('Authorization');
  const apiKey = authHeader?.replace('Bearer ', '');
  
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return errorResponse('認証に失敗しました', 401);
  }

  const { slug } = await params
  const data = articleUpdateSchema.parse(await request.json());
  
  const article = await prisma.article.update({
    where: { slug },
    data: {
      title: data.title,
      content: data.content,
      status: data.status,
      references: data.references ? JSON.stringify(data.references) : undefined,
      tags: {
        set: [],
        connectOrCreate: data.tags.map((tag) => ({
          where: { name: tag },
          create: { name: tag },
        })),
      },
    },
    include: {
      tags: true,
    },
  });

  return successResponse(article, '記事を更新しました');
}); 