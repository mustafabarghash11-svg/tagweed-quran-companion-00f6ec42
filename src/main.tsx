import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SettingsProvider } from "./context/SettingsContext";

<SettingsProvider>
  <App />
</SettingsProvider>
createRoot(document.getElementById("root")!).render(<App />);
