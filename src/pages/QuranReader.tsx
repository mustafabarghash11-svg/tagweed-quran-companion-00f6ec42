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

const SWIPE_THRESHOLD = 50; // الحد الأدنى لمسافة السحب (بكسل)

export default function QuranReader() {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const page = Math.max(1, Math.min(604, parseInt(pageNumber || '1', 10) || 1));
  const { data, isLoading } = useQuranPage(page);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const { playAyah, togglePlay, stop, nowPlaying, isPlaying } = useAudio();

  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // ========== ملء الشاشة ==========
  const toggleFullscreen = async () => {
    if (!fullscreen) {
      const element = containerRef.current;
      if (element?.requestFullscreen) {
        await element.requestFullscreen();
      }
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // ========== التنقل بالسحب (يسار/يمين فقط) ==========
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    const deltaY = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    
    // تجاهل السحب إذا كان عمودياً أكثر من أفقي
    if (Math.abs(deltaX) < Math.abs(deltaY)) return;
    
    // السحب لليسار (deltaX موجب) ← الصفحة التالية
    if (deltaX > SWIPE_THRESHOLD && page < 604) {
      handlePageChange(page + 1);
    }
    // السحب لليمين (deltaX سالب) ← الصفحة السابقة
    else if (deltaX < -SWIPE_THRESHOLD && page > 1) {
      handlePageChange(page - 1);
    }
  };

  // ========== التنقل بالنقر في وضع ملء الشاشة ==========
  const handleFullscreenTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!fullscreen) return;
    
    let clientX: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    const screenWidth = window.innerWidth;
    const third = screenWidth / 3;
    
    // النقر على الثلث الأيمن ← الصفحة التالية
    if (clientX > screenWidth - third) {
      if (page < 604) handlePageChange(page + 1);
    }
    // النقر على الثلث الأيسر ← الصفحة السابقة
    else if (clientX < third) {
      if (page > 1) handlePageChange(page - 1);
    }
  };

  // ========== دوال الصفحة ==========
  const handlePageChange = (newPage: number) => {
    localStorage.setItem('tagweed-last-page', String(newPage));
    stop();
    navigate(`/page/${newPage}`, { replace: true });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setShowScrollTop(false);
  }, [page]);

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
    <div
      ref={containerRef}
      className="flex flex-col bg-background"
      style={{ height: '100dvh', overflow: 'hidden' }}
      dir="rtl"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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

      {/* زر ملء الشاشة — دائماً ظاهر */}
      <button
        onClick={toggleFullscreen}
        className="fixed top-3 left-3 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 shadow-md border border-primary/10 text-primary hover:bg-primary/10 active:scale-95 transition-all"
        title={fullscreen ? 'إلغاء ملء الشاشة' : 'ملء الشاشة'}
      >
        {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>

      {/* طبقة شفافة للتنقل بالنقر في وضع ملء الشاشة */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-30"
          onClick={handleFullscreenTap}
          onTouchStart={handleFullscreenTap}
          style={{ background: 'transparent' }}
        />
      )}

      {/* الأزرار العائمة — تختفي تماماً في وضع ملء الشاشة */}
      {!fullscreen && (
        <>
          {/* أزرار عائمة يمين (زر الصوت الكبير) */}
          <div className="fixed bottom-24 right-4 z-40 flex flex-col items-center gap-2">
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
          <div className="fixed bottom-24 left-4 z-40 flex flex-col gap-2">
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
            <Link to="/">
              <Button
                size="icon"
                variant="outline"
                className="rounded-full border-primary/20 bg-card shadow-md hover:bg-primary/10 active:scale-95 w-9 h-9"
              >
                <Home className="h-4 w-4 text-primary" />
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
      }
