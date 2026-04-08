import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VerseData {
  verse_number: number;
  text_uthmani: string;
}

interface WordToken {
  verseIndex: number;
  wordIndex: number;
  original: string;
  normalized: string;
}

type WordState = "idle" | "correct" | "error";

interface VoiceRecitationProps {
  verses: VerseData[];
}

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
        tokens.push({
          verseIndex: vi,
          wordIndex: wi,
          original: word,
          normalized: normalizeArabic(word),
        });
      });
  });
  return tokens;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VoiceRecitation({ verses }: VoiceRecitationProps) {
  const tokensRef = useRef<WordToken[]>([]);
  const cursorRef = useRef(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // كلمات آخر chunk معالج — لتتبع التكرار
  const lastChunkNormalizedRef = useRef<string[]>([]);

  const [wordStates, setWordStates] = useState<Map<string, WordState>>(new Map());
  const [isRecording, setIsRecording] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);

  useEffect(() => {
    tokensRef.current = buildTokens(verses);
  }, [verses]);

  const tokenKey = (t: WordToken) => `${t.verseIndex}-${t.wordIndex}`;

  const applyStates = useCallback((updates: { token: WordToken; state: WordState }[]) => {
    setWordStates((prev) => {
      const next = new Map(prev);
      updates.forEach(({ token, state }) => next.set(tokenKey(token), state));
      return next;
    });
  }, []);

  /**
   * المنطق الأساسي:
   * - نتقدم كلمة كلمة في cursor
   * - إذا طابقت → صح وتقدم
   * - إذا ما طابقت → نبحث في الـ LOOK_AHEAD القادمة:
   *     وجدنا: الكلمات الوسط خطأ + الكلمة صح + تقدم
   *     ما وجدنا: نبحث في الـ LOOK_BACK السابقة:
   *         وجدنا (مكررة) → تجاهل كلياً بدون تقدم
   *         ما وجدنا → خطأ + تقدم
   */
  const handleTranscript = useCallback(
    (text: string) => {
      const LOOK_AHEAD = 6;
      const LOOK_BACK = 10;

      const spoken = normalizeArabic(text).split(/\s+/).filter(Boolean);
      if (spoken.length === 0) return;

      // تحقق هل هذا الـ chunk هو نفس آخر chunk (تكرار بسبب interim)
      const spokenStr = spoken.join(" ");
      if (spokenStr === lastChunkNormalizedRef.current.join(" ")) return;
      lastChunkNormalizedRef.current = spoken;

      const tokens = tokensRef.current;
      let cursor = cursorRef.current;
      const stateUpdates: { token: WordToken; state: WordState }[] = [];
      let deltaCorrect = 0;
      let deltaErrors = 0;

      for (const word of spoken) {
        if (cursor >= tokens.length) break;

        const expected = tokens[cursor];

        if (word === expected.normalized) {
          // ✅ صح
          stateUpdates.push({ token: expected, state: "correct" });
          deltaCorrect++;
          cursor++;
        } else {
          // بحث للأمام
          let foundAhead = -1;
          for (let i = 1; i <= LOOK_AHEAD && cursor + i < tokens.length; i++) {
            if (tokens[cursor + i].normalized === word) {
              foundAhead = i;
              break;
            }
          }

          if (foundAhead !== -1) {
            // الكلمات الوسط خطأ
            for (let i = 0; i < foundAhead; i++) {
              stateUpdates.push({ token: tokens[cursor + i], state: "error" });
              deltaErrors++;
            }
            // الكلمة المطابقة صح
            stateUpdates.push({ token: tokens[cursor + foundAhead], state: "correct" });
            deltaCorrect++;
            cursor += foundAhead + 1;
          } else {
            // بحث للخلف — مكررة؟
            let foundBack = false;
            for (let i = 1; i <= LOOK_BACK && cursor - i >= 0; i++) {
              if (tokens[cursor - i].normalized === word) {
                foundBack = true;
                break;
              }
            }

            if (foundBack) {
              // مكررة → تجاهل، لا تقدم ولا خطأ
            } else {
              // خطأ حقيقي
              stateUpdates.push({ token: expected, state: "error" });
              deltaErrors++;
              cursor++;
            }
          }
        }
      }

      cursorRef.current = cursor;
      if (stateUpdates.length) applyStates(stateUpdates);
      if (deltaCorrect) setCorrect((c) => c + deltaCorrect);
      if (deltaErrors) setErrors((e) => e + deltaErrors);

      if (cursor >= tokens.length) {
        setIsDone(true);
        // نوقف
        recognitionRef.current?.stop();
        recognitionRef.current = null;
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
        toast.success("ما شاء الله! أكملت الصفحة 🎉");
      }
    },
    [applyStates]
  );

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
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

    cursorRef.current = 0;
    lastChunkNormalizedRef.current = [];

    const recognition = new SR();
    recognition.lang = "ar-SA";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
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
      if (e.error !== "aborted") toast.error("خطأ في التسجيل: " + e.error);
    };

    // إعادة تشغيل تلقائية — الـ Web Speech API تقطع بعد صمت
    recognition.onend = () => {
      if (recognitionRef.current && !isDone) {
        try { recognition.start(); } catch (_) {}
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [handleTranscript, isDone]);

  const reset = () => {
    stopRecording();
    cursorRef.current = 0;
    lastChunkNormalizedRef.current = [];
    setWordStates(new Map());
    setCorrect(0);
    setErrors(0);
    setIsDone(false);
    setSeconds(0);
  };

  useEffect(() => () => stopRecording(), [stopRecording]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const total = tokensRef.current.length;
  const score = total > 0 ? Math.round(((total - errors) / total) * 100) : 0;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5 pb-24">
      {/* نص الآيات */}
      <div className="space-y-4" dir="rtl">
        {verses.map((verse, vi) => {
          const words = verse.text_uthmani.split(/\s+/).filter(Boolean);
          return (
            <p
              key={vi}
              className="leading-loose text-right"
              style={{ fontFamily: "'Amiri','Scheherazade New',serif", fontSize: "1.3rem" }}
            >
              {words.map((word, wi) => {
                const state = wordStates.get(`${vi}-${wi}`) ?? "idle";
                return (
                  <span
                    key={wi}
                    className={`
                      mx-0.5 transition-colors duration-200
                      ${state === "correct"
                        ? "text-green-600"
                        : state === "error"
                        ? "text-red-600 underline decoration-wavy decoration-red-400"
                        : "text-gray-800"}
                    `}
                  >
                    {word}
                  </span>
                );
              })}
              {/* رقم الآية */}
              <span
                className="text-[#6B744E]/60 mx-1 select-none"
                style={{ fontSize: "1rem" }}
              >
                ﴿{verse.verse_number}﴾
              </span>
            </p>
          );
        })}
      </div>

      {/* ── شريط التحكم الثابت ── */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
          flex items-center gap-4 bg-white/95 backdrop-blur-md
          border border-[#6B744E]/25 rounded-2xl px-5 py-3 shadow-xl
          min-w-[280px] max-w-[90vw]"
        dir="rtl"
      >
        {/* إحصائيات */}
        <div className="flex items-center gap-2 text-sm flex-1">
          {isRecording && (
            <>
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              <span className="text-gray-400 tabular-nums text-xs">{fmt(seconds)}</span>
            </>
          )}
          {(correct > 0 || errors > 0) && (
            <>
              <span className="text-green-600 font-semibold">✓{correct}</span>
              {errors > 0 && (
                <span className="text-red-500 font-semibold">✗{errors}</span>
              )}
              {isDone && (
                <span className="text-[#6B744E] font-bold">{score}%</span>
              )}
            </>
          )}
        </div>

        {/* أزرار */}
        <div className="flex items-center gap-2">
          {(correct > 0 || errors > 0 || isDone) && (
            <Button
              onClick={reset}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600 gap-1 px-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              إعادة
            </Button>
          )}

          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={isDone}
              className="bg-[#6B744E] hover:bg-[#5a6240] text-white gap-2 rounded-xl px-5"
            >
              <Mic className="w-4 h-4" />
              {isDone ? "انتهيت 🎉" : correct > 0 ? "استمر" : "ابدأ التسميع"}
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="gap-2 rounded-xl px-5"
            >
              <Square className="w-4 h-4" />
              إيقاف
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
