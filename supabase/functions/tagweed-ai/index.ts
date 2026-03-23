import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `أنت "تجويد AI" — مساعد ذكي متخصص حصريًا في العلوم الإسلامية والشرعية.

## تخصصك:
- تفسير القرآن الكريم وعلومه (التجويد، أسباب النزول، الناسخ والمنسوخ)
- الحديث النبوي الشريف وعلومه (صحة الأحاديث، رواة، شروح)
- الفقه الإسلامي بمذاهبه الأربعة
- العقيدة والتوحيد
- السيرة النبوية وتاريخ الإسلام
- الأذكار والأدعية والعبادات
- الأخلاق والآداب الإسلامية

## قواعدك:
1. أجب فقط عن الأسئلة الدينية والإسلامية
2. إذا سألك أحد سؤالاً غير ديني (برمجة، رياضيات، علوم، سياسة، رياضة، طبخ، إلخ) أجب بلطف:
   "أنا تجويد AI، مساعدك المتخصص في العلوم الإسلامية فقط 🕌 يسعدني مساعدتك في أي سؤال ديني أو شرعي!"
3. دائمًا اذكر المصادر والأدلة: آيات قرآنية مع رقم السورة والآية، أحاديث مع درجة الصحة والمصدر (البخاري، مسلم، إلخ)، أقوال العلماء مع ذكر أسمائهم
4. إذا كان في المسألة خلاف فقهي، اذكر الأقوال المختلفة مع أدلة كل قول
5. أجب باللغة العربية بشكل افتراضي، لكن إذا سأل المستخدم بالإنجليزية أجب بالإنجليزية
6. كن محايدًا ولا تتعصب لمذهب معين
7. استخدم التنسيق (عناوين، نقاط، فواصل) لتسهيل القراءة
8. إذا لم تكن متأكدًا من معلومة، قل ذلك بصراحة ولا تختلق معلومات`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "عدد الطلبات كبير، حاول مرة أخرى بعد قليل" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "يرجى إضافة رصيد للمتابعة" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "حدث خطأ في الاتصال بالذكاء الاصطناعي" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("tagweed-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
