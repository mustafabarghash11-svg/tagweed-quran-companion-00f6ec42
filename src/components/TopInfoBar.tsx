import { toArabicNumeral } from '@/lib/quran-api';
import type { Ayah } from '@/lib/quran-api';
import { useSettings } from '@/context/SettingsContext.tsx';
import { Sun, Moon, Search, Minus, Plus, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TopInfoBarProps {
  pageNumber: number;
  ayahs?: Ayah[];
  onMenuClick?: () => void;
}

export function TopInfoBar({ pageNumber, ayahs, onMenuClick }: TopInfoBarProps) {
  const { theme, toggleTheme, fontSize, setFontSize } = useSettings();

  if (!ayahs || ayahs.length === 0) return null;

  const surahNames = [...new Set(ayahs.map((a) => a.surah.name))];
  const juz = ayahs[0]?.juz;
  const firstAyah = ayahs[0]?.numberInSurah;
  const lastAyah = ayahs[ayahs.length - 1]?.numberInSurah;

  return (
    <div className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm" dir="rtl">
      {/* Main info row */}
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2 font-ui text-sm">
        <span className="font-bold text-primary">
          جزء {toArabicNumeral(juz)}
        </span>
        <span className="text-center font-semibold text-foreground">
          {surahNames.join(' - ')}
        </span>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-xs">
            {toArabicNumeral(firstAyah)}–{toArabicNumeral(lastAyah)}
          </span>
          <span className="font-bold text-primary">{toArabicNumeral(pageNumber)}</span>
        </div>
      </div>

      {/* Controls row */}
      <div className="mx-auto flex max-w-3xl items-center justify-between border-t border-primary/10 px-4 py-1.5">
        {/* Font size */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFontSize(fontSize - 2)}
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="font-ui text-xs text-muted-foreground w-6 text-center">{fontSize}</span>
          <button
            onClick={() => setFontSize(fontSize + 2)}
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {/* Search + Dark mode + Menu */}
        <div className="flex items-center gap-2">
          <Link
            to="/search"
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={toggleTheme}
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Menu className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
