"use client"

import { useEffect, useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TableOfContents } from "@/components/TableOfContents";
import BookmarkButton from "@/components/BookmarkButton";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

interface ArticleData {
  title: string;
  content: string;
  updatedAt: string;
  tags: { name: string }[];
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name: string | null;
  };
}

export default async function Term({ params }: { params: { term: string } }) {
  let userId = null
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value
    if (sessionCookie) {
      const decodedToken = await adminAuth.verifySessionCookie(sessionCookie)
      userId = decodedToken.uid
    }
  } catch (error) {
    console.error('Error verifying session:', error)
  }

  const article = await prisma.article.findUnique({
    where: { slug: params.term },
    include: {
      author: true,
      tags: true,
      bookmarks: userId ? {
        where: { userId }
      } : false
    }
  })

  if (!article) {
    return <div>記事が見つかりません</div>
  }

  const isBookmarked = userId ? article.bookmarks.length > 0 : false

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">{article.title}</h1>
          
          <div className="flex gap-2 mb-6">
            <BookmarkButton
              slug={article.slug}
              initialIsBookmarked={isBookmarked}
            />
          </div>

          <div className="flex gap-2 mb-4">
            {article.tags.map(tag => (
              <span
                key={tag.id}
                className="px-2 py-1 bg-gray-100 text-sm rounded-md"
              >
                {tag.name}
              </span>
            ))}
          </div>

          <div className="prose max-w-none">
            {article.content}
          </div>
          
          <TableOfContents />
        </article>
      </main>
      <Footer />
    </div>
  )
}

