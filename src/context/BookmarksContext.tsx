import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface Bookmark {
  ayahNumber: number;
  numberInSurah: number;
  surahName: string;
  pageNumber: number;
  text: string;
  savedAt: number;
}

interface BookmarksContextType {
  bookmarks: Bookmark[];
  addBookmark: (b: Bookmark) => void;
  removeBookmark: (ayahNumber: number) => void;
  isBookmarked: (ayahNumber: number) => boolean;
}

const BookmarksContext = createContext<BookmarksContextType | null>(null);

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem('tagweed-bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('tagweed-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (b: Bookmark) => {
    setBookmarks((prev) => {
      if (prev.find((x) => x.ayahNumber === b.ayahNumber)) return prev;
      return [b, ...prev];
    });
  };

  const removeBookmark = (ayahNumber: number) => {
    setBookmarks((prev) => prev.filter((b) => b.ayahNumber !== ayahNumber));
  };

  const isBookmarked = (ayahNumber: number) =>
    bookmarks.some((b) => b.ayahNumber === ayahNumber);

  return (
    <BookmarksContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error('useBookmarks must be used inside BookmarksProvider');
  return ctx;
}
