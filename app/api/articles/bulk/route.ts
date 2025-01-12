export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth, verifyRole, ROLES } from '@/lib/auth';
import { bulkUploadSchema, validateCsvFormat } from '@/lib/validations/bulk-upload';
import { ArticleRepository } from '@/lib/repositories/article';
import { parse } from 'papaparse';
import Markdoc from '@markdoc/markdoc';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    const user = await verifyAuth(sessionCookie);
    
    try {
      await verifyRole(user, ROLES.ADMIN);
    } catch (error) {
      return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "ファイルが必要です" }, { status: 400 });
    }

    const text = await file.text();
    const { data, errors, meta } = parse(text, { header: true, skipEmptyLines: true });
    
    if (errors.length > 0) {
      return NextResponse.json({ 
        error: "CSVの解析に失敗しました", 
        details: errors 
      }, { status: 400 });
    }

    // CSVのヘッダー検証
    const headerErrors = validateCsvFormat(meta.fields || []);
    if (headerErrors.length > 0) {
      return NextResponse.json({ 
        error: "CSVのフォーマットが不正です", 
        details: headerErrors 
      }, { status: 400 });
    }

    // データの検証
    const validationResult = bulkUploadSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: "データの検証に失敗しました", 
        details: validationResult.error.errors 
      }, { status: 400 });
    }

    // 記事の一括作成
    const articles = await Promise.all(
      validationResult.data.map(async articleData => {
        // Markdownの変換
        const ast = Markdoc.parse(articleData.content);
        const content = Markdoc.transform(ast);
        const html = Markdoc.renderers.html(content);

        const article = await ArticleRepository.create({
          title: articleData.title,
          content: html,
          tags: articleData.tags || [],
          status: articleData.status,
          authorId: user.uid
        });

        // 作成された記事ページを再生成
        await revalidatePath(`/articles/${article.slug}`);
        return article;
      })
    );

    return NextResponse.json({ 
      message: `${articles.length}件の記事を作成しました`,
      articles 
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "記事の一括作成に失敗しました" },
      { status: 500 }
    );
  }
} 