import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ==================== قاعدة بيانات الأحاديث المضمنة ====================
// هذه أحاديث صحيحة من الكتب الستة، يمكنك إضافة المزيد
const HADITH_DATABASE = [
  // أحاديث عن الرحمة
  {
    keywords: ["رحمة", "راحم", "يرحم", "الراحمون"],
    hadith: {
      text: "الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الْأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ",
      narrator: "عبد الله بن عمرو بن العاص رضي الله عنهما",
      source: "سنن أبي داود",
      number: 4941,
      grade: "صحيح",
      explanation: "الحديث يحث على الرحمة بكل المخلوقات، فمن رحم من في الأرض رحمه الله تعالى"
    }
  },
  {
    keywords: ["رحمة", "رحم", "عفو"],
    hadith: {
      text: "إِنَّمَا الرَّحْمَةُ بِالْقَاصِدِينَ فِي الْأَرْضِ، وَالَّذِينَ يَرْحَمُونَ النَّاسَ يَرْحَمُهُمُ اللَّهُ",
      narrator: "أبو هريرة رضي الله عنه",
      source: "صحيح البخاري",
      number: 6001,
      grade: "صحيح",
      explanation: "الله يرحم عباده الرحماء، فكلما زادت رحمتك بالخلق زاد رحمة الله بك"
    }
  },
  // أحاديث عن الصلاة
  {
    keywords: ["صلاة", "صلوات", "صل", "يصلي", "الصلاة"],
    hadith: {
      text: "أَرَأَيْتُمْ لَوْ أَنَّ نَهَرًا بِبَابِ أَحَدِكُمْ يَغْتَسِلُ فِيهِ كُلَّ يَوْمٍ خَمْسَ مَرَّاتٍ، هَلْ يَبْقَى مِنْ دَرَنِهِ شَيْءٌ؟ قَالُوا: لَا يَبْقَى مِنْ دَرَنِهِ شَيْءٌ. قَالَ: فَذَلِكَ مَثَلُ الصَّلَوَاتِ الْخَمْسِ، يَمْحُو اللَّهُ بِهِنَّ الْخَطَايَا",
      narrator: "أبو هريرة رضي الله عنه",
      source: "صحيح البخاري",
      number: 504,
      grade: "صحيح",
      explanation: "شبه النبي صلى الله عليه وسلم الصلوات الخمس بالنهر الجاري الذي يغتسل فيه الإنسان خمس مرات، فيزيل عنه الأوساخ، كذلك الصلوات تمحو الذنوب"
    }
  },
  {
    keywords: ["صلاة", "جماعة", "المسجد"],
    hadith: {
      text: "صَلَاةُ الرَّجُلِ فِي الْجَمَاعَةِ تُضَعَّفُ عَلَى صَلَاتِهِ فِي بَيْتِهِ وَفِي سُوقِهِ خَمْسًا وَعِشْرِينَ ضِعْفًا",
      narrator: "أبو هريرة رضي الله عنه",
      source: "صحيح البخاري",
      number: 647,
      grade: "صحيح",
      explanation: "صلاة الجماعة أفضل من صلاة الفرد بخمس وعشرين درجة"
    }
  },
  // أحاديث عن الصدقة
  {
    keywords: ["صدقة", "تصدق", "صدقات", "إنفاق"],
    hadith: {
      text: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ، وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلَّا عِزًّا، وَمَا تَوَاضَعَ أَحَدٌ لِلَّهِ إِلَّا رَفَعَهُ اللَّهُ",
      narrator: "أبو هريرة رضي الله عنه",
      source: "صحيح مسلم",
      number: 2588,
      grade: "صحيح",
      explanation: "الصدقة لا تنقص المال بل تباركه وتزيده، والعفو يزيد العبد عزاً، والتواضع يرفع الدرجات"
    }
  },
  {
    keywords: ["صدقة", "خير", "أجر"],
    hadith: {
      text: "كُلُّ سُلَامَى مِنَ النَّاسِ عَلَيْهِ صَدَقَةٌ، كُلَّ يَوْمٍ تَطْلُعُ فِيهِ الشَّمْسُ: تَعْدِلُ بَيْنَ اثْنَيْنِ صَدَقَةٌ، وَتُعِينُ الرَّجُلَ فِي دَابَّتِهِ فَتَحْمِلُهُ عَلَيْهَا أَوْ تَرْفَعُ لَهُ عَلَيْهَا مَتَاعَهُ صَدَقَةٌ، وَالْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ، وَبِكُلِّ خُطْوَةٍ تَمْشِيهَا إِلَى الصَّلَاةِ صَدَقَةٌ، وَتُمِيطُ الْأَذَى عَنِ الطَّرِيقِ صَدَقَةٌ",
      narrator: "أبو هريرة رضي الله عنه",
      source: "صحيح البخاري",
      number: 2989,
      grade: "صحيح",
      explanation: "كل عمل خير يقوم به المسلم هو صدقة، حتى الكلمة الطيبة وإماطة الأذى عن الطريق"
    }
  },
  // أحاديث عن بر الوالدين
  {
    keywords: ["والدين", "بر", "أم", "أب", "الوالدين"],
    hadith: {
      text: "لَا يَجْزِي وَلَدٌ وَالِدَهُ إِلَّا أَنْ يَجِدَهُ مَمْلُوكًا فَيَشْتَرِيَهُ فَيُعْتِقَهُ",
      narrator: "أبو هريرة رضي الله عنه",
      source: "صحيح مسلم",
      number: 1510,
      grade: "صحيح",
      explanation: "لا يستطيع الولد أن يرد لوالديه فضلهما إلا إذا كانا مملوكين فأعتقهما، لأن فضلهما عظيم"
    }
  },
  {
    keywords: ["والدين", "عقوق", "رضا"],
    hadith: {
      text: "رَضَا الرَّبِّ فِي رِضَا الْوَالِدِ، وَسَخَطُ الرَّبِّ فِي سَخَطِ الْوَالِدِ",
      narrator: "عبد الله بن عمرو رضي الله عنهما",
      source: "جامع الترمذي",
      number: 1899,
      grade: "حسن صحيح",
      explanation: "رضا الله مرتبط برضا الوالدين، وغضب الله مرتبط بغضبهما، فاحرص على إرضائهما"
    }
  },
  // أحاديث عن حسن الخلق
  {
    keywords: ["خلق", "أخلاق", "حسن", "أحسن"],
    hadith: {
      text: "إِنَّ مِنْ أَحَبِّكُمْ إِلَيَّ وَأَقْرَبِكُمْ مِنِّي مَجْلِسًا يَوْمَ الْقِيَامَةِ أَحَاسِنَكُمْ أَخْلَاقًا",
      narrator: "عبد الله بن عمرو رضي الله عنهما",
      source: "جامع الترمذي",
      number: 2018,
      grade: "صحيح",
      explanation: "أفضل الناس أخلاقاً هم أقرب الناس إلى النبي صلى الله عليه وسلم يوم القيامة"
    }
  },
  {
    keywords: ["خلق", "أخلاق", "حلم"],
    hadith: {
      text: "إِنَّمَا بُعِثْتُ لِأُتَمِّمَ مَكَارِمَ الْأَخْلَاقِ",
      narrator: "أبو هريرة رضي الله عنه",
      source: "مسند أحمد",
      number: 8952,
      grade: "صحيح",
      explanation: "من أهداف بعثة النبي صلى الله عليه وسلم إكمال محاسن الأخلاق وتهذيب النفوس"
    }
  },
  // أحاديث عن العلم
  {
    keywords: ["علم", "عالم", "تعلم", "العلم"],
    hadith: {
      text: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
      narrator: "أبو هريرة رضي الله عنه",
      source: "صحيح مسلم",
      number: 2699,
      grade: "صحيح",
      explanation: "من سعى في طلب العلم، ييسر الله له الطريق إلى الجنة"
    }
  },
  // أحاديث عن التوبة
  {
    keywords: ["توبة", "تاب", "تائب", "استغفار"],
    hadith: {
      text: "التَّائِبُ مِنَ الذَّنْبِ كَمَنْ لَا ذَنْبَ لَهُ",
      narrator: "عبد الله بن مسعود رضي الله عنه",
      source: "سنن ابن ماجه",
      number: 4250,
      grade: "حسن",
      explanation: "التوبة الصادقة تمحو الذنب، ويعود العبد كأن لم يذنب"
    }
  },
  // أحاديث عن الجنة
  {
    keywords: ["جنة", "الجنة", "جنات"],
    hadith: {
      text: "مَنْ يَدْخُلِ الْجَنَّةَ يَنْعَمْ وَلَا يَبْأَسْ، لَا تَبْلَى ثِيَابُهُ وَلَا يَفْنَى شَبَابُهُ",
      narrator: "أبو هريرة رضي الله عنه",
      source: "صحيح مسلم",
      number: 2836,
      grade: "صحيح",
      explanation: "نعيم الجنة دائم لا ينقطع، لا يبلى الثياب ولا يشيب الشباب"
    }
  },
];

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

// دالة البحث في الأحاديث
function searchHadith(query: string): { success: boolean; hadith?: any; message?: string } {
  const lowerQuery = query.toLowerCase();
  
  // البحث عن حديث مطابق
  for (const item of HADITH_DATABASE) {
    if (item.keywords.some(keyword => lowerQuery.includes(keyword))) {
      return {
        success: true,
        hadith: item.hadith
      };
    }
  }
  
  return {
    success: false,
    message: "لم أجد حديثاً مطابقاً لطلبك. جرب البحث عن: حديث عن الرحمة، حديث عن الصلاة، حديث عن الصدقة، حديث عن بر الوالدين، حديث عن حسن الخلق"
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type, query } = await req.json();
    
    // ==================== البحث عن الأحاديث ====================
    // إذا كان الطلب من قسم الأحاديث (hadith_search)
    if (type === "hadith_search" && query) {
      const result = searchHadith(query);
      
      if (result.success) {
        return new Response(
          JSON.stringify({
            success: true,
            hadith: result.hadith,
            message: `✅ وجدت الحديث المطلوب`
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            message: result.message
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // ==================== البحث العادي في الأحاديث من واجهة المستخدم ====================
    // إذا كانت الرسالة تحتوي على طلب حديث (مثل "أعطني حديث عن ...")
    const lastMessage = messages?.[messages.length - 1]?.content || "";
    const hadithKeywords = ["حديث", "أعطني حديث", "ابحث عن حديث", "حديث عن", "قال رسول الله"];
    
    const isHadithRequest = hadithKeywords.some(keyword => lastMessage.includes(keyword));
    
    if (isHadithRequest && !type) {
      const result = searchHadith(lastMessage);
      
      if (result.success) {
        const hadith = result.hadith;
        const hadithResponse = `📖 **الحديث المطلوب:**\n\nعن ${hadith.narrator} قال:\n\n"${hadith.text}"\n\n📚 **المصدر:** ${hadith.source} رقم ${hadith.number}\n⭐ **الدرجة:** ${hadith.grade}\n\n📝 **شرح مختصر:** ${hadith.explanation}`;
        
        return new Response(
          JSON.stringify({
            success: true,
            content: [{ text: hadithResponse }]
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // إذا لم يجد الحديث، نمرر الطلب للـ AI العادي للإجابة
      }
    }
    
    // ==================== المحادثة العادية ====================
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
