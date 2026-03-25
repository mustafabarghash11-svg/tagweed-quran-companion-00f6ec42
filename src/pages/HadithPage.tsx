import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Book, Search, Loader2, BookMarked, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { toArabicNumeral } from '@/lib/quran-api';
import { COLLECTIONS, searchHadiths, Hadith } from '@/data/hadithData';

export default function HadithPage() {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Hadith[]>([]);
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const HADITHS_PER_PAGE = 20;

  const currentCollection = COLLECTIONS.find(c => c.id === selectedBook);
  const hadiths = currentCollection 
    ? currentCollection.getHadiths(currentPage, HADITHS_PER_PAGE)
    : [];

  const handleSearch = () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      toast.warning('أدخل حرفين على الأقل للبحث');
      return;
    }
    setSearching(true);
    setTimeout(() => {
      const results = searchHadiths(searchQuery);
      setSearchResults(results);
      setSearching(false);
    }, 100);
  };

  if (selectedBook && currentCollection) {
    const totalPages = Math.ceil(currentCollection.count / HADITHS_PER_PAGE);

    return (
      <div className="min-h-screen pb-24" dir="rtl">
        <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            <button onClick={() => setSelectedBook(null)} className="text-primary">
              <ChevronRight className="h-5 w-5" />
            </button>
            <h1 className="font-ui text-lg font-bold">{currentCollection.name}</h1>
            <div className="flex-1" />
          </div>
        </header>

        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="space-y-3">
            {hadiths.map((hadith) => (
              <Link
                key={hadith.id}
                to={`/hadith/view/${hadith.id}`}
                className="block rounded-xl border border-primary/10 bg-card p-4 hover:bg-primary/5 transition-colors"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                        رقم {hadith.hadithNumber}
                      </span>
                      {hadith.grade && (
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/30 px-2 py-0.5 text-xs font-medium text-emerald-600">
                          {hadith.grade}
                        </span>
                      )}
                    </div>
                    <p className="font-ui text-sm font-semibold mb-1">عن {hadith.narrator}</p>
                    <p className="font-ui text-sm text-muted-foreground line-clamp-2">
                      {hadith.text.substring(0, 120)}...
                    </p>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-2" />
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                السابق
              </Button>
              <span className="font-ui text-sm">
                {toArabicNumeral(currentPage)} / {toArabicNumeral(totalPages)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                التالي
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-primary">
            <ChevronRight className="h-5 w-5" />
          </Link>
          <h1 className="font-ui text-lg font-bold">موسوعة الأحاديث النبوية</h1>
          <div className="w-9" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-4">
        {/* قسم البحث */}
        <div className="mb-6">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في الأحاديث (بالنص أو الراوي أو الكتاب)..."
              className="flex-1 font-ui"
              dir="rtl"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* نتائج البحث */}
        {searchResults.length > 0 && (
          <div className="mb-6 space-y-3">
            <h2 className="font-ui text-sm font-bold text-primary">نتائج البحث ({toArabicNumeral(searchResults.length)})</h2>
            {searchResults.map((hadith) => (
              <Link
                key={hadith.id}
                to={`/hadith/view/${hadith.id}`}
                className="block rounded-xl border border-primary/10 bg-card p-4 hover:bg-primary/5 transition-colors"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-xs text-primary font-bold">{hadith.collection}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                        رقم {hadith.hadithNumber}
                      </span>
                    </div>
                    <p className="font-ui text-sm text-muted-foreground line-clamp-2">
                      {hadith.text.substring(0, 100)}...
                    </p>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
            <Button variant="outline" onClick={() => setSearchResults([])} className="w-full">
              إخفاء النتائج
            </Button>
          </div>
        )}

        {/* قائمة الكتب */}
        <div>
          <h2 className="font-ui text-base font-bold mb-3 flex items-center gap-2">
            <Book className="h-4 w-4 text-primary" />
            كتب الحديث الستة
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {COLLECTIONS.map((book) => (
              <button
                key={book.id}
                onClick={() => setSelectedBook(book.id)}
                className="rounded-xl border border-primary/10 bg-card p-4 text-right hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BookMarked className="h-5 w-5 text-primary" />
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {toArabicNumeral(book.count)}
                  </span>
                </div>
                <p className="font-ui font-bold text-base">{book.name}</p>
                <p className="font-ui text-xs text-muted-foreground mt-1">حديث شريف</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
        }
