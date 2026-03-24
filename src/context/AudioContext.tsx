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

  const setCurrentReciterApiId = (id: string) => {
    reciterRef.current = id;
    setCurrentReciterApiIdState(id);
    localStorage.setItem('tagweed-reciter-api', id);
  };

  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onEnded = () => {
      setNowPlaying((prev) => {
        if (!prev || prev.ayahNumber >= 6236) {
          setIsPlaying(false);
          return null;
        }
        const next: NowPlaying = {
          ayahNumber: prev.ayahNumber + 1,
          numberInSurah: prev.numberInSurah + 1,
          surahName: prev.surahName,
        };
        loadAndPlay(next, reciterRef.current);
        return prev;
      });
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const loadAndPlay = (ayah: NowPlaying, reciterId: string) => {
    const audio = audioRef.current;
    // الـ URL الأساسي
    const primaryUrl = `https://cdn.islamic.network/quran/audio/128/${reciterId}/${ayah.ayahNumber}.mp3`;
    // fallback بدون bitrate محدد
    const fallbackUrl = `https://cdn.alquran.cloud/media/audio/ayah/${reciterId}/${ayah.ayahNumber}`;

    audio.src = primaryUrl;
    audio.load();
    audio.play()
      .then(() => {
        setNowPlaying(ayah);
        setIsPlaying(true);
        setProgress(0);
      })
      .catch(() => {
        // جرب الـ fallback
        audio.src = fallbackUrl;
        audio.load();
        audio.play()
          .then(() => {
            setNowPlaying(ayah);
            setIsPlaying(true);
            setProgress(0);
          })
          .catch(() => setIsPlaying(false));
      });
  };

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
    setProgress(0);
  };

  const playNext = () => {
    if (nowPlaying && nowPlaying.ayahNumber < 6236) {
      loadAndPlay({
        ayahNumber: nowPlaying.ayahNumber + 1,
        numberInSurah: nowPlaying.numberInSurah + 1,
        surahName: nowPlaying.surahName,
      }, reciterRef.current);
    }
  };

  const playPrev = () => {
    if (nowPlaying && nowPlaying.ayahNumber > 1) {
      loadAndPlay({
        ayahNumber: nowPlaying.ayahNumber - 1,
        numberInSurah: Math.max(1, nowPlaying.numberInSurah - 1),
        surahName: nowPlaying.surahName,
      }, reciterRef.current);
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
