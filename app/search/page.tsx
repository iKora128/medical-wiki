'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import Header from "@/components/Header";

type SearchResult = {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    createdAt: string;
  }>;
  questions: Array<{
    id: string;
    title: string;
    createdAt: string;
  }>;
};

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';
  const initialType = searchParams?.get('type') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({ q: query, type });
      router.push(`/search?${params.toString()}`);
      
      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error('検索に失敗しました');
      
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初期検索クエリがある場合は自動的に検索を実行
  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, [initialQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">検索</h1>

        <form onSubmit={handleSearch} className="mb-8 space-y-4">
          <div className="flex gap-2">
            <Input
              type="search"
              placeholder="キーワードを入力..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '検索中...' : '検索'}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === 'all' ? 'default' : 'outline'}
              onClick={() => setType('all')}
            >
              すべて
            </Button>
            <Button
              type="button"
              variant={type === 'articles' ? 'default' : 'outline'}
              onClick={() => setType('articles')}
            >
              記事
            </Button>
            <Button
              type="button"
              variant={type === 'questions' ? 'default' : 'outline'}
              onClick={() => setType('questions')}
            >
              質問
            </Button>
          </div>
        </form>

        {results && (
          <div className="space-y-8">
            {(type === 'all' || type === 'articles') && (
              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  記事
                  <Badge variant="secondary" className="ml-2">
                    {results.articles.length}件
                  </Badge>
                </h2>
                {results.articles.length > 0 ? (
                  <ul className="space-y-4">
                    {results.articles.map((article) => (
                      <li key={article.id} className="border rounded-lg p-4">
                        <Link
                          href={`/articles/${article.slug}`}
                          className="text-lg font-medium hover:underline"
                        >
                          {article.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(article.createdAt), {
                            addSuffix: true,
                            locale: ja,
                          })}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">記事が見つかりませんでした。</p>
                )}
              </section>
            )}

            {(type === 'all' || type === 'questions') && (
              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  質問
                  <Badge variant="secondary" className="ml-2">
                    {results.questions.length}件
                  </Badge>
                </h2>
                {results.questions.length > 0 ? (
                  <ul className="space-y-4">
                    {results.questions.map((question) => (
                      <li key={question.id} className="border rounded-lg p-4">
                        <Link
                          href={`/questions/${question.id}`}
                          className="text-lg font-medium hover:underline"
                        >
                          {question.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(question.createdAt), {
                            addSuffix: true,
                            locale: ja,
                          })}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">質問が見つかりませんでした。</p>
                )}
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
} 