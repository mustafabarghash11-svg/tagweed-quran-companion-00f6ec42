import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Brain, Sparkles, Settings, Clock } from 'lucide-react'; // أضف Clock

const navItems = [
  { path: '/', icon: Home, label: 'الرئيسية' },
  { path: '/search', icon: BookOpen, label: 'البحث' },
  { path: '/memorize', icon: Brain, label: 'الحفظ' },
  { path: '/ai', icon: Sparkles, label: 'AI' },
  { path: '/prayer-times', icon: Clock, label: 'الصلاة' }, // <-- أضف هذا السطر
  { path: '/settings', icon: Settings, label: 'الإعدادات' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary/10 bg-card/95 backdrop-blur-lg">
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
  );
}                  : 'text-muted-foreground hover:text-foreground'
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
