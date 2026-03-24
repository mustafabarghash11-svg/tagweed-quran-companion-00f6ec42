import { reciters } from "../data/reciters";
import { useSettings } from "../context/SettingsContext";
import { useState } from "react";

export default function Settings() {
  const { reciter, setReciter, theme, setTheme } = useSettings();

  const [pages, setPages] = useState(1);
  const totalPages = 604;
  const days = Math.ceil(totalPages / pages);

  return (
    <div style={{ padding: 20 }}>
      <h2>الإعدادات</h2>

      <h3>اختيار القارئ</h3>
      <select value={reciter} onChange={(e) => setReciter(e.target.value)}>
        {reciters.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>

      <h3>الثيم</h3>
      <button onClick={() => setTheme("light")}>فاتح</button>
      <button onClick={() => setTheme("dark")}>غامق</button>

      <h3>خطة الختمة</h3>
      <input
        type="number"
        value={pages}
        onChange={(e) => setPages(Number(e.target.value))}
      />
      <p>رح تختم خلال: {days} يوم</p>
    </div>
  );
}
