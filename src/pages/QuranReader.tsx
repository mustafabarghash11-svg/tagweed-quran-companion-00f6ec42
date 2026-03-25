import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuranPage } from '@/hooks/use-quran';
import { TopInfoBar } from '@/components/TopInfoBar';
import { QuranPageView } from '@/components/QuranPageView';
import { PageNavigation } from '@/components/PageNavigation';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Sidebar } from '@/components/Sidebar';
import { useAudio } from '@/context/AudioContext.tsx';
import { Button } from '@/components/ui/button';
import { Home, ArrowUp, Play, Pause, Maximize2, Minimize2 } from 'lucide-react';
import { Link } from 'react-router-dom';


export default function QuranReader() {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const page = Math.max(1, Math.min(604, parseInt(pageNumber || '1', 10) || 1));
  const { data, isLoading } = useQuranPage(page);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const { playAyah, togglePlay, stop, nowPlaying, isPlaying } = useAudio();

  // المرجع للحاوية القابلة للتمرير
  const scrollRef = useRef<HTMLDivElement>(null);


  // عند تغيير الصفحة — ارجع لأعلى الحاوية
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setShowScrollTop(false);
  }, [page]);

  const handlePageChange = (newPage: number) => {
    localStorage.setItem('tagweed-last-page', String(newPage));
    stop();
    navigate(`/page/${newPage}`, { replace: true });
  };

  // الـ scroll على الحاوية الداخلية
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setShowScrollTop(target.scrollTop > 300);
  }, []);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayPage = () => {
    if (!data?.ayahs?.length) return;
    const firstAyah = data.ayahs[0];
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

  const pageIsPlaying =
    isPlaying && nowPlaying && data?.ayahs?.some((a) => a.number === nowPlaying.ayahNumber);

  return (
    // الحاوية الخارجية — ارتفاع ثابت = ارتفاع الشاشة، لا تتمرر هي نفسها
    <div
      className="flex flex-col bg-background"
      style={{ height: '100dvh', overflow: 'hidden' }}
      dir="rtl"
    >
      {/* شريط المعلومات العلوي — يختفي في وضع ملء الشاشة */}
      {!fullscreen && (
        <TopInfoBar
          pageNumber={page}
          ayahs={data?.ayahs}
          onMenuClick={() => setSidebarOpen(true)}
        />
      )}

      {/* منطقة القراءة القابلة للتمرير */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        onScroll={handleScroll}
      >
        <QuranPageView ayahs={data?.ayahs} isLoading={isLoading} />
      </div>

      {/* شريط التنقل السفلي — يختفي في وضع ملء الشاشة */}
      {!fullscreen && (
        <>
          <PageNavigation currentPage={page} onPageChange={handlePageChange} />
          <AudioPlayer />
        </>
      )}

      {/* في وضع ملء الشاشة: أزرار تنقل بسيطة */}
      {fullscreen && (
        <div className="flex items-center justify-between border-t border-primary/10 bg-background/80 backdrop-blur-sm px-6 py-2">
          <button
            onClick={() => page < 604 && handlePageChange(page + 1)}
            disabled={page >= 604}
            className="font-ui text-sm text-primary disabled:opacity-30 px-4 py-2 rounded-lg hover:bg-primary/10 active:scale-95 transition-all"
          >
            ‹ التالية
          </button>
          <span className="font-ui text-xs text-muted-foreground">{page} / 604</span>
          <button
            onClick={() => page > 1 && handlePageChange(page - 1)}
            disabled={page <= 1}
            className="font-ui text-sm text-primary disabled:opacity-30 px-4 py-2 rounded-lg hover:bg-primary/10 active:scale-95 transition-all"
          >
            التالية ›
          </button>
        </div>
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* زر ملء الشاشة — دائماً ظاهر */}
      <button
        onClick={() => setFullscreen((v) => !v)}
        className="fixed top-3 left-3 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 shadow-md border border-primary/10 text-primary hover:bg-primary/10 active:scale-95 transition-all"
        title={fullscreen ? 'إلغاء ملء الشاشة' : 'ملء الشاشة'}
      >
        {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
      </button>

      {/* أزرار عائمة يمين */}
      <div className={`fixed z-40 flex flex-col items-center gap-2 ${fullscreen ? 'bottom-14 right-4' : 'bottom-24 right-4'}`}>
        <div className="relative">
          {pageIsPlaying && (
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
          )}
          <Button
            size="icon"
            onClick={handlePlayPage}
            disabled={!data?.ayahs?.length}
            className="rounded-full shadow-lg w-12 h-12 bg-primary hover:bg-primary/90"
            title={pageIsPlaying ? 'إيقاف مؤقت' : 'تشغيل تلاوة الصفحة'}
          >
            {pageIsPlaying
              ? <Pause className="h-5 w-5 text-white" />
              : <Play className="h-5 w-5 text-white mr-[-2px]" />}
          </Button>
        </div>
      </div>

      {/* أزرار عائمة يسار */}
      <div className={`fixed z-40 flex flex-col gap-2 ${fullscreen ? 'bottom-14 left-4' : 'bottom-24 left-4'}`}>
        {showScrollTop && (
          <Button
            size="icon"
            variant="outline"
            onClick={scrollToTop}
            className="rounded-full border-primary/20 bg-card shadow-md hover:bg-primary/10 active:scale-95 w-9 h-9 animate-in fade-in duration-200"
          >
            <ArrowUp className="h-4 w-4 text-primary" />
          </Button>
        )}
        {!fullscreen && (
          <Link to="/">
            <Button
              size="icon"
              variant="outline"
              className="rounded-full border-primary/20 bg-card shadow-md hover:bg-primary/10 active:scale-95 w-9 h-9"
            >
              <Home className="h-4 w-4 text-primary" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
