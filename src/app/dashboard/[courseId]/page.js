"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
// تأكد من أن المسار يؤدي فعلاً لملف جيمني في مشروعك
import { askSanadAI } from "../../services/gemini";

export default function LearningRoom() {
  const { courseId } = useParams();
  const [file, setFile] = useState(null);
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");

  // تحويل الملف لـ Base64 ليرسله لـ Gemini
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAskAI = async () => {
    if (!file) return alert("الرجاء رفع ملف السلايدات أولاً");
    if (!inputText.trim()) return;
    
    const userMessage = inputText;
    setInputText(""); // تفريغ الخانة
    setLoading(true);
    
    try {
      const base64Data = await convertToBase64(file);
      // "بصرية" هي قيمة تجريبية، لاحقاً سنجلب نوع إعاقة المستخدم من قاعدة البيانات
      const response = await askSanadAI(base64Data, file.type, "بصرية", userMessage);
      
      setChat((prev) => [...prev, { role: "user", text: userMessage }, { role: "ai", text: response }]);
    } catch (error) {
      console.error("AI Error:", error);
      alert("فشل في استجابة الذكاء الاصطناعي");
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-100" style={{ direction: "rtl" }}>
      {/* الجزء الأيمن: عرض الملف */}
      <div className="w-1/2 p-4 border-l bg-white flex flex-col shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-blue-800">المادة الدراسية (PDF)</h2>
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={handleFileUpload} 
          className="mb-4 p-2 border rounded w-full bg-gray-50" 
        />
        {file ? (
          <iframe src={URL.createObjectURL(file)} className="w-full h-full border rounded shadow-inner" />
        ) : (
          <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 bg-gray-50">
            ارفع ملف السلايدات هنا للبدء بالدراسة مع سند
          </div>
        )}
      </div>

      {/* الجزء الأيسر: مساعد سند الذكي */}
      <div className="w-1/2 p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-green-800">مساعد سند الذكي 🛡️</h2>
        <div className="flex-1 overflow-y-auto mb-4 p-4 bg-white rounded-xl shadow-md space-y-4">
          {chat.length === 0 && (
            <p className="text-center text-gray-400 mt-10">ارفع الملف واسأل سند أي سؤال عن المحتوى...</p>
          )}
          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none"}`}>
                <p className="text-sm font-bold mb-1">{msg.role === "user" ? "أنت" : "سند"}</p>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-blue-500 animate-pulse font-bold text-center">
              سند يقرأ الملف ويحلل البيانات...
            </div>
          )}
        </div>
        
        <div className="flex gap-2 bg-white p-2 rounded-full shadow-lg border border-gray-200">
          <input 
            type="text" 
            value={inputText}
            placeholder="اسأل سند عن أي شيء في الصفحة..." 
            className="flex-1 p-3 outline-none px-6"
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
          />
          <button 
            onClick={handleAskAI}
            className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition font-bold"
          >
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
}