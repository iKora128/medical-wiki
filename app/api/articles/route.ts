export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';
import { withErrorHandling } from '@/lib/api-middleware';
import { successResponse, errorResponse } from '@/lib/api-response';
import { articleSchema } from '@/lib/validations/article';

export const POST = withErrorHandling(async (request: Request) => {
  const authHeader = request.headers.get('Authorization');
  const adminApiKey = process.env.ADMIN_API_KEY;

  if (authHeader !== `Bearer ${adminApiKey}`) {
    return errorResponse('認証に失敗しました', 401);
  }

  const json = await request.json();
  const validatedData = articleSchema.parse(json);
  
  const article = await prisma.article.create({
    data: {
      ...validatedData,
      references: JSON.stringify(validatedData.references || []),
      tags: {
        connectOrCreate: validatedData.tags.map((tag) => ({
          where: { name: tag },
          create: { name: tag },
        })),
      },
    },
    include: {
      tags: true,
    },
  });

  return successResponse(article, '記事を作成しました');
}); 