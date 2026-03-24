import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ScrollText,
  Scale,
  Landmark,
  Shield,
  Star,
  ArrowRight,
  Trophy,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  Home,
} from "lucide-react";
import { toast } from "sonner";

interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface CategoryScore {
  category: string;
  total_questions: number;
  correct_answers: number;
  total_points: number;
}

const CATEGORIES = [
  { id: "quran", label: "القرآن الكريم", icon: BookOpen, color: "text-emerald-600" },
  { id: "hadith", label: "الحديث النبوي", icon: ScrollText, color: "text-amber-600" },
  { id: "fiqh", label: "الفقه الإسلامي", icon: Scale, color: "text-blue-600" },
  { id: "seerah", label: "السيرة النبوية", icon: Landmark, color: "text-purple-600" },
  { id: "aqeedah", label: "العقيدة والتوحيد", icon: Shield, color: "text-red-600" },
  { id: "general", label: "ثقافة إسلامية", icon: Star, color: "text-orange-600" },
];

type Screen = "home" | "quiz" | "result";

export default function Quiz() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [screen, setScreen] = useState<Screen>("home");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [scores, setScores] = useState<CategoryScore[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  // Load scores
  useEffect(() => {
    if (!user) return;
    loadScores();
  }, [user]);

  const loadScores = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("quiz_scores")
      .select("*")
      .eq("user_id", user.id);

    if (data) {
      setScores(data as CategoryScore[]);
      setTotalPoints(data.reduce((sum: number, s: any) => sum + s.total_points, 0));
    }
  };

  const fetchQuestion = async (category: string) => {
    setLoadingQuestion(true);
    setQuestion(null);
    setSelectedAnswer(null);
    setAnswered(false);

    try {
      const { data, error } = await supabase.functions.invoke("quiz-generate", {
        body: { category },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setQuestion(data as QuizQuestion);
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ في تحميل السؤال");
      setScreen("home");
    } finally {
      setLoadingQuestion(false);
    }
  };

  const startQuiz = (categoryId: string) => {
    if (!user) {
      toast.error("سجل دخولك أولاً للمشاركة في الاختبار");
      navigate("/auth");
      return;
    }
    setSelectedCategory(categoryId);
    setScreen("quiz");
    fetchQuestion(categoryId);
  };

  const handleAnswer = async (index: number) => {
    if (answered || !question || !user) return;
    setSelectedAnswer(index);
    setAnswered(true);

    const isCorrect = index === question.correct_index;
    const points = isCorrect ? 1 : 0;

    setQuestionsAnswered((p) => p + 1);
    if (isCorrect) setTotalPoints((p) => p + 1);

    // Upsert score
    const existing = scores.find((s) => s.category === selectedCategory);
    if (existing) {
      await supabase
        .from("quiz_scores")
        .update({
          total_questions: existing.total_questions + 1,
          correct_answers: existing.correct_answers + points,
          total_points: existing.total_points + points,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("category", selectedCategory);
    } else {
      await supabase.from("quiz_scores").insert({
        user_id: user.id,
        category: selectedCategory,
        total_questions: 1,
        correct_answers: points,
        total_points: points,
      });
    }

    await loadScores();
    setScreen("result");
  };

  const getCategoryScore = (catId: string) => {
    return scores.find((s) => s.category === catId);
  };

  const optionLabels = ["أ", "ب", "ج", "د"];

  // Home screen
  if (screen === "home") {
    return (
      <div className="min-h-screen pb-16" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4">
          <Link to="/">
            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full">
              <Home className="h-5 w-5 text-muted-foreground" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="font-ui text-sm font-bold text-primary">
              {totalPoints} نقطة
            </span>
          </div>
        </div>

        <header className="flex flex-col items-center gap-2 px-4 pb-6 pt-6">
          <h1 className="font-quran text-4xl text-primary" style={{ lineHeight: "1.1" }}>
            اختبر معلوماتك
          </h1>
          <p className="font-ui text-sm text-muted-foreground">
            اختر فئة وابدأ الاختبار
          </p>
        </header>

        <div className="mx-auto max-w-lg space-y-3 px-4">
          {CATEGORIES.map((cat) => {
            const score = getCategoryScore(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => startQuiz(cat.id)}
                className="group flex w-full items-center gap-4 rounded-xl border border-primary/10 bg-card p-4 text-right shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <cat.icon className={`h-6 w-6 ${cat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-ui text-base font-bold">{cat.label}</p>
                  {score ? (
                    <p className="font-ui text-xs text-muted-foreground">
                      {score.correct_answers}/{score.total_questions} صحيح · {score.total_points} نقطة
                    </p>
                  ) : (
                    <p className="font-ui text-xs text-muted-foreground">لم تبدأ بعد</p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-x-1" />
              </button>
            );
          })}
        </div>

        {/* Overall stats */}
        {scores.length > 0 && (
          <div className="mx-auto mt-8 max-w-lg px-4">
            <div className="rounded-xl border border-primary/10 bg-card p-5 shadow-sm">
              <h3 className="mb-3 font-ui text-sm font-bold text-muted-foreground">إحصائياتك</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-ui text-2xl font-bold text-primary">{totalPoints}</p>
                  <p className="font-ui text-xs text-muted-foreground">نقطة</p>
                </div>
                <div>
                  <p className="font-ui text-2xl font-bold text-foreground">
                    {scores.reduce((s, c) => s + c.total_questions, 0)}
                  </p>
                  <p className="font-ui text-xs text-muted-foreground">سؤال</p>
                </div>
                <div>
                  <p className="font-ui text-2xl font-bold text-emerald-600">
                    {scores.reduce((s, c) => s + c.total_questions, 0) > 0
                      ? Math.round(
                          (scores.reduce((s, c) => s + c.correct_answers, 0) /
                            scores.reduce((s, c) => s + c.total_questions, 0)) *
                            100
                        )
                      : 0}
                    %
                  </p>
                  <p className="font-ui text-xs text-muted-foreground">نسبة النجاح</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Quiz screen
  if (screen === "quiz") {
    const catInfo = CATEGORIES.find((c) => c.id === selectedCategory);

    return (
      <div className="flex min-h-screen flex-col items-center px-4 pt-8" dir="rtl">
        <div className="w-full max-w-lg">
          <button
            onClick={() => setScreen("home")}
            className="mb-6 flex items-center gap-1 font-ui text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="h-4 w-4" />
            رجوع
          </button>

          <div className="mb-6 flex items-center gap-3">
            {catInfo && (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <catInfo.icon className={`h-5 w-5 ${catInfo.color}`} />
              </div>
            )}
            <h2 className="font-ui text-lg font-bold">{catInfo?.label}</h2>
          </div>

          {loadingQuestion ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="font-ui text-sm text-muted-foreground">جاري إنشاء السؤال...</p>
            </div>
          ) : question ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/10 bg-card p-5 shadow-sm">
                <p className="font-ui text-base font-semibold leading-relaxed">
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
                          ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                          : i === selectedAnswer
                          ? "border-red-400 bg-red-50 text-red-900"
                          : "border-primary/10 bg-card opacity-50"
                        : "border-primary/10 bg-card hover:border-primary/30 hover:shadow-sm"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                        answered && i === question.correct_index
                          ? "bg-emerald-500 text-white"
                          : answered && i === selectedAnswer
                          ? "bg-red-400 text-white"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
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

  // Result screen
  if (screen === "result" && question) {
    const isCorrect = selectedAnswer === question.correct_index;

    return (
      <div className="flex min-h-screen flex-col items-center px-4 pt-12" dir="rtl">
        <div className="w-full max-w-lg space-y-6">
          <div className="flex flex-col items-center gap-3">
            {isCorrect ? (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-9 w-9 text-emerald-600" />
                </div>
                <h2 className="font-ui text-2xl font-bold text-emerald-700">إجابة صحيحة! 🎉</h2>
                <p className="font-ui text-sm text-emerald-600">+1 نقطة</p>
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

          <div className="rounded-xl border border-primary/10 bg-card p-5 shadow-sm">
            <h3 className="mb-2 font-ui text-sm font-bold text-primary">الشرح والمصدر</h3>
            <p className="font-ui text-sm leading-relaxed text-foreground">
              {question.explanation}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                setScreen("quiz");
                fetchQuestion(selectedCategory);
              }}
              className="flex-1 gap-2 py-5 font-ui active:scale-[0.97]"
            >
              سؤال تالي
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setScreen("home")}
              className="gap-2 border-primary/15 py-5 font-ui active:scale-[0.97]"
            >
              الفئات
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
