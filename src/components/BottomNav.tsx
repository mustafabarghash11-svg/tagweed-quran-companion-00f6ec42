import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Brain, Sparkles, HelpCircle } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'الرئيسية' },
  { to: '/surah', icon: BookOpen, label: 'السور' },
  { to: '/ai', icon: Sparkles, label: 'الذكاء AI' },
  { to: '/quiz', icon: HelpCircle, label: 'الاختبار' },
  { to: '/memorize', icon: Brain, label: 'الحفظ' },
];

export function BottomNav() {
  const location = useLocation();

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
              {isActive && (
                <span className="absolute top-0 inset-x-0 mx-auto h-0.5 w-6 rounded-full bg-primary" />
              )}
              <item.icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
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
