// src/pages/HadithPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, Search, Loader2, Sparkles, 
  MessageSquare, Copy, Share2, Heart, AlertCircle,
  Send, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface HadithResult {
  text: string;
  narrator: string;
  source: string;
  number: number;
  grade: string;
  explanation?: string;
}

const exampleQueries = [
  'حديث عن الرحمة',
  'حديث عن الصلاة',
  'حديث عن الصدقة',
  'حديث عن بر الوالدين',
  'حديث عن حسن الخلق',
  'حديث عن العلم',
  'حديث عن التوبة',
  'حديث عن الجنة',
];

export default function HadithPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HadithResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const searchHadith = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      toast.warning('اكتب وصفاً للحديث الذي تبحث عنه');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // استدعاء API الأحاديث الجديد
      const response = await fetch('/functions/v1/hadith-api', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();
      
      if (data.success && data.hadith) {
        setResult(data.hadith);
        toast.success('تم العثور على الحديث');
      } else {
        setError(data.message || 'لم أتمكن من العثور على حديث مطابق');
        setSuggestions(exampleQueries.filter(q => q !== searchQuery).slice(0, 4));
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('حدث خطأ في الاتصال. تأكد من أن خادم الأحاديث يعمل بشكل صحيح.');
      toast.error('فشل البحث');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchHadith(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    searchHadith(suggestion);
  };

  const copyHadith = () => {
    if (result) {
      const text = `عن ${result.narrator} قال: ${result.text}\n\nالمصدر: ${result.source} رقم ${result.number}\nالدرجة: ${result.grade}`;
      navigator.clipboard.writeText(text);
      toast.success('تم نسخ الحديث');
    }
  };

  const shareHadith = () => {
    if (result) {
      const text = `عن ${result.narrator} قال: ${result.text}\n\nالمصدر: ${result.source} رقم ${result.number}`;
      if (navigator.share) {
        navigator.share({
          title: 'حديث نبوي شريف',
          text: text,
        });
      } else {
        copyHadith();
      }
    }
  };

  const saveHadith = () => {
    if (result) {
      // حفظ في localStorage مؤقتاً
      const saved = localStorage.getItem('saved-hadiths');
      const savedHadiths = saved ? JSON.parse(saved) : [];
      const exists = savedHadiths.some((h: any) => h.number === result.number && h.source === result.source);
      
      if (!exists) {
        savedHadiths.push(result);
        localStorage.setItem('saved-hadiths', JSON.stringify(savedHadiths));
        toast.success('تم حفظ الحديث');
      } else {
        toast.info('الحديث محفوظ مسبقاً');
      }
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-background to-primary/5" dir="rtl">
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-primary transition-transform hover:scale-105">
            <ChevronRight className="h-5 w-5" />
          </Link>
          <h1 className="font-ui text-lg font-bold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            موسوعة الأحاديث
          </h1>
          <div className="w-9" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="font-ui text-2xl font-bold mb-2">ابحث في الأحاديث النبوية</h2>
          <p className="font-ui text-muted-foreground">
            اكتب وصفاً للحديث الذي تبحث عنه، وسأقوم بإيجاده لك
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="مثال: أعطني حديثاً عن الرحمة"
                className="pr-10 py-6 font-ui text-right text-base"
                dir="rtl"
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !query.trim()}
              className="px-6 gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              بحث
            </Button>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="font-ui text-muted-foreground">جاري البحث عن الحديث...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-center space-y-3">
            <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
            <p className="font-ui text-destructive">{error}</p>
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="font-ui text-sm text-muted-foreground">جرب هذه العبارات:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestionClick(s)}
                      className="rounded-full border border-primary/20 px-3 py-1 text-sm hover:bg-primary/10 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Result State */}
        {result && !loading && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="rounded-2xl border border-primary/20 bg-card p-5 space-y-4 shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-primary/10">
                <span className="rounded-full bg-primary/10 px-3 py-1 font-ui text-sm font-bold text-primary">
                  {result.source} • رقم {result.number}
                </span>
                {result.grade && (
                  <span className={`rounded-full px-3 py-1 font-ui text-sm font-bold ${
                    result.grade.includes('صحيح') 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : result.grade.includes('حسن')
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {result.grade}
                  </span>
                )}
              </div>

              {/* Narrator */}
              <div>
                <p className="font-ui text-xs text-muted-foreground mb-1">عن</p>
                <p className="font-ui text-base font-semibold">{result.narrator}</p>
              </div>

              {/* Hadith Text */}
              <div className="bg-muted/30 rounded-xl p-5">
                <p className="font-ui text-lg leading-loose text-foreground">
                  {result.text}
                </p>
              </div>

              {/* Explanation */}
              {result.explanation && (
                <div className="pt-3 border-t border-primary/10">
                  <p className="font-ui text-xs text-muted-foreground mb-1">📝 شرح مختصر</p>
                  <p className="font-ui text-sm text-muted-foreground">{result.explanation}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={copyHadith} className="gap-2">
                  <Copy className="h-4 w-4" />
                  نسخ
                </Button>
                <Button variant="outline" size="sm" onClick={shareHadith} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  مشاركة
                </Button>
                <Button variant="outline" size="sm" onClick={saveHadith} className="gap-2">
                  <Heart className="h-4 w-4" />
                  حفظ
                </Button>
              </div>
            </div>

            {/* Try Another */}
            <div className="text-center pt-4">
              <button
                onClick={() => {
                  setQuery('');
                  setResult(null);
                  setError(null);
                }}
                className="font-ui text-sm text-primary hover:underline flex items-center gap-1 mx-auto"
              >
                ابحث عن حديث آخر ←
              </button>
            </div>
          </div>
        )}

        {/* Suggestions Cards */}
        {!result && !loading && !error && (
          <div className="mt-8">
            <p className="font-ui text-sm text-muted-foreground text-center mb-4">
              🔍 جرب البحث عن:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {exampleQueries.map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setQuery(example);
                    searchHadith(example);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-primary/10 bg-card p-3 text-right hover:bg-primary/5 hover:border-primary/30 transition-all active:scale-95"
                >
                  <MessageSquare className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="font-ui text-sm">{example}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
  }
