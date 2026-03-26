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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-primary/10">
      {/* زر الإخفاء/الإظهار */}
      <div className="flex justify-center -mt-3">
        <button
          onClick={handleToggle}
          className="flex h-6 w-12 items-center justify-center rounded-full bg-card border border-primary/20 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
        >
          {collapsed ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* عناصر القائمة */}
      <div className={`transition-all duration-300 overflow-hidden ${collapsed ? 'h-0 py-0' : 'h-auto py-2'}`}>
        <div className="mx-auto flex max-w-md items-center justify-around px-2">
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
      </div>
    </div>
  );
}
