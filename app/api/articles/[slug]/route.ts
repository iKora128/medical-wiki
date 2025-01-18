import { prisma } from '@/lib/prisma';
import { withErrorHandling } from '@/lib/api-middleware';
import { successResponse, errorResponse } from '@/lib/api-response';
import { z } from 'zod';
import { verifyAuth, verifyRole, ROLES } from '@/lib/auth';

const articleUpdateSchema = z.object({
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string())
});

export const GET = withErrorHandling(async (request: Request, { params }: { params: { slug: string } }) => {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
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
  // 認証チェック
  const authHeader = request.headers.get('Authorization');
  const apiKey = authHeader?.replace('Bearer ', '');
  
  // 管理者APIキーでの認証
  if (apiKey === process.env.ADMIN_API_KEY) {
    // APIキーが一致する場合は処理を続行
  } else {
    // Firebase認証のチェック
    const user = await verifyAuth(request);
    await verifyRole(user, ROLES.ADMIN);
  }

  const data = articleUpdateSchema.parse(await request.json());
  
  const article = await prisma.article.update({
    where: { slug: params.slug },
    data: {
      title: data.title,
      content: data.content,
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