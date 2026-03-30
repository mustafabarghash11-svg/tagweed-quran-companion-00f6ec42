import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import Index from "./pages/Index.tsx";
import QuranReader from "./pages/QuranReader.tsx";
import SurahBrowser from "./pages/SurahBrowser.tsx";
import JuzBrowser from "./pages/JuzBrowser.tsx";
import TagweedAI from "./pages/TagweedAI.tsx";
import NotFound from "./pages/NotFound.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import BookmarksPage from "./pages/BookmarksPage.tsx";
import MemorizePage from "./pages/MemorizePage.tsx";
import KhatmaPage from "./pages/KhatmaPage.tsx";
import Settings from "./pages/Settings.tsx";
import PrayerTimesPage from "./pages/PrayerTimesPage.tsx";
import DhikrPage from "./pages/DhikrPage.tsx";
import NamesOfAllah from "./pages/NamesOfAllah.tsx";
import Quiz from "./pages/Quiz.tsx";
import { ChatProvider } from "./context/ChatContext";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/page/:pageNumber" element={<QuranReader />} />
            <Route path="/surah" element={<SurahBrowser />} />
            <Route path="/juz" element={<JuzBrowser />} />
            <Route path="/ai" element={
              <ChatProvider>
                <TagweedAI />
              </ChatProvider>
            } />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/memorize" element={<MemorizePage />} />
            <Route path="/khatma" element={<KhatmaPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/prayer-times" element={<PrayerTimesPage />} />
            <Route path="/dhikr" element={<DhikrPage />} />
            <Route path="/names-of-allah" element={<NamesOfAllah />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
