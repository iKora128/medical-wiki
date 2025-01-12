export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { articleSchema } from '@/lib/validations/article';
import { verifyAuth, verifyRole, ROLES } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    const user = await verifyAuth(sessionCookie);
    
    try {
      await verifyRole(user, ROLES.ADMIN);
    } catch (error) {
      return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
    }

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

    return NextResponse.json(article);
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
} 