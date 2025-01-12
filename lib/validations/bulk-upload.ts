import { z } from 'zod'

const articleRowSchema = z.object({
  title: z.string().min(1, { message: 'タイトルは必須です' }),
  content: z.string().min(1, { message: '本文は必須です' }),
  tags: z.string().transform(str => str.split(',').map(tag => tag.trim()).filter(Boolean)).default(''),
  references: z.string().transform(str => str.split(',').map(ref => ref.trim()).filter(Boolean)).default(''),
  status: z.enum(['draft', 'published']).default('draft'),
})

export const bulkUploadSchema = z.array(articleRowSchema).min(1, {
  message: '少なくとも1つの記事が必要です'
}).max(100, {
  message: '一度にアップロードできる記事は100件までです'
}).refine(
  (articles) => {
    const titles = new Set()
    return articles.every(article => {
      if (titles.has(article.title)) return false
      titles.add(article.title)
      return true
    })
  },
  { message: 'タイトルが重複している記事があります' }
)

export type BulkUploadInput = z.infer<typeof bulkUploadSchema>

export function validateCsvFormat(headers: string[]): string[] {
  const requiredHeaders = ['title', 'content']
  const optionalHeaders = ['tags', 'references', 'status']
  const allowedHeaders = [...requiredHeaders, ...optionalHeaders]
  
  const errors: string[] = []
  
  // 必須ヘッダーの確認
  for (const header of requiredHeaders) {
    if (!headers.includes(header)) {
      errors.push(`${header}カラムは必須です`)
    }
  }
  
  // 不明なヘッダーの確認
  for (const header of headers) {
    if (!allowedHeaders.includes(header)) {
      errors.push(`${header}は不明なカラムです`)
    }
  }
  
  return errors
} 