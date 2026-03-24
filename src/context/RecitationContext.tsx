import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import type { Ayah } from '@/lib/quran-api';

export type WordResult = {
  word: string;
  correct: boolean | null;
};

// حالة الآية: تقييم / استذكار / لم تُقرأ
export type AyahMode = 'evaluating' | 'review' | 'idle';

interface RecitationContextType {
  isReciting: boolean;
  currentAyahNumber: number | null;
  wordResults: WordResult[];
  ayahMode: AyahMode;
  reviewAyah: (ayah: Ayah) => void;  // اضغط آية سابقة للاستذكار
  startRecitation: (ayahs: Ayah[]) => void;
  stopRecitation: () => void;
  supported: boolean;
}

const RecitationContext = createContext<RecitationContextType | null>(null);

function normalizeQuran(text: string): string {
  return text
    .replace(/[\u0600-\u0605\u0610-\u061A\u061C\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '')
    .replace(/\u0671/g, 'ا')
    .replace(/\u0672/g, 'ا')
    .replace(/\u0673/g, 'ا')
    .replace(/\u0675/g, 'ا')
    .replace(/\u06CC/g, 'ي')
    .replace(/\u06C1/g, 'ه')
    .replace(/\u06D2/g, 'ي')
    .replace(/\u0677/g, 'و')
    .replace(/[إأآٱا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\u0640/g, '')
    .replace(/[\u06E9\u06FD\u06FE]/g, '')
    .replace(/[﴾﴿]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizeSpoken(text: string): string {
  return text
    .replace(/[إأآٱا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function getWords(text: string): string[] {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

function compareWords(originalWords: string[], spokenWords: string[]): WordResult[] {
  return originalWords.map((word, i) => {
    const spoken = spokenWords[i];
    if (spoken === undefined) return { word, correct: null };
    return {
      word,
      correct: normalizeQuran(word) === normalizeSpoken(spoken),
    };
  });
}

const SpeechRecognitionAPI =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export function RecitationProvider({ children }: { children: ReactNode }) {
  const supported = !!SpeechRecognitionAPI;
  const recognitionRef = useRef<any>(null);
  const ayahsRef = useRef<Ayah[]>([]);
  const isRecitingRef = useRef(false);
  const resumeIndexRef = useRef(0); // الآية اللي لازم يرجعلها بعد الاستذكار

  const [isReciting, setIsReciting] = useState(false);
  const [currentAyahNumber, setCurrentAyahNumber] = useState<number | null>(null);
  const [wordResults, setWordResults] = useState<WordResult[]>([]);
  const [ayahMode, setAyahMode] = useState<AyahMode>('idle');

  const startNextAyah = useCallback((index: number) => {
    if (!isRecitingRef.current) return;

    const ayahs = ayahsRef.current;
    if (index >= ayahs.length) {
      setIsReciting(false);
      isRecitingRef.current = false;
      setCurrentAyahNumber(null);
      setAyahMode('idle');
      return;
    }

    recognitionRef.current?.abort();
    resumeIndexRef.current = index;

    const ayah = ayahs[index];
    setCurrentAyahNumber(ayah.number);
    setAyahMode('evaluating');

    const words = getWords(ayah.text);
    setWordResults(words.map((w) => ({ word: w, correct: null })));

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;

    recognition.onresult = (event: any) => {
      if (!isRecitingRef.current) return;

      let bestTranscript = '';
      let bestMatchCount = -1;
      const originalWords = getWords(ayah.text);

      for (let i = 0; i < event.results[0].length; i++) {
        const transcript = event.results[0][i].transcript;
        const spokenWords = transcript.split(/\s+/).filter(Boolean);
        const matchCount = originalWords.filter((w, j) =>
          spokenWords[j] && normalizeQuran(w) === normalizeSpoken(spokenWords[j])
        ).length;

        if (matchCount > bestMatchCount) {
          bestMatchCount = matchCount;
          bestTranscript = transcript;
        }
      }

      const spokenWords = bestTranscript.split(/\s+/).filter(Boolean);
      const results = compareWords(originalWords, spokenWords);
      setWordResults(results);

      setTimeout(() => {
        if (isRecitingRef.current) startNextAyah(index + 1);
      }, 1200);
    };

    recognition.onerror = (e: any) => {
      if (!isRecitingRef.current) return;
      if (e.error === 'no-speech') {
        setTimeout(() => startNextAyah(index), 300);
      }
    };

    recognition.start();
  }, []);

  // استذكار آية سابقة بدون تقييم — يظللها بالأصفر ويسمع بدون مقارنة
  const reviewAyah = useCallback((ayah: Ayah) => {
    if (!isRecitingRef.current) return;

    recognitionRef.current?.abort();

    setCurrentAyahNumber(ayah.number);
    setAyahMode('review');

    const words = getWords(ayah.text);
    setWordResults(words.map((w) => ({ word: w, correct: null })));

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = () => {
      // بعد ما يخلص الاستذكار — ارجع للآية الأصلية
      setTimeout(() => {
        if (isRecitingRef.current) {
          startNextAyah(resumeIndexRef.current);
        }
      }, 800);
    };

    recognition.onerror = (e: any) => {
      if (!isRecitingRef.current) return;
      if (e.error === 'no-speech') {
        setTimeout(() => {
          if (isRecitingRef.current) startNextAyah(resumeIndexRef.current);
        }, 300);
      }
    };

    recognition.start();
  }, [startNextAyah]);

  const startRecitation = useCallback((ayahs: Ayah[]) => {
    if (!supported) return;
    ayahsRef.current = ayahs;
    isRecitingRef.current = true;
    setIsReciting(true);
    startNextAyah(0);
  }, [startNextAyah, supported]);

  const stopRecitation = useCallback(() => {
    isRecitingRef.current = false;
    recognitionRef.current?.abort();
    setIsReciting(false);
    setCurrentAyahNumber(null);
    setWordResults([]);
    setAyahMode('idle');
  }, []);

  return (
    <RecitationContext.Provider
      value={{
        isReciting,
        currentAyahNumber,
        wordResults,
        ayahMode,
        reviewAyah,
        startRecitation,
        stopRecitation,
        supported,
      }}
    >
      {children}
    </RecitationContext.Provider>
  );
}

export function useRecitation() {
  const ctx = useContext(RecitationContext);
  if (!ctx) throw new Error('useRecitation must be used inside RecitationProvider');
  return ctx;
}
