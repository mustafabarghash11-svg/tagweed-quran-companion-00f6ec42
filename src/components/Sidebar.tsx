import { Link } from 'react-router-dom';
import { X, Home, Search, HelpCircle, Sparkles, Clock, Settings, BookOpen, Brain, BookMarked } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/', icon: Home, label: 'الرئيسية' },
  { path: '/search', icon: Search, label: 'البحث' },
  { path: '/quiz', icon: HelpCircle, label: 'أسئلة' },
  { path: '/ai', icon: Sparkles, label: 'AI' },
  { path: '/prayer-times', icon: Clock, label: 'الصلاة' },
  { path: '/memorize', icon: Brain, label: 'الحفظ' },
  { path: '/bookmarks', icon: BookMarked, label: 'العلامات' },
  { path: '/settings', icon: Settings, label: 'الإعدادات' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* الخلفية المظللة */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* القائمة الجانبية */}
      <div className="fixed right-0 top-0 z-50 h-full w-64 bg-card shadow-xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-primary/10 p-4">
          <h2 className="font-ui text-lg font-bold text-primary">القائمة</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex flex-col p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-right text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span className="font-ui text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
          }
