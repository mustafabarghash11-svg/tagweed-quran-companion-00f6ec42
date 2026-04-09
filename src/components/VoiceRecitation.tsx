import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VerseData {
  verse_number: number;
  text_uthmani: string;
}

interface WordToken {
  verseIndex: number;
  wordIndex: number;
  normalized: string;
}

export type WordState = "idle" | "correct" | "error" | "current";

// ─── Normalize ────────────────────────────────────────────────────────────────
// هدفها: توحيد طريقة كتابة نفس الكلمة سواء جاءت من القرآن أو من Speech API

function normalizeArabic(text: string): string {
  return text
    // 1. إزالة كل الحركات والتشكيل والتجويد
    .replace(/[\u064B-\u065F]/g, "")      // تنوين، شدة، سكون، حركات
    .replace(/\u0670/g, "")               // ألف خنجرية
    .replace(/[\u06D6-\u06DC]/g, "")      // علامات التجويد
    .replace(/[\u06DF-\u06E4]/g, "")
    .replace(/[\u06E7\u06E8]/g, "")
    .replace(/[\u06EA-\u06ED]/g, "")
    .replace(/\u0640/g, "")               // الكشيدة/التطويل

    // 2. توحيد أشكال الألف
    .replace(/[\u0622\u0623\u0625\u0671\u0672\u0673\u0675]/g, "\u0627")

    // 3. توحيد الحروف المتشابهة
    .replace(/\u0629/g, "\u0647")         // تاء مربوطة → هاء
    .replace(/\u0649/g, "\u064A")         // ألف مقصورة → ياء
    .replace(/[\u0624]/g, "\u0648")       // واو مع همزة → واو
    .replace(/[\u0626]/g, "\u064A")       // ياء مع همزة → ياء

    // 4. اللام الشمسية/القمرية — توحيد "ال" في بداية الكلمة
    // لا نحتاج تغيير، لكن نتأكد من حذف الهمزة الوصل
    .replace(/\u0671/g, "\u0627")

    // 5. حذف علامات الترقيم
    .replace(/[،؟!.,;:'"()\[\]{}]/g, "")

    // 6. حذف المسافات الزائدة
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Fuzzy Match ──────────────────────────────────────────────────────────────
// Levenshtein distance — يحسب كم تعديل بين كلمتين
// لو الفرق صغير نسبياً نعتبرها صح (تغطية اختلافات الـ API)

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

// هل الكلمتان متطابقتان بعد الـ normalize والـ fuzzy؟
function wordsMatch(spoken: string, expected: string): boolean {
  if (spoken === expected) return true;
  const maxLen = Math.max(spoken.length, expected.length);
  if (maxLen === 0) return true;
  // نسمح بـ 1 تعديل لكل 4 حروف (25%)
  const tolerance = Math.floor(maxLen / 4);
  return levenshtein(spoken, expected) <= Math.max(1, tolerance);
}

// ─── Tokens ───────────────────────────────────────────────────────────────────

function buildTokens(verses: VerseData[]): WordToken[] {
  const tokens: WordToken[] = [];
  verses.forEach((verse, vi) => {
    verse.text_uthmani
      .split(/\s+/)
      .filter(Boolean)
      .forEach((word, wi) => {
        tokens.push({ verseIndex: vi, wordIndex: wi, normalized: normalizeArabic(word) });
      });
  });
  return tokens;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useVoiceRecitation(verses: VerseData[]) {
  const tokensRef       = useRef<WordToken[]>([]);
  const cursorRef       = useRef(0);
  const recognitionRef  = useRef<SpeechRecognition | null>(null);
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastChunkRef    = useRef<string>("");
  const isDoneRef       = useRef(false);

  const [wordStates, setWordStates] = useState<Map<string, WordState>>(new Map());
  const [isRecording, setIsRecording]   = useState(false);
  const [isDone,      setIsDone]        = useState(false);
  const [seconds,     setSeconds]       = useState(0);
  const [correct,     setCorrect]       = useState(0);
  const [errors,      setErrors]        = useState(0);

  useEffect(() => {
    tokensRef.current = buildTokens(verses);
    isDoneRef.current = false;
  }, [verses]);

  const key = (vi: number, wi: number) => `${vi}-${wi}`;

  const markCurrent = useCallback((cursor: number) => {
    const tokens = tokensRef.current;
    if (cursor >= tokens.length) return;
    const t = tokens[cursor];
    setWordStates((prev) => {
      const next = new Map(prev);
      prev.forEach((v, k) => { if (v === "current") next.set(k, "idle"); });
      next.set(key(t.verseIndex, t.wordIndex), "current");
      return next;
    });
  }, []);

  const applyUpdates = useCallback((updates: { vi: number; wi: number; state: WordState }[]) => {
    setWordStates((prev) => {
      const next = new Map(prev);
      // امسح current القديم أولاً
      prev.forEach((v, k) => { if (v === "current") next.set(k, "idle"); });
      updates.forEach(({ vi, wi, state }) => next.set(key(vi, wi), state));
      return next;
    });
  }, []);

  const handleTranscript = useCallback((text: string) => {
    const LOOK_BACK = 12;

    const spoken = normalizeArabic(text).split(/\s+/).filter(Boolean);
    if (spoken.length === 0) return;

    const chunk = spoken.join(" ");
    if (chunk === lastChunkRef.current) return;
    lastChunkRef.current = chunk;

    const tokens = tokensRef.current;
    let cursor   = cursorRef.current;
    const updates: { vi: number; wi: number; state: WordState }[] = [];
    let dc = 0, de = 0;

    for (const word of spoken) {
      if (cursor >= tokens.length) break;
      const expected = tokens[cursor];

      if (wordsMatch(word, expected.normalized)) {
        // كلمة صح — تقدم
        updates.push({ vi: expected.verseIndex, wi: expected.wordIndex, state: "correct" });
        dc++;
        cursor++;
      } else {
        // هل هي تكرار لكلمة سبق قراءتها؟
        let foundBack = false;
        for (let i = 1; i <= LOOK_BACK && cursor - i >= 0; i++) {
          if (wordsMatch(word, tokens[cursor - i].normalized)) { foundBack = true; break; }
        }
        if (foundBack) {
          // مكررة — تجاهل كلياً، لا تقدم ولا خطأ
        } else {
          // كلمة غلط — علّم الكلمة الحالية خطأ وتقدم
          updates.push({ vi: expected.verseIndex, wi: expected.wordIndex, state: "error" });
          de++;
          cursor++;
        }
      }
    }

    cursorRef.current = cursor;
    if (updates.length) applyUpdates(updates);
    if (dc) setCorrect((c) => c + dc);
    if (de) setErrors((e) => e + de);

    // لوّن الكلمة التالية
    if (cursor < tokens.length) markCurrent(cursor);

    if (cursor >= tokens.length) {
      isDoneRef.current = true;
      setIsDone(true);
      setWordStates((prev) => {
        const next = new Map(prev);
        prev.forEach((v, k) => { if (v === "current") next.set(k, "idle"); });
        return next;
      });
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
      toast.success("ما شاء الله! أكملت الصفحة 🎉");
    }
  }, [applyUpdates, markCurrent]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setWordStates((prev) => {
      const next = new Map(prev);
      prev.forEach((v, k) => { if (v === "current") next.set(k, "idle"); });
      return next;
    });
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    const SR =
      window.SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition }).webkitSpeechRecognition;

    if (!SR) {
      toast.error("متصفحك لا يدعم التعرف على الصوت — استخدم Chrome أو Edge");
      return;
    }

    cursorRef.current    = 0;
    lastChunkRef.current = "";
    isDoneRef.current    = false;
    setWordStates(new Map());
    setCorrect(0);
    setErrors(0);
    setIsDone(false);
    setSeconds(0);

    const recognition = new SR();
    recognition.lang           = "ar-SA";
    recognition.continuous     = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3; // ← نأخذ 3 بدائل ونختار الأقرب

    recognition.onstart = () => {
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      markCurrent(0);
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          // جرّب كل البدائل وخذ الأفضل
          const tokens  = tokensRef.current;
          const cursor  = cursorRef.current;
          if (cursor >= tokens.length) continue;

          const expected = tokens[cursor].normalized;
          let bestTranscript = event.results[i][0].transcript;
          let bestDist = Infinity;

          for (let a = 0; a < event.results[i].length; a++) {
            const alt = event.results[i][a].transcript;
            const words = normalizeArabic(alt).split(/\s+/).filter(Boolean);
            if (words.length === 0) continue;
            const dist = levenshtein(words[0], expected);
            if (dist < bestDist) { bestDist = dist; bestTranscript = alt; }
          }

          handleTranscript(bestTranscript);
        }
      }
    };

    recognition.onerror = (e) => {
      if (e.error === "no-speech") return;
      if (e.error !== "aborted") toast.error("خطأ: " + e.error);
    };

    recognition.onend = () => {
      if (recognitionRef.current && !isDoneRef.current) {
        try { recognition.start(); } catch (_) {}
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [handleTranscript, markCurrent]);

  const reset = useCallback(() => {
    stopRecording();
    cursorRef.current    = 0;
    lastChunkRef.current = "";
    isDoneRef.current    = false;
    setWordStates(new Map());
    setCorrect(0);
    setErrors(0);
    setIsDone(false);
    setSeconds(0);
  }, [stopRecording]);

  useEffect(() => () => stopRecording(), [stopRecording]);

  return {
    wordStates, isRecording, isDone, seconds, correct, errors,
    total: tokensRef.current.length,
    startRecording, stopRecording, reset,
  };
}

// ─── VoiceBar ─────────────────────────────────────────────────────────────────

interface VoiceBarProps {
  isRecording: boolean;
  isDone: boolean;
  seconds: number;
  correct: number;
  errors: number;
  total: number;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function VoiceBar({
  isRecording, isDone, seconds, correct, errors, total,
  onStart, onStop, onReset,
}: VoiceBarProps) {
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const score    = total > 0 ? Math.round(((total - errors) / total) * 100) : 0;
  const hasStats = correct > 0 || errors > 0;

  return (
    <div
      className="flex items-center justify-between bg-white/95 backdrop-blur-md
        border border-[#6B744E]/25 rounded-2xl px-4 py-2.5 shadow-lg"
      dir="rtl"
    >
      <div className="flex items-center gap-2 text-sm min-w-[80px]">
        {isRecording && (
          <>
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping shrink-0" />
            <span className="text-gray-400 tabular-nums text-xs">{fmt(seconds)}</span>
          </>
        )}
        {hasStats && (
          <>
            <span className="text-green-600 font-semibold text-xs">✓{correct}</span>
            {errors > 0 && <span className="text-red-500 font-semibold text-xs">✗{errors}</span>}
            {isDone && <span className="text-[#6B744E] font-bold text-xs">{score}%</span>}
          </>
        )}
        {!isRecording && !hasStats && (
          <span className="text-gray-400 text-xs">اضغط لتبدأ التسميع</span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {hasStats && (
          <Button onClick={onReset} variant="ghost" size="sm"
            className="text-gray-400 hover:text-gray-600 gap-1 px-2 h-8">
            <RotateCcw className="w-3.5 h-3.5" />
            إعادة
          </Button>
        )}
        {!isRecording ? (
          <Button onClick={onStart} disabled={isDone}
            className="bg-[#6B744E] hover:bg-[#5a6240] text-white gap-1.5 rounded-xl px-4 h-8 text-sm">
            <Mic className="w-3.5 h-3.5" />
            {isDone ? "انتهيت 🎉" : hasStats ? "استمر" : "ابدأ التسميع"}
          </Button>
        ) : (
          <Button onClick={onStop} variant="destructive"
            className="gap-1.5 rounded-xl px-4 h-8 text-sm">
            <Square className="w-3.5 h-3.5" />
            إيقاف
          </Button>
        )}
      </div>
    </div>
  );
}
