import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark, Trash2 } from 'lucide-react';
import { useBookmarks } from '@/context/BookmarksContext';
import { toArabicNumeral } from '@/lib/quran-api';

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useBookmarks();

  return (
    <div className="min-h-screen pb-20" dir="rtl">
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="text-primary transition-transform hover:scale-105 active:scale-95"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          <h1 className="font-ui text-lg font-bold">العلامات المرجعية</h1>
          <span className="mr-auto font-ui text-sm text-muted-foreground">
            {toArabicNumeral(bookmarks.length)}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {bookmarks.length === 0 ? (
          <div className="mt-20 flex flex-col items-center gap-4 text-muted-foreground">
            <Bookmark className="h-12 w-12 opacity-30" />
            <p className="font-ui text-base">لا توجد علامات مرجعية بعد</p>
            <p className="font-ui text-sm opacity-70">
              اضغط على أيقونة العلامة بجانب أي آية لحفظها
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bm) => (
              <div
                key={bm.ayahNumber}
                className="flex items-start gap-3 rounded-xl border border-primary/10 bg-card p-4 shadow-sm"
              >
                <Link
                  to={`/page/${bm.pageNumber}`}
                  className="flex-1 min-w-0"
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="font-ui text-sm font-bold text-primary">
                      {bm.surahName}
                    </span>
                    <span className="font-ui text-xs text-muted-foreground">
                      · آية {toArabicNumeral(bm.numberInSurah)} · صفحة {toArabicNumeral(bm.pageNumber)}
                    </span>
                  </div>
                  <p className="font-quran text-base leading-relaxed text-right text-foreground line-clamp-2">
                    {bm.text}
                    {bm.text.length >= 80 ? '...' : ''}
                  </p>
                </Link>

                <button
                  onClick={() => removeBookmark(bm.ayahNumber)}
                  className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
