import { z } from "zod"

export const articleSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  content: z.string().min(1, "本文は必須です"),
  slug: z.string().min(1, "スラッグは必須です"),
  status: z.enum(["draft", "published", "archived"]),
  tags: z.array(z.string()),
  references: z.array(z.string()).default([]),
})

export type ArticleInput = z.infer<typeof articleSchema>

export const articleUpdateSchema = articleSchema.partial() 