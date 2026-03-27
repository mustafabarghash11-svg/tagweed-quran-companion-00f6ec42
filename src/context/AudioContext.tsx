import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';

interface NowPlaying {
  ayahNumber: number;
  numberInSurah: number;
  surahName: string;
}

interface AudioContextType {
  nowPlaying: NowPlaying | null;
  isPlaying: boolean;
  progress: number;
  playAyah: (ayah: NowPlaying, reciterApiId?: string) => void;
  togglePlay: () => void;
  stop: () => void;
  playNext: () => void;
  playPrev: () => void;
  currentReciterApiId: string;
  setCurrentReciterApiId: (id: string) => void;
}

const AudioCtx = createContext<AudioContextType | null>(null);

const DEFAULT_RECITER = 'ar.alafasy';

// بناء URL الصوت مع ثلاث مصادر احتياطية
function buildAudioUrls(reciterId: string, ayahNumber: number): string[] {
  const n = ayahNumber;
  return [
    // المصدر الأساسي - islamic.network بجودة 128
    `https://cdn.islamic.network/quran/audio/128/${reciterId}/${n}.mp3`,
    // المصدر الثاني - alquran.cloud
    `https://cdn.alquran.cloud/media/audio/ayah/${reciterId}/128`,
    // المصدر الثالث - mp3quran حسب القاريء
    getMp3QuranUrl(reciterId, n),
  ].filter(Boolean) as string[];
}

// خريطة القراء على mp3quran.net كمصدر احتياطي
function getMp3QuranUrl(reciterId: string, ayahNumber: number): string | null {
  const map: Record<string, string> = {
    'ar.abdulbasitmujawwad': `https://server7.mp3quran.net/basit/${String(ayahNumber).padStart(6, '0')}.mp3`,
    'ar.abdulbasitmurattal': `https://server7.mp3quran.net/basit_mur/${String(ayahNumber).padStart(6, '0')}.mp3`,
    'ar.alafasy': `https://server10.mp3quran.net/alafasy/${String(ayahNumber).padStart(6, '0')}.mp3`,
    'ar.husary': `https://server8.mp3quran.net/husary/${String(ayahNumber).padStart(6, '0')}.mp3`,
    'ar.abdurrahmaansudais': `https://server11.mp3quran.net/sds/${String(ayahNumber).padStart(6, '0')}.mp3`,
    'ar.muhammadayyoub': `https://server10.mp3quran.net/minsh/${String(ayahNumber).padStart(6, '0')}.mp3`,
  };
  return map[reciterId] ?? null;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentReciterApiId, setCurrentReciterApiIdState] = useState<string>(() => {
    const saved = localStorage.getItem('tagweed-reciter-api');
    return saved || DEFAULT_RECITER;
  });

  const reciterRef = useRef(currentReciterApiId);
  const nowPlayingRef = useRef<NowPlaying | null>(null);

  const setCurrentReciterApiId = (id: string) => {
    reciterRef.current = id;
    setCurrentReciterApiIdState(id);
    localStorage.setItem('tagweed-reciter-api', id);
  };

  // تشغيل URL مع محاولة fallbacks
  const tryPlayUrls = (urls: string[], onSuccess: () => void, onFail: () => void) => {
    const audio = audioRef.current;
    let idx = 0;

    const tryNext = () => {
      if (idx >= urls.length) {
        onFail();
        return;
      }
      audio.src = urls[idx++];
      audio.load();
      audio.play()
        .then(onSuccess)
        .catch(tryNext);
    };

    tryNext();
  };

  const loadAndPlay = (ayah: NowPlaying, reciterId: string) => {
    const urls = buildAudioUrls(reciterId, ayah.ayahNumber);

    tryPlayUrls(
      urls,
      () => {
        setNowPlaying(ayah);
        nowPlayingRef.current = ayah;
        setIsPlaying(true);
        setProgress(0);
      },
      () => {
        console.warn(`فشل تشغيل الآية ${ayah.ayahNumber} للقاريء ${reciterId}`);
        setIsPlaying(false);
      }
    );
  };

  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onEnded = () => {
      const prev = nowPlayingRef.current;
      if (!prev || prev.ayahNumber >= 6236) {
        setIsPlaying(false);
        return;
      }
      // الآية التالية - numberInSurah سيُصحَّح عند استدعاء القرآن
      // نحافظ على surahName ونزيد ayahNumber فقط
      const next: NowPlaying = {
        ayahNumber: prev.ayahNumber + 1,
        numberInSurah: prev.numberInSurah + 1,
        surahName: prev.surahName,
      };
      loadAndPlay(next, reciterRef.current);
      setNowPlaying(next);
      nowPlayingRef.current = next;
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const playAyah = (ayah: NowPlaying, reciterApiId?: string) => {
    const rid = reciterApiId ?? reciterRef.current;
    loadAndPlay(ayah, rid);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const stop = () => {
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setNowPlaying(null);
    nowPlayingRef.current = null;
    setProgress(0);
  };

  const playNext = () => {
    const current = nowPlayingRef.current;
    if (current && current.ayahNumber < 6236) {
      const next: NowPlaying = {
        ayahNumber: current.ayahNumber + 1,
        numberInSurah: current.numberInSurah + 1,
        surahName: current.surahName,
      };
      loadAndPlay(next, reciterRef.current);
    }
  };

  const playPrev = () => {
    const current = nowPlayingRef.current;
    if (current && current.ayahNumber > 1) {
      const prev: NowPlaying = {
        ayahNumber: current.ayahNumber - 1,
        numberInSurah: Math.max(1, current.numberInSurah - 1),
        surahName: current.surahName,
      };
      loadAndPlay(prev, reciterRef.current);
    }
  };

  return (
    <AudioCtx.Provider value={{
      nowPlaying, isPlaying, progress,
      playAyah, togglePlay, stop, playNext, playPrev,
      currentReciterApiId, setCurrentReciterApiId,
    }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used inside AudioProvider');
  return ctx;
}
