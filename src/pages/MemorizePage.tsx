import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, XCircle, Trophy, RotateCcw, Star } from 'lucide-react';
import { useSurahs } from '@/hooks/use-quran';
import { toArabicNumeral } from '@/lib/quran-api';
import { Skeleton } from '@/components/ui/skeleton';

interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  surahNumber?: number;
}

interface SurahFull {
  number: number;
  name: string;
  ayahs: Ayah[];
}

// كاش السور المحملة عشان نجيب خيارات من سور أخرى
const surahCache: Record<number, SurahFull> = {};

async function fetchSurah(number: number): Promise<SurahFull> {
  if (surahCache[number]) return surahCache[number];
  const res = await fetch(`https://api.alquran.cloud/v1/surah/${number}/quran-uthmani`);
  const json = await res.json();
  const data: SurahFull = {
    number: json.data.number,
    name: json.data.name,
    ayahs: json.data.ayahs.map((a: any) => ({
      number: a.number,
      numberInSurah: a.numberInSurah,
      text: a.text,
      surahNumber: json.data.number,
    })),
  };
  surahCache[number] = data;
  return data;
}

// جلب سور قريبة للخيارات الغلط
async function fetchNearbyAyahs(surahNumber: number): Promise<Ayah[]> {
  const nearby: number[] = [];
  // 2 سور قريبة + سورة بعيدة
  if (surahNumber > 1) nearby.push(surahNumber - 1);
  if (surahNumber < 114) nearby.push(surahNumber + 1);
  // سورة عشوائية بعيدة
  let far = Math.floor(Math.random() * 114) + 1;
  while (Math.abs(far - surahNumber) < 3) far = Math.floor(Math.random() * 114) + 1;
  nearby.push(far);

  const results = await Promise.all(nearby.map((n) => fetchSurah(n).catch(() => null)));
  return results.flatMap((s) => s?.ayahs ?? []);
}

// بناء خيارات غلط متشابهة — مزيج من السورة ومن غيرها
function buildWrongOptions(correct: Ayah, sameSurah: Ayah[], otherAyahs: Ayah[]): Ayah[] {
  const notCorrect = (a: Ayah) => a.number !== correct.number;

  // آيات قريبة بالترتيب من نفس السورة (تشابه عالي)
  const nearbyInSurah = sameSurah
    .filter(notCorrect)
    .filter((a) => Math.abs(a.numberInSurah - correct.numberInSurah) <= 5)
    .sort(() => Math.random() - 0.5);

  // آيات من سور أخرى
  const fromOther = otherAyahs.filter(notCorrect).sort(() => Math.random() - 0.5);

  // 2 من السورة + 1 من غيرها
  const pool: Ayah[] = [];
  pool.push(...nearbyInSurah.slice(0, 2));
  pool.push(...fromOther.slice(0, 1));

  // لو ما كفت من السورة، عوّض من غيرها
  if (pool.length < 3) {
    const extra = [...nearbyInSurah, ...fromOther].filter((a) => !pool.includes(a));
    pool.push(...extra.slice(0, 3 - pool.length));
  }

  return pool.slice(0, 3);
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// تقييم مستوى الحفظ
function calcLevel(correct: number, total: number): { label: string; color: string; stars: number } {
  const pct = total > 0 ? correct / total : 0;
  if (pct >= 0.9) return { label: 'ممتاز', color: 'text-green-500', stars: 3 };
  if (pct >= 0.7) return { label: 'جيد', color: 'text-primary', stars: 2 };
  return { label: 'يحتاج مراجعة', color: 'text-red-500', stars: 1 };
}

// localStorage helpers
const MISTAKES_KEY = (n: number) => `tagweed-mistakes-${n}`;
const PROGRESS_KEY = (n: number) => `tagweed-memorize-${n}`;

function loadMistakes(surahNumber: number): number[] {
  try { return JSON.parse(localStorage.getItem(MISTAKES_KEY(surahNumber)) || '[]'); }
  catch { return []; }
}

function saveMistakes(surahNumber: number, mistakes: number[]) {
  localStorage.setItem(MISTAKES_KEY(surahNumber), JSON.stringify([...new Set(mistakes)]));
}

function loadProgress(n: number) {
  try {
    const s = localStorage.getItem(PROGRESS_KEY(n));
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function saveProgress(p: { surahNumber: number; lastAyahIndex: number; correct: number; wrong: number }) {
  localStorage.setItem(PROGRESS_KEY(p.surahNumber), JSON.stringify(p));
}

function clearProgress(n: number) {
  localStorage.removeItem(PROGRESS_KEY(n));
}

type Phase = 'select' | 'loading' | 'quiz' | 'result';

export default function MemorizePage() {
  const { data: surahs, isLoading: surahsLoading } = useSurahs();
  const [phase, setPhase] = useState<Phase>('select');
  const [surahData, setSurahData] = useState<SurahFull | null>(null);
  const [otherAyahs, setOtherAyahs] = useState<Ayah[]>([]);

  // ترتيب الأسئلة: الأخطاء أولاً ثم باقي السورة
  const [queue, setQueue] = useState<Ayah[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);

  const [options, setOptions] = useState<Ayah[]>([]);
  const [chosen, setChosen] = useState<Ayah | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [mistakes, setMistakes] = useState<number[]>([]); // أرقام الآيات اللي غلط فيها

  const buildQuestion = useCallback((currentAyah: Ayah, sameSurah: Ayah[], others: Ayah[]) => {
    const wrongOpts = buildWrongOptions(currentAyah, sameSurah, others);
    setOptions(shuffle([currentAyah, ...wrongOpts]));
    setChosen(null);
  }, []);

  const startQuiz = useCallback(async (surahNum: number, fromIndex = 0, prevCorrect = 0, prevWrong = 0) => {
    setPhase('loading');
    try {
      const [data, others] = await Promise.all([
        fetchSurah(surahNum),
        fetchNearbyAyahs(surahNum),
      ]);
      setSurahData(data);
      setOtherAyahs(others);
      setCorrect(prevCorrect);
      setWrong(prevWrong);

      const savedMistakes = loadMistakes(surahNum);
      setMistakes(savedMistakes);

      // الآيات دائماً بالترتيب الأصلي — الأخطاء تُميَّز بشارة فقط ولا تُقدَّم
      const fullQueue = data.ayahs.slice(fromIndex);

      setQueue(fullQueue);
      setQueueIndex(0);
      buildQuestion(fullQueue[0], data.ayahs, others);
      setPhase('quiz');
    } catch {
      setPhase('select');
    }
  }, [buildQuestion]);

  const handleAnswer = (ayah: Ayah) => {
    if (chosen || !surahData || !queue[queueIndex]) return;
    setChosen(ayah);
    const isCorrect = ayah.number === queue[queueIndex].number;

    if (isCorrect) {
      setCorrect((c) => c + 1);
      // إزالة من قائمة الأخطاء لو كانت فيها
      const newMistakes = mistakes.filter((n) => n !== queue[queueIndex].number);
      setMistakes(newMistakes);
      saveMistakes(surahData.number, newMistakes);
    } else {
      setWrong((w) => w + 1);
      // أضف للأخطاء
      const newMistakes = [...mistakes, queue[queueIndex].number];
      setMistakes(newMistakes);
      saveMistakes(surahData.number, newMistakes);
    }
  };

  const handleNext = () => {
    if (!surahData || !queue[queueIndex]) return;
    const nextIndex = queueIndex + 1;

    if (nextIndex >= queue.length) {
      clearProgress(surahData.number);
      setPhase('result');
      return;
    }

    saveProgress({
      surahNumber: surahData.number,
      lastAyahIndex: nextIndex,
      correct,
      wrong,
    });

    setQueueIndex(nextIndex);
    buildQuestion(queue[nextIndex], surahData.ayahs, otherAyahs);
  };

  const handleRestart = () => {
    if (!surahData) return;
    clearProgress(surahData.number);
    startQuiz(surahData.number);
  };

  // ---- شاشة اختيار السورة ----
  if (phase === 'select') {
    return (
      <div className="min-h-screen" dir="rtl">
        <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            <Link to="/" className="text-primary transition-transform hover:scale-105 active:scale-95">
              <ArrowRight className="h-5 w-5" />
            </Link>
            <h1 className="font-ui text-lg font-bold">نظام الحفظ</h1>
          </div>
        </header>

        <div className="mx-auto max-w-2xl px-4 py-6">
          <p className="mb-4 font-ui text-sm text-muted-foreground text-center">
            اختر سورة لتبدأ مراجعة حفظك
          </p>

          {surahsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {surahs?.map((surah) => {
                const progress = loadProgress(surah.number);
                const mistakeCount = loadMistakes(surah.number).length;
                const progressPercent = progress
                  ? Math.round((progress.lastAyahIndex / surah.numberOfAyahs) * 100)
                  : 0;
                const hasProgress = !!progress;

                return (
                  <div
                    key={surah.number}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-primary/5 transition-colors"
                  >
                    <button
                      className="flex flex-1 items-center gap-3 text-right"
                      onClick={() => {
                        if (!hasProgress) startQuiz(surah.number);
                      }}
                    >
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 font-ui text-sm font-bold text-primary">
                        {toArabicNumeral(surah.number)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-ui text-base font-semibold leading-tight">{surah.name}</p>
                          {mistakeCount > 0 && (
                            <span className="rounded-full bg-red-500/10 px-1.5 py-0.5 font-ui text-[10px] font-bold text-red-500">
                              {toArabicNumeral(mistakeCount)} خطأ
                            </span>
                          )}
                        </div>
                        {hasProgress ? (
                          <div className="mt-0.5 flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${progressPercent}%` }} />
                            </div>
                            <span className="font-ui text-xs text-primary">{toArabicNumeral(progressPercent)}%</span>
                          </div>
                        ) : (
                          <p className="font-ui text-xs text-muted-foreground">
                            {toArabicNumeral(surah.numberOfAyahs)} آية
                          </p>
                        )}
                      </div>
                    </button>

                    {hasProgress ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => startQuiz(surah.number, progress!.lastAyahIndex, progress!.correct, progress!.wrong)}
                          className="rounded-lg px-2.5 py-1 font-ui text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          كمّل
                        </button>
                        <button
                          onClick={() => { clearProgress(surah.number); startQuiz(surah.number); }}
                          className="rounded-lg px-2.5 py-1 font-ui text-xs bg-muted text-muted-foreground hover:text-foreground"
                        >
                          جديد
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startQuiz(surah.number)}
                        className="rounded-lg px-2.5 py-1 font-ui text-xs border border-primary/20 text-primary hover:bg-primary/10"
                      >
                        ابدأ
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- شاشة التحميل ----
  if (phase === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center" dir="rtl">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="font-ui text-sm text-muted-foreground">جارٍ تحميل السورة...</p>
        </div>
      </div>
    );
  }

  // ---- شاشة النتيجة ----
  if (phase === 'result' && surahData) {
    const total = queue.length;
    const level = calcLevel(correct, total);

    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 gap-6" dir="rtl">
        <Trophy className="h-16 w-16 text-primary" />

        <div className="text-center space-y-1">
          <h2 className="font-ui text-2xl font-bold">انتهيت من سورة {surahData.name}</h2>
          <div className="flex items-center justify-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                className={`h-6 w-6 ${i < level.stars ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`}
              />
            ))}
          </div>
          <p className={`font-ui text-lg font-bold ${level.color}`}>{level.label}</p>
        </div>

        <div className="flex gap-6">
          <div className="text-center">
            <p className="font-ui text-3xl font-bold text-green-500">{toArabicNumeral(correct)}</p>
            <p className="font-ui text-xs text-muted-foreground">صحيح</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center">
            <p className="font-ui text-3xl font-bold text-red-500">{toArabicNumeral(wrong)}</p>
            <p className="font-ui text-xs text-muted-foreground">خطأ</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center">
            <p className="font-ui text-3xl font-bold text-primary">
              {toArabicNumeral(Math.round((correct / total) * 100))}%
            </p>
            <p className="font-ui text-xs text-muted-foreground">النسبة</p>
          </div>
        </div>

        {mistakes.length > 0 && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-center">
            <p className="font-ui text-sm text-red-500 font-bold">
              {toArabicNumeral(mistakes.length)} آية ستعود في الجلسة القادمة أول شي
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-ui text-sm font-bold text-primary-foreground hover:bg-primary/90 active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            أعد السورة
          </button>
          <Link
            to="/memorize"
            onClick={() => setPhase('select')}
            className="flex items-center gap-2 rounded-xl border border-primary/20 px-5 py-2.5 font-ui text-sm font-semibold hover:bg-primary/5 active:scale-95"
          >
            سورة أخرى
          </Link>
        </div>
      </div>
    );
  }

  // ---- شاشة الاختبار ----
  if (phase === 'quiz' && surahData && queue[queueIndex]) {
    const currentAyah = queue[queueIndex];
    const isMistakeAyah = mistakes.includes(currentAyah.number);
    const isCorrectAnswer = chosen?.number === currentAyah.number;
    const totalQ = queue.length;
    const progress = (queueIndex / totalQ) * 100;

    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            <button onClick={() => setPhase('select')} className="text-primary">
              <ArrowRight className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-ui text-sm font-bold">{surahData.name}</p>
                {isMistakeAyah && (
                  <span className="rounded-full bg-red-500/10 px-2 py-0.5 font-ui text-[10px] font-bold text-red-500">
                    مراجعة خطأ سابق
                  </span>
                )}
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-2 font-ui text-xs">
              <span className="text-green-500 font-bold">{toArabicNumeral(correct)}✓</span>
              <span className="text-red-500 font-bold">{toArabicNumeral(wrong)}✗</span>
              <span className="text-muted-foreground">
                {toArabicNumeral(queueIndex + 1)}/{toArabicNumeral(totalQ)}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 mx-auto w-full max-w-2xl px-4 py-5 flex flex-col gap-4">
          {/* السؤال */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-center">
            <p className="font-ui text-xs text-muted-foreground mb-1">
              آية {toArabicNumeral(currentAyah.numberInSurah)} من سورة {surahData.name}
            </p>
            <p className="font-ui text-sm font-bold text-primary">اختر الآية الصحيحة</p>
          </div>

          {/* الخيارات */}
          <div className="space-y-3">
            {options.map((option) => {
              const isChosen = chosen?.number === option.number;
              const isThisCorrect = option.number === currentAyah.number;

              let style = 'border-primary/15 bg-card hover:bg-primary/5 cursor-pointer';
              if (chosen) {
                if (isThisCorrect) style = 'border-green-500 bg-green-500/10 cursor-default';
                else if (isChosen) style = 'border-red-500 bg-red-500/10 cursor-default';
                else style = 'border-primary/10 bg-card opacity-40 cursor-default';
              }

              return (
                <button
                  key={option.number}
                  onClick={() => handleAnswer(option)}
                  disabled={!!chosen}
                  className={`w-full rounded-xl border-2 px-4 py-4 text-right transition-all active:scale-[0.98] ${style}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-quran text-lg leading-loose flex-1">{option.text}</p>
                    {chosen && isThisCorrect && <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />}
                    {chosen && isChosen && !isThisCorrect && <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-1" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* نتيجة + زر التالي */}
          {chosen && (
            <div className="space-y-3">
              <div className={`rounded-xl px-4 py-3 text-center font-ui text-sm font-bold ${
                isCorrectAnswer ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {isCorrectAnswer ? '✓ إجابة صحيحة!' : '✗ إجابة خاطئة — ستراجعها في الجلسة القادمة'}
              </div>
              <button
                onClick={handleNext}
                className="w-full rounded-xl bg-primary py-3 font-ui text-sm font-bold text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
              >
                {queueIndex + 1 >= totalQ ? 'عرض النتيجة' : 'التالي ←'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
