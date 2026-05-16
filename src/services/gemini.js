import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. تعريف المكتبة في أعلى الملف (ضروري جداً)
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export const testGemini = async () => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent("قل 'تم الربط بنجاح' إذا كنت تسمعني");
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("خطأ صريح في Gemini:", error.message);
    return null;
  }
};

export const askSanadAI = async (fileBase64, mimeType, disabilityType, userQuestion) => {
  try {
    // استخدمنا genAI هنا، لذا يجب أن يكون معرّفاً في الأعلى
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const safetySettings = [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ];

    const prompt = `
      أنت مساعد منصة سند التعليمية الخبير في تيسير الوصول (Accessibility).
      سياق الطالب: يعاني من ${disabilityType}.
      المهمة: ${userQuestion}
      الرجاء مراعاة نوع الإعاقة في أسلوب الشرح وتقديم بدائل نصية للصور والجداول إن وجدت داخل الملف.
    `;

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType: mimeType, data: fileBase64 } },
          { text: prompt }
        ]
      }],
      safetySettings
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Detail Error:", error);
    return "عذراً، واجهت مشكلة تقنية في تحليل هذا الملف. تأكد من حجم الملف وحاول مرة أخرى.";
  }
};