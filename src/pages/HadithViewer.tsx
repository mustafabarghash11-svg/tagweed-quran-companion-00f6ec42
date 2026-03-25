import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Loader2, AlertCircle, Copy, Share2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface HadithDetail {
  id: number;
  hadith_number: number;
  title: string;
  body: string;
  narrator: string;
  grade: string;
  reference: string;
  collection_name: string;
}

export default function HadithViewer() {
  const { id } = useParams();
  const [hadith, setHadith] = useState<HadithDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = 'YOUR_API_KEY_HERE';

  useEffect(() => {
    const fetchHadith = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.sunnah.com/v1/hadiths/${id}`, {
          headers: { 'X-API-Key': API_KEY }
        });
        if (!res.ok) throw new Error('فشل تحميل الحديث');
        const data = await res.json();
        setHadith(data.data);
      } catch (err) {
        setError('حدث خطأ في تحميل الحديث');
        toast.error('فشل تحميل الحديث');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchHadith();
  }, [id]);

  const copyHadith = () => {
    if (hadith) {
      navigator.clipboard.writeText(hadith.body);
      toast.success('تم نسخ الحديث');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !hadith) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" dir="rtl">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="font-ui text-muted-foreground">{error || 'الحديث غير موجود'}</p>
        <Link to="/hadith">
          <Button>العودة للأحاديث</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link to="/hadith" className="text-primary">
            <ChevronRight className="h-5 w-5" />
          </Link>
          <h1 className="font-ui text-lg font-bold">الحديث الشريف</h1>
          <div className="flex-1" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-2xl border border-primary/20 bg-card p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-primary/10">
            <span className="rounded-full bg-primary/10 px-3 py-1 font-ui text-sm font-bold text-primary">
              حديث رقم {hadith.hadith_number}
            </span>
            {hadith.grade && (
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/30 px-3 py-1 font-ui text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {hadith.grade}
              </span>
            )}
          </div>

          <div>
            <p className="font-ui text-xs text-muted-foreground mb-1">عن</p>
            <p className="font-ui text-base font-semibold">{hadith.narrator}</p>
          </div>

          <div className="bg-muted/30 rounded-xl p-5">
            <p className="font-ui text-lg leading-loose text-foreground">
              {hadith.body}
            </p>
          </div>

          <div className="pt-3 border-t border-primary/10">
            <p className="font-ui text-xs text-muted-foreground">
              المصدر: {hadith.reference || hadith.collection_name}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={copyHadith} className="gap-2">
              <Copy className="h-4 w-4" />
              نسخ
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              مشاركة
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Heart className="h-4 w-4" />
              حفظ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
          }
