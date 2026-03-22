import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toArabicNumeral } from '@/lib/quran-api';
import { useState } from 'react';

interface PageNavigationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function PageNavigation({ currentPage, onPageChange }: PageNavigationProps) {
  const [jumpValue, setJumpValue] = useState('');

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(jumpValue);
    if (page >= 1 && page <= 604) {
      onPageChange(page);
      setJumpValue('');
    }
  };

  return (
    <div className="border-t border-primary/20 bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        {/* RTL: next page is to the right (lower page number visually), prev is left */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(Math.min(604, currentPage + 1))}
          disabled={currentPage >= 604}
          className="text-primary hover:bg-primary/10 active:scale-95"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        <form onSubmit={handleJump} className="flex items-center gap-2">
          <span className="font-ui text-sm text-muted-foreground">
            صفحة {toArabicNumeral(currentPage)} من ٦٠٤
          </span>
          <Input
            type="number"
            min={1}
            max={604}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            placeholder="انتقل"
            className="h-8 w-20 text-center text-sm"
          />
        </form>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="text-primary hover:bg-primary/10 active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
