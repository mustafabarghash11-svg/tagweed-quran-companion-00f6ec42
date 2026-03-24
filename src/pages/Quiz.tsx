import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  BookOpen, ScrollText, Scale, Landmark, Shield, Star,
  ArrowRight, Trophy, CheckCircle2, XCircle, Loader2,
  ChevronRight, Home, Zap, Timer, Flame, Medal, PenLine,
} from "lucide-react";
import { toast } from "sonner";
import { toArabicNumeral } from "@/lib/quran-api";

// ─── Types ────────────────────────────────────────────────────────────────────
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
  xp: number;
  streak: number;
  last_played_at: string | null;
}

interface LeaderEntry {
  full_name: string;
  total_xp: number;
  total_questions: number;
  accuracy: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "quran",   label: "القرآن الكريم",    icon: BookOpen,  color: "text-emerald-600" },
  { id: "hadith",  label: "الحديث النبوي",    icon: ScrollText, color: "text-amber-600"  },
  { id: "fiqh",    label: "الفقه الإسلامي",   icon: Scale,     color: "text-blue-600"   },
  { id: "seerah",  label: "السيرة النبوية",   icon: Landmark,  color: "text-purple-600" },
  { id: "aqeedah", label: "العقيدة والتوحيد", icon: Shield,    color: "text-red-600"    },
  { id: "general", label: "ثقافة إسلامية",   icon: Star,      color: "text-orange-600" },
];

const DIFFICULTIES = [
  { id: "easy",   label: "سهل",   xp: 5,  time: 30 },
  { id: "medium", label: "متوسط", xp: 10, time: 20 },
  { id: "hard",   label: "صعب",   xp: 20, time: 15 },
] as const;

type Difficulty = "easy" | "medium" | "hard";

const RANKS = [
  { label: "مبتدئ",   min: 0,    icon: "📖" },
  { label: "متعلم",   min: 50,   icon: "🌱" },
  { label: "طالب",    min: 150,  icon: "📚" },
  { label: "حافظ",    min: 350,  icon: "⭐" },
  { label: "عالم",    min: 700,  icon: "🏆" },
  { label: "إمام",    min: 1200, icon: "👑" },
];

function getRank(xp: number) {
  return [...RANKS].reverse().find(r => xp >= r.min) || RANKS[0];
}

const optionLabels = ["أ", "ب", "ج", "د"];

type Screen = "home" | "setup" | "quiz" | "result" | "leaderboard";

// ─── Component ────────────────────────────────────────────────────────────────
export default function Quiz() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [screen, setScreen] = useState<Screen>("home");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [questionType, setQuestionType] = useState<"mcq" | "complete">("mcq");
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [scores, setScores] = useState<CategoryScore[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [loadingLeader, setLoadingLeader] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(20);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Session stats
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => { if (user) loadScores(); }, [user]);

  useEffect(() => {
    if (!timerActive) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setTimerActive(false);
          if (!answered) autoTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [timerActive, answered]);

  const autoTimeout = () => {
    setSelectedAnswer(-1);
    setAnswered(true);
    setTimerActive(false);
    setSessionTotal(p => p + 1);
    setScreen("result");
  };

  const loadScores = async () => {
    if (!user) return;
    const { data } = await supabase.from("quiz_scores").select("*").eq("user_id", user.id);
    if (data) {
      setScores(data as CategoryScore[]);
      setTotalXP(data.reduce((s: number, r: any) => s + (r.xp || 0), 0));
    }
  };

  const loadLeaderboard = async () => {
    setLoadingLeader(true);
    const { data } = await supabase.from("quiz_leaderboard").select("*").limit(20);
    if (data) setLeaderboard(data as LeaderEntry[]);
    setLoadingLeader(false);
  };

  const fetchQuestion = async (cat: string, diff: Difficulty, type: "mcq" | "complete") => {
    setLoadingQuestion(true);
    setQuestion(null);
    setSelectedAnswer(null);
    setAnswered(false);
    clearInterval(timerRef.current!);

    try {
      const { data, error } = await supabase.functions.invoke("quiz-generate", {
        body: { category: cat, difficulty: diff, type },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setQuestion(data as QuizQuestion);

      // Start timer
      const diffInfo = DIFFICULTIES.find(d => d.id === diff)!;
      setTimeLeft(diffInfo.time);
      setTimerActive(true);
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ في تحميل السؤال");
      setScreen("home");
    } finally {
      setLoadingQuestion(false);
    }
  };

  const startSetup = (catId: string) => {
    if (!user) { toast.error("سجل دخولك أولاً"); navigate("/login"); return; }
    setSelectedCategory(catId);
    setScreen("setup");
  };

  const startQuiz = () => {
    setSessionCorrect(0);
    setSessionTotal(0);
    setXpEarned(0);
    setScreen("quiz");
    fetchQuestion(selectedCategory, difficulty, questionType);
  };

  const handleAnswer = async (index: number) => {
    if (answered || !question || !user) return;
    clearInterval(timerRef.current!);
    setTimerActive(false);
    setSelectedAnswer(index);
    setAnswered(true);

    const isCorrect = index === question.correct_index;
    const diffInfo = DIFFICULTIES.find(d => d.id === difficulty)!;

    // Bonus XP for fast answer
    const timeBonus = timeLeft > diffInfo.time * 0.6 ? Math.round(diffInfo.xp * 0.5) : 0;
    const earned = isCorrect ? diffInfo.xp + timeBonus : 0;

    setSessionTotal(p => p + 1);
    if (isCorrect) { setSessionCorrect(p => p + 1); setXpEarned(p => p + earned); }

    // Save to DB
    const existing = scores.find(s => s.category === selectedCategory);
    const today = new Date().toISOString().split("T")[0];
    const isStreak = existing?.last_played_at === new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const newStreak = isStreak ? (existing?.streak || 0) + 1 : 1;

    if (existing) {
      await supabase.from("quiz_scores").update({
        total_questions: existing.total_questions + 1,
        correct_answers: existing.correct_answers + (isCorrect ? 1 : 0),
        total_points: existing.total_points + (isCorrect ? 1 : 0),
        xp: (existing.xp || 0) + earned,
        streak: newStreak,
        last_played_at: today,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id).eq("category", selectedCategory);
    } else {
      await supabase.from("quiz_scores").insert({
        user_id: user.id,
        category: selectedCategory,
        total_questions: 1,
        correct_answers: isCorrect ? 1 : 0,
        total_points: isCorrect ? 1 : 0,
        xp: earned,
        streak: 1,
        last_played_at: today,
      });
    }

    await loadScores();
    setScreen("result");
  };

  const catInfo = CATEGORIES.find(c => c.id === selectedCategory);
  const diffInfo = DIFFICULTIES.find(d => d.id === difficulty)!;
  const rank = getRank(totalXP);
  const timerPct = question ? (timeLeft / diffInfo.time) * 100 : 100;

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (screen === "home") {
    const totalQ = scores.reduce((s, c) => s + c.total_questions, 0);
    const totalC = scores.reduce((s, c) => s + c.correct_answers, 0);

    return (
      <div className="min-h-screen pb-24" dir="rtl">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <Link to="/"><Button size="icon" variant="ghost" className="h-9 w-9 rounded-full"><Home className="h-5 w-5 text-muted-foreground" /></Button></Link>
          <button onClick={() => { setScreen("leaderboard"); loadLeaderboard(); }}
            className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 font-ui text-xs text-primary hover:bg-primary/10 transition-colors">
            <Medal className="h-3.5 w-3.5" /> المتصدرون
          </button>
        </div>

        {/* XP Card */}
        <div className="mx-auto max-w-lg px-4 pt-2 pb-5">
          <div className="rounded-2xl bg-primary/10 border border-primary/15 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-ui text-xs text-muted-foreground">رتبتك</p>
                <p className="font-ui text-lg font-bold">{rank.icon} {rank.label}</p>
              </div>
              <div className="text-left">
                <p className="font-ui text-xs text-muted-foreground">إجمالي XP</p>
                <p className="font-ui text-2xl font-bold text-primary">{toArabicNumeral(totalXP)}</p>
              </div>
            </div>
            {/* XP progress to next rank */}
            {(() => {
              const nextRank = RANKS.find(r => r.min > totalXP);
              if (!nextRank) return <p className="font-ui text-xs text-primary font-bold text-center">🏆 وصلت للرتبة الأعلى!</p>;
              const prevMin = getRank(totalXP).min;
              const pct = Math.min(100, ((totalXP - prevMin) / (nextRank.min - prevMin)) * 100);
              return (
                <div className="space-y-1">
                  <div className="flex justify-between font-ui text-[10px] text-muted-foreground">
                    <span>{rank.label}</span>
                    <span>{nextRank.label} ({toArabicNumeral(nextRank.min - totalXP)} XP متبقي)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-primary/20 overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Stats row */}
          {totalQ > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { val: toArabicNumeral(totalXP), label: "XP" },
                { val: toArabicNumeral(totalQ), label: "سؤال" },
                { val: `${totalQ > 0 ? Math.round(totalC / totalQ * 100) : 0}%`, label: "دقة" },
              ].map(s => (
                <div key={s.label} className="rounded-xl bg-card border border-primary/10 py-3">
                  <p className="font-ui text-xl font-bold text-primary">{s.val}</p>
                  <p className="font-ui text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="mx-auto max-w-lg space-y-2.5 px-4">
          {CATEGORIES.map(cat => {
            const score = scores.find(s => s.category === cat.id);
            return (
              <button key={cat.id} onClick={() => startSetup(cat.id)}
                className="group flex w-full items-center gap-4 rounded-xl border border-primary/10 bg-card p-4 text-right shadow-sm transition-all hover:shadow-md active:scale-[0.98]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <cat.icon className={`h-5 w-5 ${cat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-ui text-sm font-bold">{cat.label}</p>
                  <p className="font-ui text-xs text-muted-foreground">
                    {score
                      ? `${toArabicNumeral(score.xp || 0)} XP · ${toArabicNumeral(score.correct_answers)}/${toArabicNumeral(score.total_questions)} صحيح`
                      : "لم تبدأ بعد"}
                  </p>
                </div>
                {score?.streak ? (
                  <span className="flex items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 font-ui text-xs font-bold text-orange-600">
                    <Flame className="h-3 w-3" />{toArabicNumeral(score.streak)}
                  </span>
                ) : null}
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-x-1" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── SETUP ─────────────────────────────────────────────────────────────────
  if (screen === "setup") {
    return (
      <div className="min-h-screen pb-24 px-4 pt-6" dir="rtl">
        <div className="mx-auto max-w-lg space-y-5">
          <button onClick={() => setScreen("home")} className="flex items-center gap-1 font-ui text-sm text-muted-foreground hover:text-foreground">
            <ArrowRight className="h-4 w-4" /> رجوع
          </button>

          <div className="flex items-center gap-3">
            {catInfo && <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><catInfo.icon className={`h-5 w-5 ${catInfo.color}`} /></div>}
            <h2 className="font-ui text-lg font-bold">{catInfo?.label}</h2>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <p className="font-ui text-sm font-bold">مستوى الصعوبة</p>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map(d => (
                <button key={d.id} onClick={() => setDifficulty(d.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 py-3 transition-all font-ui text-sm ${difficulty === d.id ? 'border-primary bg-primary/10 font-bold text-primary' : 'border-primary/10 bg-card'}`}>
                  <span>{d.label}</span>
                  <span className="text-xs text-muted-foreground">{toArabicNumeral(d.xp)} XP</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question type */}
          <div className="space-y-2">
            <p className="font-ui text-sm font-bold">نوع السؤال</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setQuestionType("mcq")}
                className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 font-ui text-sm transition-all ${questionType === "mcq" ? 'border-primary bg-primary/10 font-bold text-primary' : 'border-primary/10 bg-card'}`}>
                <Shield className="h-4 w-4" /> اختيار متعدد
              </button>
              <button onClick={() => setQuestionType("complete")}
                className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 font-ui text-sm transition-all ${questionType === "complete" ? 'border-primary bg-primary/10 font-bold text-primary' : 'border-primary/10 bg-card'}`}>
                <PenLine className="h-4 w-4" /> أكمل الآية
              </button>
            </div>
          </div>

          {/* XP preview */}
          <div className="rounded-xl bg-primary/5 border border-primary/10 px-4 py-3 flex items-center justify-between">
            <span className="font-ui text-sm text-muted-foreground">XP محتمل للإجابة الصحيحة</span>
            <span className="font-ui text-base font-bold text-primary flex items-center gap-1">
              <Zap className="h-4 w-4" /> حتى {toArabicNumeral(Math.round(diffInfo.xp * 1.5))} XP
            </span>
          </div>

          <Button onClick={startQuiz} className="w-full py-6 font-ui text-base gap-2">
            ابدأ الاختبار <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── QUIZ ──────────────────────────────────────────────────────────────────
  if (screen === "quiz") {
    return (
      <div className="flex min-h-screen flex-col px-4 pt-6 pb-24" dir="rtl">
        <div className="mx-auto w-full max-w-lg space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => { clearInterval(timerRef.current!); setScreen("home"); }}
              className="flex items-center gap-1 font-ui text-sm text-muted-foreground hover:text-foreground">
              <ArrowRight className="h-4 w-4" /> رجوع
            </button>
            <div className="flex items-center gap-2">
              <span className="font-ui text-xs text-muted-foreground">{catInfo?.label}</span>
              <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-ui text-xs font-bold ${
                difficulty === "easy" ? "bg-emerald-100 text-emerald-700" :
                difficulty === "medium" ? "bg-amber-100 text-amber-700" :
                "bg-red-100 text-red-700"}`}>
                {diffInfo.label}
              </span>
            </div>
          </div>

          {/* Timer bar */}
          {!loadingQuestion && question && (
            <div className="space-y-1">
              <div className="flex items-center justify-between font-ui text-xs">
                <span className="flex items-center gap-1 text-muted-foreground"><Timer className="h-3 w-3" /> الوقت</span>
                <span className={`font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-primary'}`}>{toArabicNumeral(timeLeft)}s</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-red-500' : 'bg-primary'}`}
                  style={{ width: `${timerPct}%` }} />
              </div>
            </div>
          )}

          {loadingQuestion ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="font-ui text-sm text-muted-foreground">جاري إنشاء السؤال...</p>
            </div>
          ) : question ? (
            <div className="space-y-4">
              {questionType === "complete" && (
                <div className="rounded-xl bg-primary/5 border border-primary/15 px-4 py-2 text-center">
                  <span className="font-ui text-xs text-primary font-bold">أكمل الآية الكريمة</span>
                </div>
              )}
              <div className="rounded-xl border border-primary/10 bg-card p-5 shadow-sm">
                <p className={`font-ui text-base font-semibold leading-relaxed ${questionType === "complete" ? "font-quran text-lg text-right" : ""}`}>
                  {question.question}
                </p>
              </div>
              <div className="space-y-2.5">
                {question.options.map((option, i) => (
                  <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
                    className={`flex w-full items-center gap-3 rounded-xl border p-4 text-right font-ui text-sm transition-all active:scale-[0.98] ${
                      answered
                        ? i === question.correct_index ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300"
                          : i === selectedAnswer ? "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300"
                          : "border-primary/10 bg-card opacity-40"
                        : "border-primary/10 bg-card hover:border-primary/30 hover:shadow-sm"
                    }`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                      answered && i === question.correct_index ? "bg-emerald-500 text-white"
                      : answered && i === selectedAnswer ? "bg-red-400 text-white"
                      : "bg-primary/10 text-primary"}`}>
                      {optionLabels[i]}
                    </span>
                    <span className={`flex-1 ${questionType === "complete" ? "font-quran text-base" : ""}`}>{option}</span>
                    {answered && i === question.correct_index && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />}
                    {answered && i === selectedAnswer && i !== question.correct_index && <XCircle className="h-5 w-5 shrink-0 text-red-500" />}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (screen === "result" && question) {
    const isCorrect = selectedAnswer === question.correct_index;
    const timedOut = selectedAnswer === -1;
    const diffInfo = DIFFICULTIES.find(d => d.id === difficulty)!;
    const timeBonus = timeLeft > diffInfo.time * 0.6 ? Math.round(diffInfo.xp * 0.5) : 0;
    const earned = isCorrect ? diffInfo.xp + timeBonus : 0;

    return (
      <div className="flex min-h-screen flex-col items-center px-4 pt-10 pb-24" dir="rtl">
        <div className="w-full max-w-lg space-y-5">
          {/* Result icon */}
          <div className="flex flex-col items-center gap-2">
            {timedOut ? (
              <><div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100"><Timer className="h-9 w-9 text-orange-500" /></div>
              <h2 className="font-ui text-2xl font-bold text-orange-600">انتهى الوقت!</h2></>
            ) : isCorrect ? (
              <><div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"><CheckCircle2 className="h-9 w-9 text-emerald-600" /></div>
              <h2 className="font-ui text-2xl font-bold text-emerald-700">إجابة صحيحة! 🎉</h2>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-ui text-sm font-bold text-primary">
                  <Zap className="h-3.5 w-3.5" /> +{toArabicNumeral(diffInfo.xp)} XP
                </span>
                {timeBonus > 0 && <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 font-ui text-xs font-bold text-amber-700">
                  <Timer className="h-3 w-3" /> +{toArabicNumeral(timeBonus)} سرعة
                </span>}
              </div></>
            ) : (
              <><div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100"><XCircle className="h-9 w-9 text-red-500" /></div>
              <h2 className="font-ui text-2xl font-bold text-red-600">إجابة خاطئة</h2>
              <p className="font-ui text-sm text-muted-foreground">الإجابة: {question.options[question.correct_index]}</p></>
            )}
          </div>

          {/* Session mini stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { val: toArabicNumeral(sessionTotal), label: "سؤال" },
              { val: toArabicNumeral(sessionCorrect), label: "صحيح" },
              { val: toArabicNumeral(xpEarned + earned), label: "XP اليوم" },
            ].map(s => (
              <div key={s.label} className="rounded-xl bg-card border border-primary/10 py-3">
                <p className="font-ui text-xl font-bold text-primary">{s.val}</p>
                <p className="font-ui text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Explanation */}
          <div className="rounded-xl border border-primary/10 bg-card p-5 shadow-sm">
            <h3 className="mb-2 font-ui text-sm font-bold text-primary">الشرح والمصدر</h3>
            <p className="font-ui text-sm leading-relaxed">{question.explanation}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={() => { setScreen("quiz"); fetchQuestion(selectedCategory, difficulty, questionType); }}
              className="flex-1 gap-2 py-5 font-ui active:scale-[0.97]">
              سؤال تالي <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setScreen("home")} className="gap-2 border-primary/15 py-5 font-ui active:scale-[0.97]">
              الفئات
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── LEADERBOARD ───────────────────────────────────────────────────────────
  if (screen === "leaderboard") {
    return (
      <div className="min-h-screen pb-24" dir="rtl">
        <div className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
            <button onClick={() => setScreen("home")} className="text-primary"><ArrowRight className="h-5 w-5" /></button>
            <h1 className="font-ui text-lg font-bold">المتصدرون الأسبوعيون</h1>
          </div>
        </div>

        <div className="mx-auto max-w-lg px-4 pt-4 space-y-2">
          {loadingLeader ? (
            <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground font-ui text-sm">لا توجد بيانات بعد</div>
          ) : leaderboard.map((entry, i) => (
            <div key={i} className={`flex items-center gap-3 rounded-xl border p-4 ${i === 0 ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20' : i === 1 ? 'border-slate-300 bg-slate-50 dark:bg-slate-900/20' : i === 2 ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/20' : 'border-primary/10 bg-card'}`}>
              <span className="w-7 text-center font-ui text-lg font-bold">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : toArabicNumeral(i + 1)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-ui text-sm font-bold truncate">{entry.full_name || "مستخدم مجهول"}</p>
                <p className="font-ui text-xs text-muted-foreground">{getRank(entry.total_xp).icon} {getRank(entry.total_xp).label} · دقة {toArabicNumeral(entry.accuracy)}%</p>
              </div>
              <span className="flex items-center gap-1 font-ui text-sm font-bold text-primary">
                <Zap className="h-3.5 w-3.5" />{toArabicNumeral(entry.total_xp)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
