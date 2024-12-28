import useSWR from "swr"
import { Article } from "@/types/article"

export function useArticles(query?: string, tags?: string[], status?: string) {
  const params = new URLSearchParams()
  if (query) params.set("q", query)
  if (tags?.length) params.set("tags", tags.join(","))
  if (status) params.set("status", status)

  const { data, error, mutate } = useSWR<Article[]>(
    `/api/articles/search?${params.toString()}`
  )

  return {
    articles: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
} 