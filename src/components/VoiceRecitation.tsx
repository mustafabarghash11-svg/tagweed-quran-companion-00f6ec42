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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, "")
    .replace(/\u0622|\u0623|\u0625|\u0671/g, "\u0627")
    .replace(/\u0629/g, "\u0647")
    .replace(/\u0649/g, "\u064A")
    .replace(/[،؟!.,'"()[\]{}]/g, "")
    .trim();
}

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

// ─── Hook — يُستخدم في QuranPageView ─────────────────────────────────────────

export function useVoiceRecitation(verses: VerseData[]) {
  const tokensRef = useRef<WordToken[]>([]);
  const cursorRef = useRef(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastChunkRef = useRef<string>("");
  const isDoneRef = useRef(false);

  const [wordStates, setWordStates] = useState<Map<string, WordState>>(new Map());
  const [isRecording, setIsRecording] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);

  useEffect(() => {
    tokensRef.current = buildTokens(verses);
    isDoneRef.current = false;
  }, [verses]);

  // الدالة الرئيسية — تلوّن الكلمة الحالية أثناء القراءة
  const markCurrent = useCallback((cursor: number) => {
    const tokens = tokensRef.current;
    if (cursor >= tokens.length) return;
    const t = tokens[cursor];
    setWordStates((prev) => {
      const next = new Map(prev);
      // امسح current السابق
      prev.forEach((v, k) => { if (v === "current") next.set(k, "idle"); });
      next.set(`${t.verseIndex}-${t.wordIndex}`, "current");
      return next;
    });
  }, []);

  const applyUpdates = useCallback((updates: { vi: number; wi: number; state: WordState }[]) => {
    setWordStates((prev) => {
      const next = new Map(prev);
      updates.forEach(({ vi, wi, state }) => next.set(`${vi}-${wi}`, state));
      return next;
    });
  }, []);

  const handleTranscript = useCallback(
    (text: string) => {
      const LOOK_AHEAD = 6;
      const LOOK_BACK = 10;

      const spoken = normalizeArabic(text).split(/\s+/).filter(Boolean);
      if (spoken.length === 0) return;

      const chunk = spoken.join(" ");
      if (chunk === lastChunkRef.current) return;
      lastChunkRef.current = chunk;

      const tokens = tokensRef.current;
      let cursor = cursorRef.current;
      const updates: { vi: number; wi: number; state: WordState }[] = [];
      let dc = 0;
      let de = 0;

      for (const word of spoken) {
        if (cursor >= tokens.length) break;
        const expected = tokens[cursor];

        if (word === expected.normalized) {
          // ✅ صح
          updates.push({ vi: expected.verseIndex, wi: expected.wordIndex, state: "correct" });
          dc++;
          cursor++;
        } else {
          // بحث للأمام
          let foundAhead = -1;
          for (let i = 1; i <= LOOK_AHEAD && cursor + i < tokens.length; i++) {
            if (tokens[cursor + i].normalized === word) { foundAhead = i; break; }
          }

          if (foundAhead !== -1) {
            for (let i = 0; i < foundAhead; i++) {
              const t = tokens[cursor + i];
              updates.push({ vi: t.verseIndex, wi: t.wordIndex, state: "error" });
              de++;
            }
            const t = tokens[cursor + foundAhead];
            updates.push({ vi: t.verseIndex, wi: t.wordIndex, state: "correct" });
            dc++;
            cursor += foundAhead + 1;
          } else {
            // بحث للخلف — مكررة؟
            let foundBack = false;
            for (let i = 1; i <= LOOK_BACK && cursor - i >= 0; i++) {
              if (tokens[cursor - i].normalized === word) { foundBack = true; break; }
            }
            if (!foundBack) {
              updates.push({ vi: expected.verseIndex, wi: expected.wordIndex, state: "error" });
              de++;
              cursor++;
            }
            // مكررة → تجاهل
          }
        }
      }

      cursorRef.current = cursor;
      if (updates.length) applyUpdates(updates);
      if (dc) setCorrect((c) => c + dc);
      if (de) setErrors((e) => e + de);

      // لوّن الكلمة التالية المتوقعة
      if (cursor < tokens.length) markCurrent(cursor);

      if (cursor >= tokens.length) {
        isDoneRef.current = true;
        setIsDone(true);
        // امسح current
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
    },
    [applyUpdates, markCurrent]
  );

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    // امسح current عند الإيقاف
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

    // reset
    cursorRef.current = 0;
    lastChunkRef.current = "";
    isDoneRef.current = false;
    setWordStates(new Map());
    setCorrect(0);
    setErrors(0);
    setIsDone(false);
    setSeconds(0);

    const recognition = new SR();
    recognition.lang = "ar-SA";
    recognition.continuous = true;
    recognition.interimResults = true; // ← interim لتلوين فوري
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      // لوّن أول كلمة
      markCurrent(0);
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          handleTranscript(event.results[i][0].transcript);
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
    cursorRef.current = 0;
    lastChunkRef.current = "";
    isDoneRef.current = false;
    setWordStates(new Map());
    setCorrect(0);
    setErrors(0);
    setIsDone(false);
    setSeconds(0);
  }, [stopRecording]);

  useEffect(() => () => stopRecording(), [stopRecording]);

  return {
    wordStates,
    isRecording,
    isDone,
    seconds,
    correct,
    errors,
    total: tokensRef.current.length,
    startRecording,
    stopRecording,
    reset,
  };
}

// ─── شريط التحكم — يُستخدم في QuranPageView ──────────────────────────────────

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

  const score = total > 0 ? Math.round(((total - errors) / total) * 100) : 0;
  const hasStats = correct > 0 || errors > 0;

  return (
    <div
      className="flex items-center justify-between bg-white/95 backdrop-blur-md
        border border-[#6B744E]/25 rounded-2xl px-4 py-2.5 shadow-lg"
      dir="rtl"
    >
      {/* إحصائيات */}
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

      {/* أزرار */}
      <div className="flex items-center gap-1.5">
        {hasStats && (
          <Button onClick={onReset} variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 gap-1 px-2 h-8">
            <RotateCcw className="w-3.5 h-3.5" />
            إعادة
          </Button>
        )}
        {!isRecording ? (
          <Button
            onClick={onStart}
            disabled={isDone}
            className="bg-[#6B744E] hover:bg-[#5a6240] text-white gap-1.5 rounded-xl px-4 h-8 text-sm"
          >
            <Mic className="w-3.5 h-3.5" />
            {isDone ? "انتهيت 🎉" : hasStats ? "استمر" : "ابدأ التسميع"}
          </Button>
        ) : (
          <Button onClick={onStop} variant="destructive" className="gap-1.5 rounded-xl px-4 h-8 text-sm">
            <Square className="w-3.5 h-3.5" />
            إيقاف
          </Button>
        )}
      </div>
    </div>
  );
}
