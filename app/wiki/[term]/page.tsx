"use client"

import { useEffect, useState } from 'react';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TableOfContents } from "@/components/TableOfContents";

interface ArticleData {
  title: string;
  content: string;
  updatedAt: string;
  tags: { name: string }[];
}

export default function Term({ params }: { params: { term: string } }) {
  const [article, setArticle] = useState<ArticleData | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      const response = await fetch(`/api/articles/${params.term}`);
      if (!response.ok) {
        console.error('記事の取得に失敗しました');
        return;
      }
      const data = await response.json();
      setArticle(data);
    };
    fetchArticle();
  }, [params.term]);

  if (!article) return <div>Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">{article.title}</h1>
            <div className="text-sm text-gray-500 mb-4">
              最終更新: {new Date(article.updatedAt).toLocaleDateString('ja-JP')}
              {article.tags.length > 0 && (
                <span className="ml-4">
                  タグ: {article.tags.map(tag => tag.name).join(', ')}
                </span>
              )}
            </div>
            <div className="mb-8">
              <TableOfContents />
            </div>
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }} 
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

