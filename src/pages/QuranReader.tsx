import { useParams, useNavigate } from 'react-router-dom';
import { useQuranPage } from '@/hooks/use-quran';
import { TopInfoBar } from '@/components/TopInfoBar';
import { QuranPageView } from '@/components/QuranPageView';
import { PageNavigation } from '@/components/PageNavigation';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QuranReader() {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const page = Math.max(1, Math.min(604, parseInt(pageNumber || '1', 10) || 1));
  const { data, isLoading } = useQuranPage(page);

  const handlePageChange = (newPage: number) => {
    navigate(`/page/${newPage}`, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      <TopInfoBar pageNumber={page} ayahs={data?.ayahs} />

      <div className="flex-1">
        <QuranPageView ayahs={data?.ayahs} isLoading={isLoading} />
      </div>

      <PageNavigation currentPage={page} onPageChange={handlePageChange} />

      {/* Home button */}
      <div className="fixed bottom-20 left-4 z-40">
        <Link to="/">
          <Button
            size="icon"
            variant="outline"
            className="rounded-full border-primary/20 bg-card shadow-md hover:bg-primary/10 active:scale-95"
          >
            <Home className="h-4 w-4 text-primary" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
