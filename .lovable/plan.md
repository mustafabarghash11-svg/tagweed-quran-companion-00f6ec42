

# Tagweed (تجويد) — Quran Reading Website

## Design
- Islamic-themed UI with cream/gold color scheme and dark mode option
- RTL Arabic-first layout with beautiful Quran typography (Amiri Quran / KFGQPC Uthmanic Script from Google Fonts)
- Responsive for mobile and desktop

## Pages & Components

### 1. Home / Landing Page
- App name "تجويد" with elegant branding
- Quick navigation: Browse by Surah, Juz, or Page
- Surah list (114 surahs) with Arabic names, English transliteration, ayah count, and revelation type

### 2. Quran Reader Page (`/page/:pageNumber`)
- **Top Info Bar** (sticky): Surah name (Arabic), Page number, Juz number, Ayah range
- **Quran text display**: Page-by-page Mushaf-style layout with proper RTL rendering
- **Ayah numbering**: Arabic-Indic numerals (٫١٢٣) inline with text
- **Navigation controls**: Previous/Next page arrows, page jump input
- Loading skeleton while fetching from API

### 3. Surah Browser (`/surah`)
- Grid/list of all 114 surahs with metadata
- Click to navigate to the page where that surah starts

### 4. Juz Browser (`/juz`)
- List of 30 Juz with starting surah/ayah info
- Click to navigate to the corresponding page

## Data Integration
- All Quran text fetched from `api.alquran.cloud/v1/` using `quran-uthmani` edition
- Endpoints: `/surah` (list), `/page/{number}/quran-uthmani` (page text), `/juz/{number}/quran-uthmani`
- React Query for caching and loading states
- Never hardcode Quran text

## Design System
- Cream/warm background with gold accents
- Dark mode with deep navy/charcoal
- Arabic typography: Amiri Quran font for Quran text, Tajawal for UI text
- Gold borders and Islamic geometric patterns as subtle decorations

