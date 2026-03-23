import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Send, Home, Bot, User, Loader2, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tagweed-ai`;

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "ما هي أركان الإسلام الخمسة؟",
  "ما حكم صلاة الوتر؟",
  "اذكر لي فضل سورة الكهف",
  "ما هي شروط الوضوء؟",
];

export default function TagweedAI() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Msg = { role: "user", content: trimmed };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const CHAT_URL = `${(supabase as any).supabaseUrl}/functions/v1/tagweed-ai`;
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(supabase as any).supabaseKey}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "فشل الاتصال");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${e.message || "حدث خطأ، حاول مرة أخرى"}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-primary/10 bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link to="/">
            <Button size="icon" variant="ghost" className="rounded-full active:scale-95">
              <Home className="h-5 w-5 text-primary" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-ui text-lg font-bold leading-tight text-foreground">
                Tagweed AI
              </h1>
              <p className="font-ui text-xs text-muted-foreground">مساعدك في العلوم الشرعية</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              size="icon"
              variant="ghost"
              className="mr-auto rounded-full active:scale-95"
              onClick={() => setMessages([])}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center gap-6 pt-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <h2 className="font-ui text-xl font-bold text-foreground">
                  السلام عليكم ورحمة الله
                </h2>
                <p className="mt-2 font-ui text-sm text-muted-foreground">
                  أنا تجويد AI، مساعدك المتخصص في العلوم الإسلامية. اسألني أي سؤال ديني!
                </p>
              </div>
              <div className="grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="rounded-xl border border-primary/15 bg-card px-4 py-3 text-right font-ui text-sm text-foreground transition-all hover:border-primary/30 hover:shadow-sm active:scale-[0.97]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary/10"
                        : "bg-accent/10"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="h-4 w-4 text-primary" />
                    ) : (
                      <Bot className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 font-ui text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-primary/10 text-foreground"
                    }`}
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <Bot className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-primary/10 bg-card px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="font-ui text-sm text-muted-foreground">جاري التفكير...</span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="sticky bottom-0 border-t border-primary/10 bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-end gap-2 px-4 py-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اسأل سؤالك الديني هنا..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-primary/15 bg-background px-4 py-3 font-ui text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20"
            style={{ maxHeight: "120px" }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 120) + "px";
            }}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl active:scale-95"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
