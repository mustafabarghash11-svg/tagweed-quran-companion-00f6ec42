import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Sparkles, Settings, Clock, HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', icon: Home, label: 'الرئيسية' },
  { path: '/search', icon: BookOpen, label: 'البحث' },
  { path: '/quiz', icon: HelpCircle, label: 'أسئلة' },
  { path: '/ai', icon: Sparkles, label: 'AI' },
  { path: '/prayer-times', icon: Clock, label: 'الصلاة' },
  { path: '/settings', icon: Settings, label: 'الإعدادات' },
];

interface BottomNavProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export function BottomNav({ isVisible = true, onToggle }: BottomNavProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => {
    setCollapsed(!collapsed);
    if (onToggle) onToggle();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* القائمة الرئيسية */}
      <nav
        className={`bg-card/95 backdrop-blur-lg border-t border-primary/10 transition-all duration-300 ${
          collapsed ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 transition-all ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary/70'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-ui text-[11px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* زر الإخفاء/الإظهار - أسفل القائمة مباشرة */}
      <button
        onClick={handleToggle}
        className="absolute -top-7 left-1/2 -translate-x-1/2 flex h-7 w-14 items-center justify-center rounded-t-xl bg-card border border-primary/20 border-b-0 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all shadow-sm"
        title={collapsed ? 'إظهار القائمة' : 'إخفاء القائمة'}
      >
        {collapsed ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
