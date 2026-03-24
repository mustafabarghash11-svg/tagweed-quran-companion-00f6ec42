import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Brain, Bookmark, Target } from 'lucide-react';
import { useBookmarks } from '@/context/BookmarksContext.tsx';
import { toArabicNumeral } from '@/lib/quran-api';

const navItems = [
  { to: '/', icon: Home, label: 'الرئيسية' },
  { to: '/surah', icon: BookOpen, label: 'السور' },
  { to: '/khatma', icon: Target, label: 'الختمة' },
  { to: '/memorize', icon: Brain, label: 'الحفظ' },
  { to: '/bookmarks', icon: Bookmark, label: 'المحفوظات' },
];

export function BottomNav() {
  const location = useLocation();
  const { bookmarks } = useBookmarks();

  // لا تظهر في صفحة القراءة عشان ما تتعارض مع PageNavigation
  if (location.pathname.startsWith('/page/')) return null;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 border-t border-primary/15 bg-card/95 backdrop-blur-md"
      dir="rtl"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {/* نقطة نشاط */}
              {isActive && (
                <span className="absolute top-0 inset-x-0 mx-auto h-0.5 w-6 rounded-full bg-primary" />
              )}

              <div className="relative">
                <item.icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {/* badge للمحفوظات */}
                {item.to === '/bookmarks' && bookmarks.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    {bookmarks.length > 9 ? '+٩' : toArabicNumeral(bookmarks.length)}
                  </span>
                )}
              </div>

              <span className={`font-ui text-[10px] ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
