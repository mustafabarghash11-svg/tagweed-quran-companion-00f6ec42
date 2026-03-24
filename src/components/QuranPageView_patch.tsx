// أضف هذا داخل QuranPageView.tsx

import { reciters } from "../data/reciters";
import { useSettings } from "../context/SettingsContext";

const { reciter } = useSettings();
const selectedReciter = reciters.find(r => r.id === reciter);

const playAudio = () => {
  if (!selectedReciter) return;

  const audio = new Audio(
    `${selectedReciter.baseUrl}${pageNumber}.mp3`
  );
  audio.play();
};

// زر
<button onClick={playAudio}>
  تشغيل التلاوة ▶️
</button>
