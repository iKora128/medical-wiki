import { z } from "zod"

export const articleSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(100),
  content: z.string().min(1, "本文は必須です"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "スラッグは小文字、数字、ハイフンのみ使用可能です"),
  tags: z.array(z.string()),
  references: z.array(z.string()),
  status: z.enum(["draft", "published", "archived"]),
})

export type ArticleInput = z.infer<typeof articleSchema> 