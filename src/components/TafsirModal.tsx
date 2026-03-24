import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Ayah } from '@/lib/quran-api';

interface TafsirModalProps {
  ayah: Ayah | null;
  onClose: () => void;
}

const EDITIONS = [
  { id: 'ar.muyassar', label: 'السعدي' },
  { id: 'ar.jalalayn', label: 'الجلالين' },
  { id: 'ar.ibنكثير', label: 'ابن كثير' },
] as const;

// ابن كثير identifier الصح
const EDITIONS_FIXED = [
  { id: 'ar.muyassar', label: 'السعدي' },
  { id: 'ar.jalalayn', label: 'الجلالين' },
  { id: 'ar.kathir', label: 'ابن كثير' },
];

export function TafsirModal({ ayah, onClose }: TafsirModalProps) {
  const [selectedEdition, setSelectedEdition] = useState(EDITIONS_FIXED[0].id);
  const [tafsir, setTafsir] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ayah) return;
    setIsLoading(true);
    setError(false);
    setTafsir('');

    fetch(`https://api.alquran.cloud/v1/ayah/${ayah.number}/${selectedEdition}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.code === 200) {
          setTafsir(json.data.text);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [ayah, selectedEdition]);

  if (!ayah) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed bottom-0 inset-x-0 z-50 max-h-[75vh] rounded-t-2xl bg-card shadow-2xl flex flex-col"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/20 px-4 py-3">
          <div>
            <h3 className="font-ui text-sm font-bold text-primary">{ayah.surah.name}</h3>
            <p className="font-ui text-xs text-muted-foreground">آية {ayah.numberInSurah}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* نص الآية */}
        <div className="border-b border-primary/10 px-4 py-3">
          <p className="font-quran text-xl leading-loose text-right text-foreground">
            {ayah.text}
          </p>
        </div>

        {/* اختيار التفسير */}
        <div className="flex gap-2 px-4 py-2 border-b border-primary/10">
          {EDITIONS_FIXED.map((ed) => (
            <button
              key={ed.id}
              onClick={() => setSelectedEdition(ed.id)}
              className={`rounded-lg px-3 py-1 font-ui text-xs transition-colors ${
                selectedEdition === ed.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {ed.label}
            </button>
          ))}
        </div>

        {/* التفسير */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {error && (
            <p className="text-center font-ui text-sm text-muted-foreground py-8">
              تعذر تحميل التفسير
            </p>
          )}
          {!isLoading && !error && tafsir && (
            <p className="font-ui text-sm leading-relaxed text-right text-foreground">
              {tafsir}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
