import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Send, Loader2, Sparkles, Trash2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `أنت "Tagweed AI"، مساعد إسلامي متخصص مدمج في تطبيق القرآن الكريم "تجويد".

قواعدك الصارمة:
1. تجيب فقط على الأسئلة المتعلقة بـ: القرآن الكريم وتفسيره، الحديث النبوي، الفقه والأحكام الشرعية، السيرة النبوية، العقيدة الإسلامية، الأدعية والأذكار، التاريخ الإسلامي.
2. إذا سألك أحد عن أي موضوع خارج الإسلام والدين (سياسة، تقنية، طبخ، رياضة، ترفيه...الخ) تقول بأدب: "أنا Tagweed AI، متخصص في الأسئلة الإسلامية فقط. يسعدني مساعدتك في أي سؤال ديني."
3. ابدأ إجاباتك بـ "بسم الله الرحمن الرحيم" عند الأسئلة الدينية المهمة.
4. اذكر الدليل من القرآن أو السنة عند الإمكان.
5. إذا كانت المسألة خلافية، اذكر أشهر الآراء الفقهية بإنصاف.
6. لغتك العربية الفصحى البسيطة.
7. كن متواضعاً وقل "الله أعلم" عند الشك.`;

export default function AiPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // تعديل ارتفاع الـ textarea تلقائياً
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [input]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `خطأ ${res.status}`);
      }

      const data = await res.json();
      const reply = data.content?.[0]?.text || 'لم أتمكن من الإجابة، حاول مرة أخرى.';

      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في الاتصال');
      // أزل رسالة المستخدم لو فشل الطلب
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-primary/20 bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-primary hover:scale-105 active:scale-95 transition-transform">
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-ui text-sm font-bold leading-tight">Tagweed AI</p>
                <p className="font-ui text-[10px] text-muted-foreground">مساعد إسلامي</p>
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 font-ui text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              مسح
            </button>
          )}
        </div>
      </header>

      {/* المحادثة */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-4 space-y-4">

          {/* شاشة الترحيب */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 pt-12 pb-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-ui text-xl font-bold">Tagweed AI</h2>
                <p className="font-ui text-sm text-muted-foreground mt-1">
                  اسألني أي سؤال إسلامي
                </p>
              </div>
              {/* أسئلة مقترحة */}
              <div className="grid grid-cols-1 gap-2 w-full max-w-sm mt-2">
                {[
                  'ما تفسير آية الكرسي؟',
                  'ما هي أركان الإسلام؟',
                  'ما فضل قراءة القرآن؟',
                  'ما سبب نزول سورة الكهف؟',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); textareaRef.current?.focus(); }}
                    className="rounded-xl border border-primary/15 bg-card px-4 py-3 font-ui text-sm text-right hover:bg-primary/5 hover:border-primary/30 transition-colors active:scale-[0.98]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* الرسائل */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 font-ui text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-card border border-primary/15 text-foreground rounded-tl-sm'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-primary/10">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="text-[11px] font-bold text-primary">Tagweed AI</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* مؤشر التحميل */}
          {loading && (
            <div className="flex justify-end">
              <div className="bg-card border border-primary/15 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="font-ui text-xs text-muted-foreground">جارٍ التفكير...</span>
                </div>
              </div>
            </div>
          )}

          {/* الخطأ */}
          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-center">
              <p className="font-ui text-sm text-destructive">{error}</p>
              <button
                onClick={() => setError(null)}
                className="font-ui text-xs text-muted-foreground mt-1 hover:text-foreground"
              >
                إغلاق
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* مربع الإدخال */}
      <div className="flex-shrink-0 border-t border-primary/20 bg-card/95 backdrop-blur-sm p-3">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-end gap-2 rounded-2xl border border-primary/20 bg-background px-3 py-2 focus-within:border-primary/40 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اسأل سؤالاً إسلامياً..."
              rows={1}
              className="flex-1 resize-none bg-transparent font-ui text-sm outline-none placeholder:text-muted-foreground min-h-[36px] max-h-[120px] py-1.5"
              dir="rtl"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {loading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Send className="h-4 w-4" />
              }
            </button>
          </div>
          <p className="font-ui text-[10px] text-muted-foreground text-center mt-2">
            Tagweed AI متخصص في الأسئلة الإسلامية فقط
          </p>
        </div>
      </div>
    </div>
  );
}
