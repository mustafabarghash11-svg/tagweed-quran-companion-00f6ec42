import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, XCircle, ChevronRight, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { toArabicNumeral } from '@/lib/quran-api';
import { QUESTIONS, getRandomQuestions, getQuestionsByCategory, getQuestionsByDifficulty } from '@/data/questions';

const CATEGORIES = ['الكل', 'القرآن الكريم', 'الحديث النبوي', 'الفقه', 'السيرة', 'العقيدة'];
const DIFFICULTIES = ['الكل', 'سهل', 'متوسط', 'صعب'];

export default function Quiz() {
  const [questions, setQuestions] = useState(QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [category, setCategory] = useState('الكل');
  const [difficulty, setDifficulty] = useState('الكل');
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState(QUESTIONS);

  const currentQuestion = quizQuestions[currentIndex];
  const isLastQuestion = currentIndex === quizQuestions.length - 1;

  // فلترة الأسئلة
  useEffect(() => {
    let filtered = [...QUESTIONS];
    
    if (category !== 'الكل') {
      filtered = getQuestionsByCategory(category);
    }
    
    if (difficulty !== 'الكل') {
      filtered = getQuestionsByDifficulty(difficulty);
    }
    
    setQuestions(filtered);
  }, [category, difficulty]);

  const startQuiz = () => {
    if (questions.length === 0) {
      toast.error('لا توجد أسئلة في هذه الفئة');
      return;
    }
    
    const randomQuestions = [...questions].sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuizQuestions(randomQuestions);
    setQuizStarted(true);
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setAnswered(false);
  };

  const handleAnswer = (index: number) => {
    if (answered) return;
    
    setSelectedAnswer(index);
    setAnswered(true);
    
    const isCorrect = index === currentQuestion.correct;
    if (isCorrect) {
      setScore(prev => prev + 1);
      toast.success('✓ إجابة صحيحة!');
    } else {
      toast.error('✗ إجابة خاطئة');
    }
  };

  const nextQuestion = () => {
    if (isLastQuestion) {
      setShowResult(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setScore(0);
    setShowResult(false);
  };

  // صفحة البداية
  if (!quizStarted) {
    return (
      <div className="min-h-screen pb-24" dir="rtl">
        <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            <Link to="/" className="text-primary transition-transform hover:scale-105 active:scale-95">
              <ArrowRight className="h-5 w-5" />
            </Link>
            <h1 className="font-ui text-lg font-bold">الاختبارات الدينية</h1>
          </div>
        </header>

        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="rounded-2xl border border-primary/20 bg-card p-6 space-y-6">
            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-3">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-ui text-xl font-bold">اختبر معلوماتك الإسلامية</h2>
              <p className="font-ui text-sm text-muted-foreground mt-1">
                {toArabicNumeral(QUESTIONS.length)} سؤال متاح
              </p>
            </div>

            {/* الفئات */}
            <div>
              <p className="font-ui text-sm font-bold mb-2">الفئة</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                      category === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-primary/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* الصعوبة */}
            <div>
              <p className="font-ui text-sm font-bold mb-2">مستوى الصعوبة</p>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                      difficulty === diff
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-primary/10'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* إحصائيات */}
            <div className="rounded-xl bg-muted/30 p-4">
              <div className="flex justify-between text-center">
                <div>
                  <p className="font-ui text-2xl font-bold text-primary">{toArabicNumeral(questions.length)}</p>
                  <p className="font-ui text-xs text-muted-foreground">سؤال متاح</p>
                </div>
                <div>
                  <p className="font-ui text-2xl font-bold text-primary">10</p>
                  <p className="font-ui text-xs text-muted-foreground">سؤال في الاختبار</p>
                </div>
              </div>
            </div>

            <Button onClick={startQuiz} className="w-full py-6 text-base">
              ابدأ الاختبار
            </Button>

            {/* معلومات */}
            <div className="text-center text-xs text-muted-foreground">
              <p>سيتم اختيار 10 أسئلة عشوائية من الفئة المختارة</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // صفحة النتيجة
  if (showResult) {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    
    return (
      <div className="min-h-screen pb-24" dir="rtl">
        <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            <button onClick={resetQuiz} className="text-primary">
              <ArrowRight className="h-5 w-5" />
            </button>
            <h1 className="font-ui text-lg font-bold">النتيجة</h1>
          </div>
        </header>

        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="rounded-2xl border border-primary/20 bg-card p-6 text-center space-y-4">
            <div className={`inline-flex h-20 w-20 items-center justify-center rounded-full ${
              percentage >= 70 ? 'bg-green-500/20' : percentage >= 50 ? 'bg-amber-500/20' : 'bg-red-500/20'
            }`}>
              {percentage >= 70 ? (
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              ) : percentage >= 50 ? (
                <CheckCircle2 className="h-10 w-10 text-amber-500" />
              ) : (
                <XCircle className="h-10 w-10 text-red-500" />
              )}
            </div>
            
            <div>
              <p className="font-ui text-4xl font-bold text-primary">{toArabicNumeral(percentage)}%</p>
              <p className="font-ui text-sm text-muted-foreground mt-1">
                {toArabicNumeral(score)} من {toArabicNumeral(quizQuestions.length)} إجابات صحيحة
              </p>
            </div>

            <div className="rounded-xl bg-muted/30 p-4">
              <p className="font-ui text-sm">
                {percentage >= 80 ? 'ممتاز! 🎉' :
                 percentage >= 60 ? 'جيد جداً! 👍' :
                 percentage >= 40 ? 'جيد، يمكنك التحسين 💪' :
                 'استمر في التعلم، ستحقق أفضل 📚'}
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={startQuiz} className="flex-1 gap-2">
                <RefreshCw className="h-4 w-4" />
                إعادة الاختبار
              </Button>
              <Button variant="outline" onClick={resetQuiz} className="flex-1 gap-2">
                <Home className="h-4 w-4" />
                الرئيسية
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // صفحة الأسئلة
  return (
    <div className="min-h-screen pb-24" dir="rtl">
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <button onClick={resetQuiz} className="text-primary">
            <ArrowRight className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-ui text-sm text-muted-foreground">
              {toArabicNumeral(currentIndex + 1)} / {toArabicNumeral(quizQuestions.length)}
            </span>
          </div>
          <div className="w-9" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="space-y-6">
          {/* السؤال */}
          <div className="rounded-2xl border border-primary/20 bg-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {currentQuestion.category}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${
                currentQuestion.difficulty === 'easy' ? 'bg-green-500/10 text-green-600' :
                currentQuestion.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-600' :
                'bg-red-500/10 text-red-600'
              }`}>
                {currentQuestion.difficulty === 'easy' ? 'سهل' :
                 currentQuestion.difficulty === 'medium' ? 'متوسط' : 'صعب'}
              </span>
            </div>
            <p className="font-ui text-lg font-semibold leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          {/* الخيارات */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={answered}
                className={`w-full rounded-xl border p-4 text-right transition-all ${
                  answered
                    ? i === currentQuestion.correct
                      ? 'border-green-500 bg-green-500/10'
                      : i === selectedAnswer
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-primary/10 bg-card opacity-50'
                    : 'border-primary/10 bg-card hover:border-primary/30 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    answered && i === currentQuestion.correct
                      ? 'bg-green-500 text-white'
                      : answered && i === selectedAnswer
                      ? 'bg-red-500 text-white'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {String.fromCharCode(1570 + i)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {answered && i === currentQuestion.correct && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {answered && i === selectedAnswer && i !== currentQuestion.correct && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* التفسير */}
          {answered && (
            <div className="rounded-xl bg-muted/30 p-4">
              <p className="font-ui text-xs text-primary mb-1">📖 الشرح</p>
              <p className="font-ui text-sm">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* زر التالي */}
          {answered && (
            <Button onClick={nextQuestion} className="w-full py-5 text-base">
              {isLastQuestion ? 'عرض النتيجة' : 'السؤال التالي'}
              <ChevronRight className="mr-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
    }
