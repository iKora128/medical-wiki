"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Login } from "@/components/Login";
import Link from "next/link";

interface Bookmark {
  slug: string;
  title: string;
}

export default function UserPage() {
  const { user, loading } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    if (user) {
      const fetchBookmarks = async () => {
        const q = query(collection(db, "bookmarks"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedBookmarks = querySnapshot.docs.map(doc => ({
          slug: doc.data().slug,
          title: doc.data().title,
        }));
        setBookmarks(fetchedBookmarks);
      };
      fetchBookmarks();
    }
  }, [user]);

  if (loading) {
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
          <ul className="space-y-2">
            {bookmarks.map((bookmark) => (
              <li key={bookmark.slug}>
                <Link href={`/wiki/${bookmark.slug}`} className="text-blue-600 hover:underline">
                  {bookmark.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>ブックマークはまだありません。</p>
        )}
      </main>
      <Footer />
    </div>
  );
}

