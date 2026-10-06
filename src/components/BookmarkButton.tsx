"use client";

import React, { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";

interface BookmarkButtonProps {
  post: {
    id: string;
    slug?: string;
    title: string;
    category?: string;
  };
  size?: number;
  className?: string;
}

const STORAGE_KEY = "kontyra_saved_vyntajobs";

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  post,
  size = 15,
  className = "",
}) => {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const list = JSON.parse(stored);
        setSaved(list.some((item: any) => item.id === post.id || item.slug === post.slug));
      }
    } catch (e) {
      console.error(e);
    }
  }, [post.id, post.slug]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let list = stored ? JSON.parse(stored) : [];
      const exists = list.some((item: any) => item.id === post.id || item.slug === post.slug);

      if (exists) {
        list = list.filter((item: any) => item.id !== post.id && item.slug !== post.slug);
        setSaved(false);
      } else {
        list.push(post);
        setSaved(true);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event("vyntajobs_bookmarks_updated"));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      title={saved ? "Remove from saved jobs" : "Save job posting"}
      className={`p-2 rounded-full transition-all border ${
        saved
          ? "bg-white text-black border-white"
          : "border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:border-white/30"
      } ${className}`}
    >
      <Bookmark size={size} className={saved ? "fill-black" : ""} />
    </button>
  );
};

export default BookmarkButton;
