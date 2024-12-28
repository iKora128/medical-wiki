import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { Bookmark } from "lucide-react";

interface BookmarkButtonProps {
  articleId: string;
  articleTitle: string;
}

export function BookmarkButton({ articleId, articleTitle }: BookmarkButtonProps) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (user) {
      const checkBookmark = async () => {
        const bookmarkRef = doc(db, "'bookmarks'", `${user.uid}_${articleId}`);
        const bookmarkDoc = await getDoc(bookmarkRef);
        setIsBookmarked(bookmarkDoc.exists());
      };
      checkBookmark();
    }
  }, [user, articleId]);

  const handleBookmark = async () => {
    if (!user) {
      alert("'ブックマークするにはログインが必要です。'");
      return;
    }

    const bookmarkRef = doc(db, "'bookmarks'", `${user.uid}_${articleId}`);

    if (isBookmarked) {
      await deleteDoc(bookmarkRef);
      setIsBookmarked(false);
    } else {
      await setDoc(bookmarkRef, {
        userId: user.uid,
        articleId,
        title: articleTitle,
        createdAt: new Date(),
      });
      setIsBookmarked(true);
    }
  };

  return (
    <button
      onClick={handleBookmark}
      className={`flex items-center ${
        isBookmarked ? "'text-yellow-500'" : "'text-gray-500'"
      } hover:text-yellow-600`}
    >
      <Bookmark className="w-5 h-5 mr-1" />
      {isBookmarked ? "'ブックマーク済み'" : "'ブックマーク'"}
    </button>
  );
}

