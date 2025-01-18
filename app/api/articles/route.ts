export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';
import { withErrorHandling } from '@/lib/api-middleware';
import { successResponse, errorResponse } from '@/lib/api-response';
import { articleSchema } from '@/lib/validations/article';
import { verifyAuth, verifyRole, ROLES } from '@/lib/auth';
import { headers } from 'next/headers';

export const POST = withErrorHandling(async (request: Request) => {
  const headersList = headers();
  const cookie = request.headers.get('cookie');
  const sessionCookie = cookie?.split(';').find((c: string) => c.trim().startsWith('session='))?.split('=')[1];
  const user = await verifyAuth(sessionCookie);
  await verifyRole(user, ROLES.ADMIN);

  const json = await request.json();
  const validatedData = articleSchema.parse(json);
  
  const article = await prisma.article.create({
    data: {
      ...validatedData,
      references: JSON.stringify(validatedData.references),
      authorId: user.uid,
      tags: {
        connectOrCreate: validatedData.tags.map((tag) => ({
          where: { name: tag },
          create: { name: tag },
        })),
      },
    },
    include: {
      tags: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  return successResponse(article, '記事を作成しました');
}); 