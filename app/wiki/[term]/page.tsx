"use client"

import { useEffect, useState } from 'react';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TableOfContents } from "@/components/TableOfContents";

interface ArticleData {
  metadata: {
    title: string;
    updatedAt: string;
    tags: string[];
  };
  content: string;
}

export default function Term({ params }: { params: { term: string } }) {
  const [article, setArticle] = useState<ArticleData | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      const response = await fetch(`/api/articles/${params.term}`);
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
            <h1 className="text-4xl font-bold text-gray-900 mb-6">{article.metadata.title}</h1>
            {/* メタ情報 */}
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

