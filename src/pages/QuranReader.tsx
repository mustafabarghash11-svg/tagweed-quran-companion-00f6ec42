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
import { Home, ArrowUp, Play, Pause, Maximize2, Minimize2, Sun, Moon, Search, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';

export default function QuranReader() {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const page = Math.max(1, Math.min(604, parseInt(pageNumber || '1', 10) || 1));
  const { data, isLoading } = useQuranPage(page);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTajweed, setShowTajweed] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [lastTapPosition, setLastTapPosition] = useState<'left' | 'right' | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const { theme, toggleTheme } = useSettings();
  const { playAyah, togglePlay, stop, nowPlaying, isPlaying } = useAudio();

  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // ========== دالة التنقل مع مهلة ==========
  const navigateWithDelay = (direction: 'next' | 'prev') => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    if (direction === 'next' && page < 604) {
      handlePageChange(page + 1);
    } else if (direction === 'prev' && page > 1) {
      handlePageChange(page - 1);
    }
    
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    navigationTimeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
    }, 500);
  };

  // ========== التنقل بالنقر المزدوج في وضع ملء الشاشة ==========
  const handleDoubleTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!fullscreen) return;
    
    // منع التنقل إذا كان المستخدم يمرر (نمنع الحدث من الانتشار)
    e.stopPropagation();
    
    let clientX: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    const screenWidth = window.innerWidth;
    const third = screenWidth / 3;
    const now = Date.now();
    const timeDiff = now - lastTap;
    
    let side: 'left' | 'right' | null = null;
    if (clientX < third) side = 'left';
    else if (clientX > screenWidth - third) side = 'right';
    
    // نقر مزدوج على نفس الجانب
    if (timeDiff < 300 && timeDiff > 0 && lastTapPosition === side && !isNavigating) {
      if (side === 'right') {
        navigateWithDelay('next');
      } else if (side === 'left') {
        navigateWithDelay('prev');
      }
    }
    
    setLastTap(now);
    setLastTapPosition(side);
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

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col bg-background"
      style={{ height: '100dvh', overflow: 'hidden' }}
      dir="rtl"
    >
      {/* الشريط العلوي الموحد */}
      {!fullscreen && (
        <div className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-2 px-4 py-2">
            <div className="flex items-center gap-2">
              <Link to="/search" className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Search className="h-4.5 w-4.5" />
              </Link>
              <button onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button onClick={() => setSidebarOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Menu className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="font-ui text-sm text-muted-foreground">صفحة {page}</div>
              <button onClick={toggleFullscreen} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-ui text-xs transition-colors bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80">
                <Maximize2 className="h-3.5 w-3.5" />
                <span>ملء الشاشة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* زر ملء الشاشة العائم في وضع ملء الشاشة (للخروج) */}
      {fullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed top-4 right-4 z-50 flex items-center gap-1.5 rounded-lg bg-black/50 backdrop-blur-sm px-3 py-2 text-white hover:bg-black/70 transition-all"
          title="إلغاء ملء الشاشة"
        >
          <Minimize2 className="h-4 w-4" />
          <span className="text-sm">خروج</span>
        </button>
      )}

      {/* منطقة القراءة القابلة للتمرير */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        onScroll={handleScroll}
        onDoubleClick={handleDoubleTap}
        onTouchStart={(e) => {
          // نحتاج لتسجيل اللمس للنقر المزدوج
          const touch = e.touches[0];
          const now = Date.now();
          const side = touch.clientX < window.innerWidth / 3 ? 'left' : 
                       touch.clientX > window.innerWidth * 2 / 3 ? 'right' : null;
          
          if (now - lastTap < 300 && lastTapPosition === side && !isNavigating && fullscreen) {
            if (side === 'right') navigateWithDelay('next');
            else if (side === 'left') navigateWithDelay('prev');
          }
          setLastTap(now);
          setLastTapPosition(side);
        }}
      >
        <QuranPageView 
          ayahs={data?.ayahs} 
          isLoading={isLoading}
          showTranslation={showTranslation}
          showTajweed={showTajweed}
        />
      </div>

      {/* شريط التنقل السفلي */}
      {!fullscreen && (
        <>
          <PageNavigation currentPage={page} onPageChange={handlePageChange} />
          <AudioPlayer />
        </>
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* الأزرار العائمة */}
      {!fullscreen && (
        <>
          <div className="fixed bottom-24 right-4 z-40 flex flex-col items-center gap-2">
            <div className="relative">
              {pageIsPlaying && <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />}
              <Button
                size="icon"
                onClick={handlePlayPage}
                disabled={!data?.ayahs?.length}
                className="rounded-full shadow-lg w-12 h-12 bg-primary hover:bg-primary/90"
              >
                {pageIsPlaying ? <Pause className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white mr-[-2px]" />}
              </Button>
            </div>
          </div>

          <div className="fixed bottom-24 left-4 z-40 flex flex-col gap-2">
            {showScrollTop && (
              <Button
                size="icon"
                variant="outline"
                onClick={scrollToTop}
                className="rounded-full border-primary/20 bg-card shadow-md hover:bg-primary/10 active:scale-95 w-9 h-9"
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
