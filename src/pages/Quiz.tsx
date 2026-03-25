import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BookOpen, ScrollText, Scale, Landmark, Shield, Star,
  ArrowRight, CheckCircle2, XCircle, Loader2, ChevronRight, Home
} from "lucide-react";
import { toast } from "sonner";
import { toArabicNumeral } from "@/lib/quran-api";

// Types
interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

// Categories
const CATEGORIES = [
  { id: "quran",   label: "القرآن الكريم",    icon: BookOpen,  color: "text-emerald-600" },
  { id: "hadith",  label: "الحديث النبوي",    icon: ScrollText, color: "text-amber-600"  },
  { id: "fiqh",    label: "الفقه الإسلامي",   icon: Scale,     color: "text-blue-600"   },
  { id: "seerah",  label: "السيرة النبوية",   icon: Landmark,  color: "text-purple-600" },
  { id: "aqeedah", label: "العقيدة والتوحيد", icon: Shield,    color: "text-red-600"    },
  { id: "general", label: "ثقافة إسلامية",   icon: Star,      color: "text-orange-600" },
];

const DIFFICULTIES = [
  { id: "easy",   label: "سهل" },
  { id: "medium", label: "متوسط" },
  { id: "hard",   label: "صعب" },
] as const;

type Difficulty = "easy" | "medium" | "hard";

const optionLabels = ["أ", "ب", "ج", "د"];

type Screen = "home" | "setup" | "quiz" | "result";

export default function Quiz() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);

  const fetchQuestion = async (cat: string, diff: Difficulty, prevQuestions: string[]) => {
    setLoadingQuestion(true);
    setQuestion(null);
    setSelectedAnswer(null);
    setAnswered(false);

    try {
      const response = await fetch("/api/quiz-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: cat,
          difficulty: diff,
          previousQuestions: prevQuestions.slice(-10),
        }),
      });

      if (!response.ok) throw new Error("فشل في تحميل السؤال");

      const data = await response.json();
      setQuestion(data);
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ في تحميل السؤال");
      setScreen("home");
    } finally {
      setLoadingQuestion(false);
    }
  };

  const startSetup = (catId: string) => {
    setSelectedCategory(catId);
    setScreen("setup");
  };

  const startQuiz = () => {
    setSessionCorrect(0);
    setSessionTotal(0);
    setPreviousQuestions([]);
    setScreen("quiz");
    fetchQuestion(selectedCategory, difficulty, []);
  };

  const handleAnswer = (index: number) => {
    if (answered || !question) return;
    setSelectedAnswer(index);
    setAnswered(true);
    setSessionTotal(prev => prev + 1);
    
    const isCorrect = index === question.correct_index;
    if (isCorrect) {
      setSessionCorrect(prev => prev + 1);
    }
    
    // إضافة السؤال للقائمة لمنع التكرار
    setPreviousQuestions(prev => [...prev, question.question]);
    
    setScreen("result");
  };

  const goToNextQuestion = () => {
    setScreen("quiz");
    fetchQuestion(selectedCategory, difficulty, previousQuestions);
  };

  const catInfo = CATEGORIES.find(c => c.id === selectedCategory);
  const diffInfo = DIFFICULTIES.find(d => d.id === difficulty);

  // Home Screen
  if (screen === "home") {
    return (
      <div className="min-h-screen pb-24" dir="rtl">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <Link to="/">
            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full">
              <Home className="h-5 w-5 text-muted-foreground" />
            </Button>
          </Link>
          <h1 className="font-ui text-lg font-bold">الاختبارات الدينية</h1>
          <div className="w-9" />
        </div>

        <div className="mx-auto max-w-lg space-y-2.5 px-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => startSetup(cat.id)}
              className="group flex w-full items-center gap-4 rounded-xl border border-primary/10 bg-card p-4 text-right shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <cat.icon className={`h-5 w-5 ${cat.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-ui text-sm font-bold">{cat.label}</p>
                <p className="font-ui text-xs text-muted-foreground">اختبر معلوماتك في {cat.label}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-x-1" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Setup Screen
  if (screen === "setup") {
    return (
      <div className="min-h-screen pb-24 px-4 pt-6" dir="rtl">
        <div className="mx-auto max-w-lg space-y-5">
          <button
            onClick={() => setScreen("home")}
            className="flex items-center gap-1 font-ui text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="h-4 w-4" /> رجوع
          </button>

          <div className="flex items-center gap-3">
            {catInfo && (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <catInfo.icon className={`h-5 w-5 ${catInfo.color}`} />
              </div>
            )}
            <h2 className="font-ui text-lg font-bold">{catInfo?.label}</h2>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <p className="font-ui text-sm font-bold">مستوى الصعوبة</p>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map(d => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={`rounded-xl border-2 py-3 transition-all font-ui text-sm ${
                    difficulty === d.id
                      ? 'border-primary bg-primary/10 font-bold text-primary'
                      : 'border-primary/10 bg-card'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={startQuiz} className="w-full py-6 font-ui text-base gap-2">
            ابدأ الاختبار <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Quiz Screen
  if (screen === "quiz") {
    return (
      <div className="flex min-h-screen flex-col px-4 pt-6 pb-24" dir="rtl">
        <div className="mx-auto w-full max-w-lg space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setScreen("home")}
              className="flex items-center gap-1 font-ui text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowRight className="h-4 w-4" /> رجوع
            </button>
            <div className="flex items-center gap-2">
              {sessionTotal > 0 && (
                <span className="font-ui text-sm text-muted-foreground">
                  {toArabicNumeral(sessionCorrect)}/{toArabicNumeral(sessionTotal)} صحيح
                </span>
              )}
              <span className="font-ui text-xs text-muted-foreground">{catInfo?.label}</span>
              <span className={`rounded-full px-2.5 py-1 font-ui text-xs font-bold ${
                difficulty === "easy" ? "bg-emerald-100 text-emerald-700" :
                difficulty === "medium" ? "bg-amber-100 text-amber-700" :
                "bg-red-100 text-red-700"
              }`}>
                {diffInfo?.label}
              </span>
            </div>
          </div>

          {loadingQuestion ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="font-ui text-sm text-muted-foreground">جاري إنشاء السؤال...</p>
            </div>
          ) : question ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/10 bg-card p-5 shadow-sm">
                <p className="font-ui text-base font-semibold leading-relaxed text-right">
                  {question.question}
                </p>
              </div>
              <div className="space-y-2.5">
                {question.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={answered}
                    className={`flex w-full items-center gap-3 rounded-xl border p-4 text-right font-ui text-sm transition-all active:scale-[0.98] ${
                      answered
                        ? i === question.correct_index
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                          : i === selectedAnswer
                          ? "border-red-400 bg-red-50 dark:bg-red-950/30"
                          : "border-primary/10 bg-card opacity-40"
                        : "border-primary/10 bg-card hover:border-primary/30 hover:shadow-sm"
                    }`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                      answered && i === question.correct_index
                        ? "bg-emerald-500 text-white"
                        : answered && i === selectedAnswer
                        ? "bg-red-400 text-white"
                        : "bg-primary/10 text-primary"
                    }`}>
                      {optionLabels[i]}
                    </span>
                    <span className="flex-1">{option}</span>
                    {answered && i === question.correct_index && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    )}
                    {answered && i === selectedAnswer && i !== question.correct_index && (
                      <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // Result Screen
  if (screen === "result" && question) {
    const isCorrect = selectedAnswer === question.correct_index;
    const accuracy = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;

    return (
      <div className="flex min-h-screen flex-col items-center px-4 pt-10 pb-24" dir="rtl">
        <div className="w-full max-w-lg space-y-5">
          <div className="flex flex-col items-center gap-2">
            {isCorrect ? (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-9 w-9 text-emerald-600" />
                </div>
                <h2 className="font-ui text-2xl font-bold text-emerald-700">إجابة صحيحة! 🎉</h2>
              </>
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <XCircle className="h-9 w-9 text-red-500" />
                </div>
                <h2 className="font-ui text-2xl font-bold text-red-600">إجابة خاطئة</h2>
                <p className="font-ui text-sm text-muted-foreground">
                  الإجابة الصحيحة: {question.options[question.correct_index]}
                </p>
              </>
            )}
          </div>

          {/* Session stats */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-card border border-primary/10 py-3">
              <p className="font-ui text-2xl font-bold text-primary">{toArabicNumeral(sessionTotal)}</p>
              <p className="font-ui text-xs text-muted-foreground">إجمالي الأسئلة</p>
            </div>
            <div className="rounded-xl bg-card border border-primary/10 py-3">
              <p className="font-ui text-2xl font-bold text-primary">{toArabicNumeral(accuracy)}%</p>
              <p className="font-ui text-xs text-muted-foreground">نسبة الإجابات الصحيحة</p>
            </div>
          </div>

          {/* Explanation */}
          <div className="rounded-xl border border-primary/10 bg-card p-5 shadow-sm">
            <h3 className="mb-2 font-ui text-sm font-bold text-primary">الشرح</h3>
            <p className="font-ui text-sm leading-relaxed">{question.explanation}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={goToNextQuestion} className="flex-1 gap-2 py-5 font-ui active:scale-[0.97]">
              سؤال تالي <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setScreen("home")} className="gap-2 border-primary/15 py-5 font-ui">
              الفئات
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
    }
