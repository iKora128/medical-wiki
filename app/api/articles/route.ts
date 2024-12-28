import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { articleSchema } from '@/lib/validations/article';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = articleSchema.parse(json);
    
    const article = await prisma.article.create({
      data: {
        ...validatedData,
        references: JSON.stringify(validatedData.references),
        author: {
          connect: { email: session.user.email! },
        },
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