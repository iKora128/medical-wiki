"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Login } from "@/components/Login";
import Link from "next/link";

interface Bookmark {
  id: string;
  article: {
    slug: string;
    title: string;
    tags: Array<{ id: string; name: string }>;
  };
  createdAt: string;
}

export default function UserPage() {
  const { user, loading } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchBookmarks = async () => {
        try {
          const response = await fetch('/api/bookmarks');
          if (!response.ok) throw new Error('Failed to fetch bookmarks');
          const data = await response.json();
          setBookmarks(data);
        } catch (error) {
          console.error('Error fetching bookmarks:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchBookmarks();
    }
  }, [user]);

  if (loading || isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">ユーザーページ</h1>
          <p className="mb-4">ログインしてブックマークや編集機能を利用しましょう。</p>
          <Login />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">ようこそ、{user.displayName}さん</h1>
        <h2 className="text-2xl font-semibold mb-4">ブックマーク</h2>
        {bookmarks.length > 0 ? (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <Link 
                  href={`/wiki/${bookmark.article.slug}`} 
                  className="text-xl font-medium hover:text-blue-600"
                >
                  {bookmark.article.title}
                </Link>
                <div className="flex gap-2 mt-2">
                  {bookmark.article.tags.map(tag => (
                    <span
                      key={tag.id}
                      className="px-2 py-1 bg-gray-100 text-sm rounded-md"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  追加日: {new Date(bookmark.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>ブックマークはまだありません。</p>
        )}
      </main>
      <Footer />
    </div>
  );
}

