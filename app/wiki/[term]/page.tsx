"use client"

import { useEffect, useState } from 'react';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TableOfContents } from "@/components/TableOfContents";
import { useAuth } from "@/contexts/AuthContext";
import { ThumbsUp, ThumbsDown, Share2, Clock } from "lucide-react";

interface ArticleData {
  title: string;
  content: string;
  updatedAt: string;
  tags: { name: string }[];
  likes: number;
  dislikes: number;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name: string | null;
  };
}

export default function Term({ params }: { params: { term: string } }) {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReacting, setIsReacting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articleRes, commentsRes] = await Promise.all([
          fetch(`/api/articles/${params.term}`),
          fetch(`/api/articles/${params.term}/comments`),
        ]);

        if (!articleRes.ok) {
          throw new Error("記事の取得に失敗しました");
        }

        const articleData = await articleRes.json();
        setArticle(articleData);

        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.term]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/articles/${params.term}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (!res.ok) {
        throw new Error("コメントの投稿に失敗しました");
      }

      const comment = await res.json();
      setComments([comment, ...comments]);
      setNewComment("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました");
    }
  };

  const handleReaction = async (action: "like" | "dislike") => {
    if (!article || isReacting) return;

    try {
      setIsReacting(true);
      const res = await fetch(`/api/articles/${params.term}/reaction`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        throw new Error("リアクションの更新に失敗しました");
      }

      const updatedArticle = await res.json();
      setArticle(prev => ({
        ...prev!,
        likes: updatedArticle.likes,
        dislikes: updatedArticle.dislikes,
      }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsReacting(false);
    }
  };

  if (!article) return <div>Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">{article.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                最終更新: {new Date(article.updatedAt).toLocaleDateString("ja-JP")}
              </span>
              <button
                onClick={() => handleReaction("like")}
                disabled={isReacting}
                className={`flex items-center hover:text-blue-600 transition-colors ${
                  isReacting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                <span>{article.likes}</span>
              </button>
              <button
                onClick={() => handleReaction("dislike")}
                disabled={isReacting}
                className={`flex items-center hover:text-red-600 transition-colors ${
                  isReacting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <ThumbsDown className="w-4 h-4 mr-1" />
                <span>{article.dislikes}</span>
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: article.title,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("URLをコピーしました");
                  }
                }}
                className="flex items-center hover:text-blue-600 transition-colors"
              >
                <Share2 className="w-4 h-4 mr-1" />
                共有
              </button>
            </div>
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.map((tag) => (
                  <span
                    key={tag.name}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            <div className="mb-8">
              <TableOfContents />
            </div>
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }} 
            />

            <section className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">コメント</h2>

              {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  <div className="mb-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="コメントを入力..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    コメントを投稿
                  </button>
                </form>
              ) : (
                <div className="bg-gray-50 p-4 rounded-md mb-8">
                  <p className="text-gray-600">
                    コメントを投稿するには
                    <a href="/login" className="text-blue-600 hover:underline">
                      ログイン
                    </a>
                    が必要です。
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white p-4 rounded-lg shadow"
                  >
                    <p className="text-gray-800 mb-2">{comment.content}</p>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">
                        {comment.author.name || "匿名ユーザー"}
                      </span>
                      <span className="mx-2">•</span>
                      <time>
                        {new Date(comment.createdAt).toLocaleDateString("ja-JP")}
                      </time>
                    </div>
                  </div>
                ))}

                {comments.length === 0 && (
                  <p className="text-gray-600">まだコメントはありません。</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

