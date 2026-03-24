import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { BottomNav } from "@/components/BottomNav";
import Index from "./pages/Index.tsx";
import QuranReader from "./pages/QuranReader.tsx";
import SurahBrowser from "./pages/SurahBrowser.tsx";
import JuzBrowser from "./pages/JuzBrowser.tsx";
import TagweedAI from "./pages/TagweedAI.tsx";
import Quiz from "./pages/Quiz.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import BookmarksPage from "./pages/BookmarksPage.tsx";
import MemorizePage from "./pages/MemorizePage.tsx";
import KhatmaPage from "./pages/KhatmaPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import SignupPage from "./pages/SignupPage.tsx";
import Settings from "./pages/Settings.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/page/:pageNumber" element={<QuranReader />} />
            <Route path="/surah" element={<SurahBrowser />} />
            <Route path="/juz" element={<JuzBrowser />} />
            <Route path="/ai" element={<TagweedAI />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/memorize" element={<MemorizePage />} />
            <Route path="/khatma" element={<KhatmaPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
