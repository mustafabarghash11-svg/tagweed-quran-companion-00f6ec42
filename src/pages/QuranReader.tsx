import { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuranPage } from '@/hooks/use-quran';
import { TopInfoBar } from '@/components/TopInfoBar';
import { QuranPageView } from '@/components/QuranPageView';
import { PageNavigation } from '@/components/PageNavigation';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Sidebar } from '@/components/Sidebar';
import { useAudio } from '@/context/AudioContext.tsx';
import { Button } from '@/components/ui/button';
import { Home, ArrowUp, BookOpen, Bookmark, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBookmarks } from '@/context/BookmarksContext';

const SWIPE_THRESHOLD = 60;

export default function QuranReader() {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const page = Math.max(1, Math.min(604, parseInt(pageNumber || '1', 10) || 1));
  const { data, isLoading } = useQuranPage(page);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { playAyah, togglePlay, stop, nowPlaying, isPlaying } = useAudio();

  const touchStartY = useRef(0);
  const touchStartX = useRef(0);

  const handlePageChange = (newPage: number) => {
    localStorage.setItem('tagweed-last-page', String(newPage));
    stop();
    navigate(`/page/${newPage}`, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    const deltaX = Math.abs(touchStartX.current - e.changedTouches[0].clientX);
    if (Math.abs(deltaY) < SWIPE_THRESHOLD || deltaX > 50) return;
    if (deltaY > SWIPE_THRESHOLD && page < 604) handlePageChange(page + 1);
    else if (deltaY < -SWIPE_THRESHOLD && page > 1) handlePageChange(page - 1);
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setShowScrollTop((e.target as HTMLDivElement).scrollTop > 300);
  }, []);

  // دالة لإضافة/إزالة العلامة المرجعية للصفحة
  const toggleBookmark = () => {
    if (!data?.ayahs?.length) return;
    
    const firstAyah = data.ayahs[0];
    const bookmarkKey = `page-${page}`;
    
    if (isBookmarked(bookmarkKey)) {
      removeBookmark(bookmarkKey);
    } else {
      addBookmark({
        id: bookmarkKey,
        pageNumber: page,
        surahName: firstAyah.surah.name,
        numberInSurah: firstAyah.numberInSurah,
        ayahNumber: firstAyah.number,
        text: firstAyah.text.substring(0, 50) + '...'
      });
    }
  };

  // دالة لفتح التفسير
  const openTafsir = () => {
    if (!data?.ayahs?.length) return;
    const firstAyah = data.ayahs[0];
    // يمكن فتح نافذة منبثقة أو التنقل لصفحة تفسير
    window.open(`https://quran.ksu.edu.sa/tafseer/${firstAyah.surah.number}/${firstAyah.numberInSurah}.html`, '_blank');
  };

  const pageIsBookmarked = isBookmarked(`page-${page}`);

  return (
    <div
      className="flex min-h-screen flex-col"
      dir="rtl"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onScroll={handleScroll}
    >
      <TopInfoBar
        pageNumber={page}
        ayahs={data?.ayahs}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="flex-1">
        <QuranPageView ayahs={data?.ayahs} isLoading={isLoading} />
      </div>

      <PageNavigation currentPage={page} onPageChange={handlePageChange} />
      <AudioPlayer />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* أزرار عائمة يمين - تكبير الأزرار */}
      <div className="fixed bottom-28 right-4 z-40 flex flex-col items-center gap-4">
        {/* زر الإشارة المرجعية - مكبر */}
        <button
          onClick={toggleBookmark}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all active:scale-95 hover:scale-105"
          style={{
            background: pageIsBookmarked 
              ? 'linear-gradient(135deg, #f59e0b, #d97706)'
              : 'linear-gradient(135deg, #10b981, #059669)'
          }}
          title={pageIsBookmarked ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
        >
          <Bookmark className={`h-6 w-6 text-white ${pageIsBookmarked ? 'fill-white' : ''}`} />
          <span className="absolute -top-8 whitespace-nowrap rounded bg-black/70 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            {pageIsBookmarked ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          </span>
        </button>

        {/* زر التفسير - مكبر */}
        <button
          onClick={openTafsir}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transition-all active:scale-95 hover:scale-105"
          title="فتح التفسير"
        >
          <Info className="h-6 w-6 text-white" />
          <span className="absolute -top-8 whitespace-nowrap rounded bg-black/70 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            فتح التفسير
          </span>
        </button>
      </div>

      {/* أزرار عائمة يسار */}
      <div className="fixed bottom-28 left-4 z-40 flex flex-col gap-3">
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-card shadow-md transition-all hover:bg-primary/10 active:scale-95"
          >
            <ArrowUp className="h-5 w-5 text-primary" />
          </button>
        )}
        <Link to="/">
          <button className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-card shadow-md transition-all hover:bg-primary/10 active:scale-95">
            <Home className="h-5 w-5 text-primary" />
          </button>
        </Link>
      </div>
    </div>
  );
      }
