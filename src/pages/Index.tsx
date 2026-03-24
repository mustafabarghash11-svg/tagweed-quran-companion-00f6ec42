import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Layers, FileText, Bookmark, Search, Sun, Moon, Menu, Brain, ChevronLeft, Target, User, LogIn } from 'lucide-react';
import { useSurahs } from '@/hooks/use-quran';
import { toArabicNumeral, SURAH_START_PAGES } from '@/lib/quran-api';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/context/SettingsContext.tsx';
import { useBookmarks } from '@/context/BookmarksContext.tsx';
import { useAuth } from '@/context/AuthContext.tsx';
import { Sidebar } from '@/components/Sidebar';

const navItems = [
  { to: '/page/1', icon: FileText, label: 'تصفح بالصفحة', desc: '٦٠٤ صفحة', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { to: '/surah', icon: BookOpen, label: 'تصفح بالسورة', desc: '١١٤ سورة', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { to: '/juz', icon: Layers, label: 'تصفح بالجزء', desc: '٣٠ جزء', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { to: '/memorize', icon: Brain, label: 'نظام الحفظ', desc: 'راجع حفظك', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  { to: '/khatma', icon: Target, label: 'خطة الختمة', desc: 'اختم القرآن', color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
];

// آخر صفحة مقروءة
function getLastPage(): number | null {
  const p = localStorage.getItem('tagweed-last-page');
  return p ? parseInt(p) : null;
}

export default function Index() {
  const { data: surahs, isLoading } = useSurahs();
  const { theme, toggleTheme } = useSettings();
  const { bookmarks } = useBookmarks();
  const { user, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const lastPage = getLastPage();

  return (
    <div className="min-h-screen pb-20" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2">
        <div className="flex items-center gap-1.5">
          <Link
            to="/search"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Search className="h-4.5 w-4.5" />
          </Link>
          <Link
            to="/bookmarks"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Bookmark className="h-4.5 w-4.5" />
            {bookmarks.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {bookmarks.length > 9 ? '+٩' : toArabicNumeral(bookmarks.length)}
              </span>
            )}
          </Link>
        </div>
        <div className="flex items-center gap-1.5">
          {user ? (
            <Link
              to="/profile"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <User className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <LogIn className="h-4 w-4" />
            </Link>
          )}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Hero */}
      <header className="flex flex-col items-center gap-2 px-4 py-8">
        <div className="mb-1 flex items-center gap-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40" />
          <h1 className="font-quran text-5xl text-primary md:text-6xl" style={{ lineHeight: '1.2' }}>
            تجويد
          </h1>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40" />
        </div>
        <p className="font-ui text-sm text-muted-foreground tracking-wide">القرآن الكريم</p>
      </header>

      {/* متابعة القراءة */}
      {lastPage && (
        <div className="mx-auto max-w-lg px-4 mb-5">
          <Link
            to={`/page/${lastPage}`}
            className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3.5 hover:bg-primary/10 transition-colors active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-ui text-sm font-bold text-primary">متابعة القراءة</p>
                <p className="font-ui text-xs text-muted-foreground">صفحة {toArabicNumeral(lastPage)}</p>
              </div>
            </div>
            <ChevronLeft className="h-4 w-4 text-primary/60" />
          </Link>
        </div>
      )}

      {/* Quick Nav */}
      <nav className="mx-auto grid max-w-lg grid-cols-2 gap-3 px-4 pb-6">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group flex items-center gap-3 rounded-2xl border border-primary/10 bg-card px-4 py-4 shadow-sm transition-all hover:shadow-md hover:border-primary/25 active:scale-[0.97]"
          >
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-ui text-sm font-bold leading-tight">{item.label}</p>
              <p className="font-ui text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </Link>
        ))}
      </nav>

      {/* فهرس السور */}
      <section className="mx-auto max-w-2xl px-4">
        <h2 className="mb-3 font-ui text-base font-bold text-foreground flex items-center gap-2">
          <span className="h-1 w-4 rounded-full bg-primary inline-block" />
          فهرس السور
        </h2>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 15 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {surahs?.map((surah) => (
              <Link
                key={surah.number}
                to={`/page/${SURAH_START_PAGES[surah.number - 1]}`}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-primary/5 active:scale-[0.98]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 font-ui text-sm font-bold text-primary">
                  {toArabicNumeral(surah.number)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-ui text-base font-semibold leading-tight truncate">
                    {surah.name}
                  </p>
                  <p className="font-ui text-xs text-muted-foreground">
                    {surah.englishName} · {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                  </p>
                </div>
                <div className="text-left flex-shrink-0">
                  <p className="font-ui text-xs text-muted-foreground">
                    {toArabicNumeral(surah.numberOfAyahs)} آية
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
