export const runtime = 'nodejs';

import { withErrorHandling } from '@/lib/api-middleware';
import { successResponse, errorResponse } from '@/lib/api-response';
import { bulkUploadSchema, validateCsvFormat } from '@/lib/validations/bulk-upload';
import { ArticleRepository } from '@/lib/repositories/article';
import { parse } from 'papaparse';
import Markdoc from '@markdoc/markdoc';
import { revalidatePath } from 'next/cache';

export const POST = withErrorHandling(async (request: Request) => {
  // API Keyでの認証
  const authHeader = request.headers.get('Authorization');
  const apiKey = authHeader?.replace('Bearer ', '');
  
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return errorResponse("不正なAPIキーです", 401);
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return errorResponse("ファイルが必要です", 400);
  }

  const text = await file.text();
  const { data, errors, meta } = parse(text, { header: true, skipEmptyLines: true });
  
  if (errors.length > 0) {
    return errorResponse("CSVの解析に失敗しました", 400, { details: errors });
  }

  // CSVのヘッダー検証
  const headerErrors = validateCsvFormat(meta.fields || []);
  if (headerErrors.length > 0) {
    return errorResponse("CSVのフォーマットが不正です", 400, { details: headerErrors });
  }

  // データの検証
  const validationResult = bulkUploadSchema.safeParse(data);
  if (!validationResult.success) {
    return errorResponse("データの検証に失敗しました", 400, { details: validationResult.error.errors });
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
        status: articleData.status
      });

      // 作成された記事ページを再生成
      await revalidatePath(`/articles/${article.slug}`);
      return article;
    })
  );

  return successResponse({ articles }, `${articles.length}件の記事を作成しました`);
}); 