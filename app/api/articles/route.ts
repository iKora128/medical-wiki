import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { articleSchema } from '@/lib/validations/article';
import { verifyAdminToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    try {
      await verifyAdminToken(authHeader.split("Bearer ")[1]);
    } catch (error) {
      return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = articleSchema.parse(json);
    
    const article = await prisma.article.create({
      data: {
        ...validatedData,
        references: JSON.stringify(validatedData.references),
        authorId: "system",
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