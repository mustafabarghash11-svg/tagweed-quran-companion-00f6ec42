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
import { Home, ArrowUp, Play, Pause, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

const SWIPE_THRESHOLD = 60;

export default function QuranReader() {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const page = Math.max(1, Math.min(604, parseInt(pageNumber || '1', 10) || 1));
  const { data, isLoading } = useQuranPage(page);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
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

  // تشغيل الصفحة كاملة من أول آية
  const handlePlayPage = () => {
    if (!data?.ayahs?.length) return;
    const firstAyah = data.ayahs[0];
    // لو نفس الصفحة شغّالة — وقف/شغّل
    if (nowPlaying && data.ayahs.some((a) => a.number === nowPlaying.ayahNumber)) {
      togglePlay();
    } else {
      playAyah({
        ayahNumber: firstAyah.number,
        numberInSurah: firstAyah.numberInSurah,
        surahName: firstAyah.surah.name,
      });
    }
  };

  const pageIsPlaying = isPlaying && nowPlaying && data?.ayahs?.some((a) => a.number === nowPlaying.ayahNumber);

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

      {/* أزرار عائمة يمين — تشغيل الصوت */}
      <div className="fixed bottom-24 right-4 z-40 flex flex-col items-center gap-2">
        <div className="relative">
          {/* نبضة عند التشغيل */}
          {pageIsPlaying && (
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
          )}
          <Button
            size="icon"
            onClick={handlePlayPage}
            disabled={!data?.ayahs?.length}
            className={`rounded-full shadow-lg w-14 h-14 transition-all ${
              pageIsPlaying
                ? 'bg-primary hover:bg-primary/90'
                : 'bg-primary hover:bg-primary/90'
            }`}
            title={pageIsPlaying ? 'إيقاف مؤقت' : 'تشغيل تلاوة الصفحة'}
          >
            {pageIsPlaying
              ? <Pause className="h-6 w-6 text-white" />
              : <Play className="h-6 w-6 text-white mr-[-2px]" />
            }
          </Button>
        </div>
        <span className="font-ui text-[10px] text-muted-foreground">
          {pageIsPlaying ? 'جارٍ التلاوة' : 'تلاوة'}
        </span>
      </div>

      {/* أزرار عائمة يسار */}
      <div className="fixed bottom-24 left-4 z-40 flex flex-col gap-2">
        {showScrollTop && (
          <Button
            size="icon"
            variant="outline"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="rounded-full border-primary/20 bg-card shadow-md hover:bg-primary/10 active:scale-95 animate-in fade-in duration-200"
          >
            <ArrowUp className="h-4 w-4 text-primary" />
          </Button>
        )}
        <Link to="/">
          <Button
            size="icon"
            variant="outline"
            className="rounded-full border-primary/20 bg-card shadow-md hover:bg-primary/10 active:scale-95"
          >
            <Home className="h-4 w-4 text-primary" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
