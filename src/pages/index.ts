import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES: Record<string, string> = {
  quran: "القرآن الكريم وعلومه (التفسير، أسباب النزول، الإعجاز، أحكام التلاوة)",
  hadith: "الحديث النبوي الشريف (متون الأحاديث، الرواة، درجات الصحة، الشروح)",
  fiqh: "الفقه الإسلامي (العبادات، المعاملات، الأحوال الشخصية، المذاهب الأربعة)",
  seerah: "السيرة النبوية والتاريخ الإسلامي (الغزوات، الصحابة، الخلفاء الراشدون)",
  aqeedah: "العقيدة والتوحيد (أركان الإيمان، أسماء الله الحسنى، الإيمان بالملائكة والكتب)",
  general: "ثقافة إسلامية عامة (الأذكار، الآداب، الأخلاق، المعاملات اليومية)",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, difficulty = "medium", previousQuestions = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const categoryDesc = CATEGORIES[category] || CATEGORIES.general;
    const difficultyAr = difficulty === "easy" ? "سهل" : difficulty === "hard" ? "صعب" : "متوسط";

    const avoidSection =
      previousQuestions.length > 0
        ? `\n\nتجنّب تمامًا هذه الأسئلة التي سُئلت مسبقًا في هذه الجلسة:\n${previousQuestions
            .map((q: string, i: number) => `${i + 1}. ${q}`)
            .join("\n")}`
        : "";

    const systemPrompt = `أنت مُعلّم إسلامي متخصص في إنشاء أسئلة اختبارية دقيقة وصحيحة.
أنشئ سؤالاً واحداً في مجال: ${categoryDesc}
مستوى الصعوبة: ${difficultyAr}

القواعد:
1. السؤال يجب أن يكون صحيحاً 100% ومبنياً على مصادر موثوقة
2. أعطِ 4 خيارات واحد منها فقط صحيح
3. الخيارات يجب أن تكون منطقية ومعقولة (لا تضع خيارات سخيفة)
4. أضف شرحاً مختصراً للإجابة الصحيحة مع ذكر المصدر (آية، حديث، إجماع)
5. يجب أن يكون السؤال مختلفاً تمامًا في الموضوع والصياغة عن الأسئلة السابقة${avoidSection}

أجب باستخدام الأداة المتاحة فقط.`;

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
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `أنشئ سؤالاً جديداً ومختلفاً في فئة "${categoryDesc}" بمستوى ${difficultyAr}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "create_quiz_question",
                description: "إنشاء سؤال اختباري مع الخيارات والإجابة الصحيحة",
                parameters: {
                  type: "object",
                  properties: {
                    question: { type: "string", description: "نص السؤال" },
                    options: {
                      type: "array",
                      items: { type: "string" },
                      description: "4 خيارات للإجابة",
                    },
                    correct_index: {
                      type: "integer",
                      description: "فهرس الإجابة الصحيحة (0-3)",
                    },
                    explanation: {
                      type: "string",
                      description: "شرح الإجابة الصحيحة مع المصدر",
                    },
                  },
                  required: ["question", "options", "correct_index", "explanation"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "create_quiz_question" } },
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
        JSON.stringify({ error: "حدث خطأ في إنشاء السؤال" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(
        JSON.stringify({ error: "لم يتم إنشاء السؤال بشكل صحيح" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const question = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(question), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("quiz-generate error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
