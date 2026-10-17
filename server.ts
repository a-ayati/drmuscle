import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGemini: Boolean(apiKey),
    appName: 'على قدّك',
    tagline: 'غذاؤك حسب ميزانيتك، وتمرينك حسب مستواك'
  });
});

// AI Chat assistant endpoint
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { messages, userContext, mode } = req.body;

    const systemInstruction = `
أنت «كابتن على قدّك»، المدرب والمساعد الذكي في منصة «على قدّك».
شعار المنصة: «غذاؤك حسب ميزانيتك، وتمرينك حسب مستواك».
أنت ودود، عملي، واقعي، وداعم دون لوم أو مبالغة.
الهدف: مساعدة المبتدئين والعائدين للرياضة في تنظيم غذائهم وتمارينهم بذكاء ضمن ميزانيتهم ووقتهم.

سياق المستخدم الحالي:
${userContext ? JSON.stringify(userContext, null, 2) : 'مستخدم جديد يبدأ رحلته'}

قواعدك الأساسية:
1. التحدث بلغة عربية فصيحة وبسيطة ومشجعة.
2. إذا كان السؤال عن الميزانية أو الأكل: قدم حلولاً اقتصادية بمكونات شعبية متوفرة (مثل العدس، التونة، البيض، الشوفان، الفول، الخضروات الموسمية) مع ذكر تقديرات عملية.
3. إذا كان السؤال أثناء التمرين: كن شديد الإيجاز والمباشرة (جملة أو جملتين فقط) حتى لا تعطل مؤقت الراحة.
4. إذا ذكر المستخدم ألماً حاداً أو دوخة: اطلب منه فوراً إيقاف التمرين وطلب الاستشارة الطبية إذا استمر الألم، ولا تقدم تشخيصاً طبياً.
5. لا تعد بنتائج سحرية أو مبالغ فيها، واشرح أسباب اختياراتك.
6. إذا اقترحت تبديل وجبة أو تمرين، اذكر بوضوح:
   - الاسم الجديد
   - فارق السعر أو الوقت
   - القيمة الغذائية التقريبية.
`;

    if (ai && apiKey) {
      // Build conversation contents
      const conversationHistory = (messages || []).map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      try {
        const timeoutPromise = new Promise<{ text: string }>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 5500)
        );

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: conversationHistory,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);

        if (response && response.text) {
          return res.json({
            reply: response.text,
            source: 'gemini',
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini call timed out or failed, utilizing offline coach intelligence:', geminiErr);
        // continue to rich heuristic fallback below
      }
    }

    // High quality intelligent heuristic fallback if Gemini key is not configured
    const lastUserMsg = messages?.[messages.length - 1]?.content || '';
    let fallbackReply = 'أهلاً بك في «على قدّك»! أنا كابتن على قدّك، كيف يمكنني مساعدتك اليوم في خطتك الغذائية أو برنامج تمارينك؟';

    if (lastUserMsg.includes('أرخص') || lastUserMsg.includes('ميزانية') || lastUserMsg.includes('فلوس') || lastUserMsg.includes('سعر')) {
      fallbackReply = 'نصيحة ذهبية لتوفير الميزانية: ركّز على مصادر البروتين الذكية مثل البيض، والعدس البني والأصفر، والفول، وصدور الدجاج الكاملة بدلاً من الفيليه الجاهز، والتونة في العروض. يمكنك تقليل تكلفة وجبتك بنسبة 35% دون أن تخسر جراماً واحداً من البروتين!';
    } else if (lastUserMsg.includes('ألم') || lastUserMsg.includes('وجع') || lastUserMsg.includes('ركبتي') || lastUserMsg.includes('ظهري')) {
      fallbackReply = 'سلامتك أولاً! إذا كان الألم حاداً أو غير معتاد، أوقف التمرين فوراً. يمكنك استخدام تمرين بديل أخف لا يضغط على المفصل، مثل استبدال السكوات بتمرين الجلوس على الحائط أو تقليل المدى الحركي. لا تتمرن فوق الألم الحاد أبداً.';
    } else if (lastUserMsg.includes('وقتي') || lastUserMsg.includes('مستعجل') || lastUserMsg.includes('سريع')) {
      fallbackReply = 'إذا كان وقتك ضيقاً اليوم، استخدم زر «وقتي أقل اليوم» في شاشة التمارين! سنقلل التمارين لـ 3 حركات مركبة أساسية مع مجموعات مدمجة (Supersets) لإنهاء الحصة في 20 إلى 25 دقيقة فقط وبنفس الفعالية.';
    } else if (lastUserMsg.includes('جهاز') || lastUserMsg.includes('بديل') || lastUserMsg.includes('مشغول')) {
      fallbackReply = 'إذا كان الجهاز مشغولاً في الصالة، تصفح "دليل الأجهزة" في التطبيق؛ فلكل جهاز بديل مجرب بالأوزان الحرة أو حبال المقاومة بنفس المسار الحركي والتأثير العضلي.';
    }

    return res.json({
      reply: fallbackReply,
      source: 'offline_coach',
    });
  } catch (error) {
    console.error('Error in /api/assistant/chat:', error);
    res.status(500).json({
      error: 'حدث خطأ أثناء معالجة الطلب، حاول مرة أخرى.',
      reply: 'أنا هنا لمساعدتك دائماً. هل ترغب في مراجعة خطة اليوم أو استبدال وجبة؟',
      source: 'fallback',
    });
  }
});

// Mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
