export const reciters = [
  { id: 'husary', name: 'الحصري', baseUrl: 'https://server8.mp3quran.net/husary/', apiId: 'ar.husary' },
  { id: 'sudais', name: 'السديس', baseUrl: 'https://server11.mp3quran.net/sds/', apiId: 'ar.abdulbasitmurattal' },
  { id: 'minshawi', name: 'المنشاوي', baseUrl: 'https://server10.mp3quran.net/minsh/', apiId: 'ar.minshawi' },
  { id: 'alafasy', name: 'العفاسي', baseUrl: 'https://server10.mp3quran.net/alafasy/', apiId: 'ar.alafasy' },
  { id: 'abdulbasit', name: 'عبد الباسط', baseUrl: 'https://server7.mp3quran.net/basit/', apiId: 'ar.abdulbasit' },
];

export type Reciter = typeof reciters[0];
