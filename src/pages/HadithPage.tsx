import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ChevronRight, Book, Search, Loader2, AlertCircle,
  ChevronLeft, Copy, Share2, Heart, Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { toArabicNumeral } from '@/lib/quran-api';

// قائمة الكتب الستة
const COLLECTIONS = [
  { id: 'bukhari', name: 'صحيح البخاري', hadithCount: 7563, arabicName: 'الجامع المسند الصحيح' },
  { id: 'muslim', name: 'صحيح مسلم', hadithCount: 7500, arabicName: 'المسند الصحيح المختصر' },
  { id: 'tirmidhi', name: 'جامع الترمذي', hadithCount: 3956, arabicName: 'سنن الترمذي' },
  { id: 'abudawud', name: 'سنن أبي داود', hadithCount: 5274, arabicName: 'سنن أبي داود' },
  { id: 'nasai', name: 'سنن النسائي', hadithCount: 5761, arabicName: 'سنن النسائي' },
  { id: 'ibnmajah', name: 'سنن ابن ماجه', hadithCount: 4341, arabicName: 'سنن ابن ماجه' },
];

interface Chapter {
  id: number;
  title: string;
  hadiths_count: number;
}

interface Hadith {
  id: number;
  hadith_number: number;
  title: string;
  body: string;
  narrator: string;
  grade?: string;
}

export default function HadithPage() {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Hadith[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = 'YOUR_API_KEY_HERE'; // ضع مفتاح API هنا

  const loadChapters = async (collectionId: string) => {
    setLoadingChapters(true);
    setError(null);
    try {
      const res = await fetch(`https://api.sunnah.com/v1/collections/${collectionId}/chapters`, {
        headers: { 'X-API-Key': API_KEY }
      });
      if (!res.ok) throw new Error('فشل تحميل الأبواب');
      const data = await res.json();
      setChapters(data.data || []);
      setSelectedBook(collectionId);
    } catch (err) {
      setError('حدث خطأ في تحميل الأبواب. تأكد من اتصالك بالإنترنت.');
      toast.error('فشل تحميل الأبواب');
    } finally {
      setLoadingChapters(false);
    }
  };

  const searchHadith = async () => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      toast.warning('أدخل 3 أحرف على الأقل للبحث');
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.sunnah.com/v1/search?q=${encodeURIComponent(searchQuery)}&size=20`,
        { headers: { 'X-API-Key': API_KEY } }
      );
      if (!res.ok) throw new Error('فشل البحث');
      const data = await res.json();
      setSearchResults(data.data || []);
    } catch (err) {
      setError('حدث خطأ في البحث');
      toast.error('فشل البحث في الأحاديث');
    } finally {
      setSearching(false);
    }
  };

  if (selectedBook) {
    return (
      <div className="min-h-screen pb-24" dir="rtl">
        <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            <button onClick={() => setSelectedBook(null)} className="text-primary">
              <ChevronRight className="h-5 w-5" />
            </button>
            <h1 className="font-ui text-lg font-bold">
              {COLLECTIONS.find(c => c.id === selectedBook)?.name}
            </h1>
            <div className="flex-1" />
          </div>
        </header>

        <div className="mx-auto max-w-2xl px-4 py-4">
          {loadingChapters ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-20">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="font-ui text-muted-foreground">{error}</p>
              <Button onClick={() => loadChapters(selectedBook)}>إعادة المحاولة</Button>
            </div>
          ) : chapters.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              لا توجد أبواب متاحة حالياً
            </div>
          ) : (
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  to={`/hadith/${selectedBook}/${chapter.id}`}
                  className="block rounded-xl border border-primary/10 bg-card p-4 hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-ui font-semibold text-base">{chapter.title}</p>
                      <p className="font-ui text-xs text-muted-foreground mt-1">
                        {toArabicNumeral(chapter.hadiths_count)} حديث
                      </p>
                    </div>
                    <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
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
              placeholder="ابحث في الأحاديث..."
              className="flex-1 font-ui"
              dir="rtl"
              onKeyDown={(e) => e.key === 'Enter' && searchHadith()}
            />
            <Button onClick={searchHadith} disabled={searching}>
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
                    <p className="font-ui text-sm font-semibold text-primary mb-1">
                      {hadith.title || `حديث رقم ${hadith.hadith_number}`}
                    </p>
                    <p className="font-ui text-sm line-clamp-2 text-muted-foreground">
                      {hadith.body.substring(0, 100)}...
                    </p>
                    {hadith.grade && (
                      <span className="inline-block mt-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {hadith.grade}
                      </span>
                    )}
                  </div>
                  <ChevronLeft className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
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
                onClick={() => loadChapters(book.id)}
                className="rounded-xl border border-primary/10 bg-card p-4 text-right hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Book className="h-5 w-5 text-primary" />
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {toArabicNumeral(book.hadithCount)}
                  </span>
                </div>
                <p className="font-ui font-bold text-base">{book.name}</p>
                <p className="font-ui text-xs text-muted-foreground mt-1">{book.arabicName}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  }
