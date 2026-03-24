import { Play, Pause, SkipForward, SkipBack, X } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { toArabicNumeral } from '@/lib/quran-api';
import { Button } from '@/components/ui/button';

export function AudioPlayer() {
  const { nowPlaying, isPlaying, progress, togglePlay, stop, playNext, playPrev } = useAudio();

  if (!nowPlaying) return null;

  return (
    <div
      className="fixed bottom-16 inset-x-0 z-50 mx-auto max-w-md px-3"
      dir="rtl"
    >
      <div className="rounded-2xl border border-primary/20 bg-card/95 shadow-xl backdrop-blur-md px-4 py-3">
        {/* Info */}
        <div className="mb-2 flex items-center justify-between">
          <span className="font-ui text-xs text-muted-foreground">
            {nowPlaying.surahName} · آية {toArabicNumeral(nowPlaying.numberInSurah)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={stop}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="mb-3 h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary hover:bg-primary/10"
            onClick={playNext}
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 mr-[-2px]" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary hover:bg-primary/10"
            onClick={playPrev}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
