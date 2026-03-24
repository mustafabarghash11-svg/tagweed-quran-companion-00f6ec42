import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SettingsProvider } from "./context/SettingsContext";
import { BookmarksProvider } from "./context/BookmarksContext";
import { AudioProvider } from "./context/AudioContext";

createRoot(document.getElementById("root")!).render(
  <SettingsProvider>
    <BookmarksProvider>
      <AudioProvider>
        <App />
      </AudioProvider>
    </BookmarksProvider>
  </SettingsProvider>
);
