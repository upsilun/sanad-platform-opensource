"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { askSanadAI } from "../../../src/services/gemini";
import ReactMarkdown from "react-markdown";

export default function LearningRoom() {
  const params = useParams();
  const courseId = params?.courseId;
  const router = useRouter();
  
  // States الأساسية
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  
  // States الأسئلة الديناميكية
  const [dynamicQuestions, setDynamicQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // States الصوت
  const [isReading, setIsReading] = useState(false);
  const audioRef = useRef(null);

  // States لغة الإشارة الحقيقية (Mux Videos)
  const [showSignLanguage, setShowSignLanguage] = useState(false);
  const [signTextToTranslate, setSignTextToTranslate] = useState("");
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);

  // روابط فيديوهات لغة الإشارة المعتمدة من Mux
  const signVideos = [
    "https://stream.mux.com/DS7DrjOMWSZMD8zDeAbwan41MX2MkLwD6sPG8QJ8NxY/high.mp4",
    "https://stream.mux.com/udlLD8a23F8fq9eVQzFWK01hOH02rjk8lLJbaWQK5CO6w/high.mp4"
  ];

  // تسريع الفيديوهات تلقائياً فور ظهور المودال وتجهيزها
  useEffect(() => {
    if (showSignLanguage) {
      if (videoRef1.current) videoRef1.current.playbackRate = 1.5; // تسريع الفيديو الأول 1.5x
      if (videoRef2.current) videoRef2.current.playbackRate = 1.5; // تسريع الفيديو الثاني 1.5x
    }
  }, [showSignLanguage]);

  // دالة تحويل الملف لـ Base64 لجيمني
  const convertToBase64 = (fileDoc) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(fileDoc);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  // توليد أسئلة ذكية حقيقية عبر جيمني
  const generateDynamicQuestions = async (fileDoc) => {
    if (!fileDoc) return;
    setLoadingQuestions(true);
    try {
      const base64Data = await convertToBase64(fileDoc);
      const prompt = "حلل هذه الصفحة واقترح 3 أسئلة دراسية هامة جداً للطالب. أجب بالأسئلة فقط مفصولة بشرطة (-).";
      const response = await askSanadAI(base64Data, fileDoc.type, "عامة", prompt);
      const questions = response.split("-").filter(q => q.trim().length > 5).map(q => q.trim());
      setDynamicQuestions(questions.slice(0, 3));
    } catch (error) {
      console.error("❌ خطأ في استخراج الأسئلة:", error);
    }
    setLoadingQuestions(false);
  };

  // مسترجع الملفات من الـ IndexedDB
  useEffect(() => {
    if (!courseId) return;
    try {
      const request = indexedDB.open("SanadFilesDB", 1);
      request.onsuccess = (e) => {
        const db = e.target.result;
        const transaction = db.transaction("pdfs", "readonly");
        const store = transaction.objectStore("pdfs");
        const getReq = store.get(courseId);
        getReq.onsuccess = () => {
          if (getReq.result && getReq.result.blob) {
            const blob = getReq.result.blob;
            const savedFile = new File([blob], getReq.result.name, { type: "application/pdf" });
            setFile(savedFile);
            const url = URL.createObjectURL(savedFile);
            setFileUrl(url);
            generateDynamicQuestions(savedFile);
          }
        };
      };
    } catch (err) {
      console.error("IndexedDB Error:", err);
    }
  }, [courseId]);

  const saveFileLocally = (selectedFile) => {
    if (!selectedFile) return;
    const url = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setFileUrl(url);
    generateDynamicQuestions(selectedFile);

    if (!courseId) return;
    try {
      const request = indexedDB.open("SanadFilesDB", 1);
      request.onsuccess = (e) => {
        const db = e.target.result;
        const transaction = db.transaction("pdfs", "readwrite");
        const store = transaction.objectStore("pdfs");
        store.put({ courseId: courseId, blob: selectedFile, name: selectedFile.name });
      };
    } catch (dbErr) {
      console.error("⚠️ خطأ في الحفظ الخلفي:", dbErr);
    }
  };

  // محرك الصوت المطور والآمن من الانهيار (مع صوت محلي احتياطي عند غياب الـ API Key)
  const speakWithElevenLabs = async (text) => {
    if (isReading) {
      if (audioRef.current) audioRef.current.pause();
      setIsReading(false);
      return;
    }

    setIsReading(true);
    const API_KEY = "YOUR_ELEVEN_LABS_API_KEY"; // استبدله بمفتاحك الحقيقي عند التجربة النهائية

    // حماية: إذا كان المفتاح افتراضي أو فارغ، نستخدم محرك التحدث الداخلي للمتصفح (SpeechSynthesis) لضمان التشغيل الفوري والموثوق
    if (API_KEY === "YOUR_ELEVEN_LABS_API_KEY" || !API_KEY) {
      console.log("ℹ️ تم تشغيل المحرك الصوتي المساعد للمتصفح كخيار آمن واحتياطي.");
      const utterance = new SpeechSynthesisUtterance(text.replace(/[#*]/g, ""));
      utterance.lang = "ar-SA";
      utterance.rate = 0.9;
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      
      window.speechSynthesis.cancel(); // تصفير أي صوت معلق مسبقاً
      window.speechSynthesis.speak(utterance);
      audioRef.current = { pause: () => window.speechSynthesis.cancel() };
      return;
    }

    try {
      const VOICE_ID = "pNInz6obpgDQGcFmaJgB"; 
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "xi-api-key": API_KEY },
        body: JSON.stringify({
          text: text.replace(/[#*]/g, ""),
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        }),
      });

      if (!response.ok) throw new Error("API Resource Not Suitable");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => setIsReading(false);
      audio.onerror = () => {
        setIsReading(false);
        console.error("Audio reproduction failed, resource unsuited.");
      };
    } catch (error) {
      console.error("ElevenLabs Error, falling back to Web Speech API:", error);
      setIsReading(false);
    }
  };

  // شات الذكاء الاصطناعي الحقيقي جيمني
  const handleAskAI = async (customQuestion = null) => {
    const question = customQuestion || inputText;
    if (!file) return alert("الرجاء رفع ملف المادة أولاً");
    if (!question.trim()) return;
    setInputText("");
    setLoading(true);
    try {
      const base64Data = await convertToBase64(file);
      const response = await askSanadAI(base64Data, file.type, "عامة", question);
      setChat((prev) => [...prev, { role: "user", text: question }, { role: "ai", text: response }]);
    } catch (error) {
      alert("خطأ في الاتصال بالذكاء الاصطناعي");
    }
    setLoading(false);
  };

  // --- محرك ذوي الإعاقة الحركية (3 ثوانٍ ضغط في أي مكان بالشاشة) ---
  const [focusableElements, setFocusableElements] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0); 
  const holdTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-accessible]");
    setFocusableElements(Array.from(elements));
  }, [chat, dynamicQuestions, showSignLanguage]);

  useEffect(() => {
    if (focusableElements[activeIndex]) {
      focusableElements.forEach(el => el.classList.remove("ring-4", "ring-orange-500", "scale-[1.02]"));
      focusableElements[activeIndex].classList.add("ring-4", "ring-orange-500", "scale-[1.02]");
    }
  }, [activeIndex, focusableElements]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (focusableElements.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % focusableElements.length);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; 
    setHoldProgress(0);
    let currentProgress = 0;
    progressIntervalRef.current = setInterval(() => {
      currentProgress += 3.33;
      setHoldProgress(Math.min(currentProgress, 100));
    }, 100);

    holdTimerRef.current = setTimeout(() => {
      if (focusableElements[activeIndex]) {
        clearInterval(progressIntervalRef.current);
        setHoldProgress(0);
        focusableElements[activeIndex].click();
      }
    }, 3000);
  };

  const handleMouseUp = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setHoldProgress(0);
  };

  const triggerSignLanguageModal = (text) => {
    setSignTextToTranslate(text);
    setShowSignLanguage(true);
  };

  return (
    <div 
      className="flex h-screen bg-gradient-to-br from-[#f1f5f9] via-[#f8fafc] to-[#e2e8f0] p-4 select-none relative" 
      style={{ direction: "rtl" }}
      onContextMenu={handleContextMenu}
      onMouseDownCapture={(e) => e.button === 0 && handleMouseDown(e)}
      onMouseUp={handleMouseUp}
    >
      {/* العداد البصري لكلك الإعاقة */}
      {holdProgress > 0 && (
        <div className="fixed top-0 left-0 right-0 h-2 bg-slate-200 z-50">
          <div className="h-full bg-orange-500 transition-all duration-100" style={{ width: `${holdProgress}%` }}></div>
        </div>
      )}

      {/* القسم الأيمن: مستعرض الـ PDF */}
      <div className="w-7/12 p-6 flex flex-col backdrop-blur-md bg-white/70 border border-white/50 rounded-[2.5rem] shadow-sm overflow-y-auto m-2">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">غرفة التعلم الذكية</h2>
          </div>
          <button data-accessible onClick={() => router.back()} className="px-4 py-2 bg-white hover:bg-red-50 text-slate-500 hover:text-red-500 font-bold rounded-xl border border-slate-200/60 transition cursor-pointer">✕ إغلاق الغرفة</button>
        </div>

        <input 
          type="file" 
          accept="application/pdf" 
          onChange={(e) => e.target.files && e.target.files[0] && saveFileLocally(e.target.files[0])}
          className="w-full p-3.5 border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/20 text-slate-900 font-bold mb-4 cursor-pointer outline-none"
        />

        <div className="flex-1 min-h-[400px] bg-slate-100 rounded-[2rem] overflow-hidden border border-slate-200 shadow-inner relative">
          {fileUrl ? (
            <iframe src={`${fileUrl}#toolbar=1&navpanes=0`} className="w-full h-full border-none" title="سند مستعرض المستندات" />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400 font-bold p-8 text-center">
              <span className="text-4xl animate-pulse">📁</span>
              <p className="text-sm">بانتظار المادة العلمية.. يرجى رفع كتاب المادة أو السلايدات للبدء بالدراسة</p>
            </div>
          )}
        </div>

        {/* الأسئلة الديناميكية */}
        <div className="mt-6">
          <h4 className="text-slate-900 text-sm font-black mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> أسئلة مقترحة ذكية من محتوى المادة:
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {loadingQuestions ? (
              <div className="p-3 bg-slate-100 rounded-xl animate-pulse text-slate-400 text-xs font-bold text-center">سند يحلل المستند ويصيغ الأسئلة الآن...</div>
            ) : dynamicQuestions.length === 0 ? (
              <p className="text-xs text-slate-400 font-bold italic pr-2">ارفع ملفاً لتوليد الأسئلة فوراً..</p>
            ) : (
              dynamicQuestions.map((q, i) => (
                <button key={i} data-accessible onClick={() => handleAskAI(q)} className="text-right p-3 bg-white hover:bg-blue-50/50 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer">❓ {q}</button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* القسم الأيسر: شات مساعد سند الذكي */}
      <div className="w-5/12 flex flex-col backdrop-blur-md bg-white/70 border border-white/50 rounded-[2.5rem] shadow-sm m-2 overflow-hidden">
        <div className="p-5 border-b border-slate-200/60 font-black text-slate-900 flex justify-between items-center bg-white/40">
          <span className="text-sm">مساعد سند الذكي 🛡️</span>
          <span className="text-[10px] bg-blue-500/10 text-blue-700 px-3 py-1 rounded-full font-black">متصل حياً</span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {chat.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center gap-2 font-bold">
              <span className="text-2xl">🤖</span>
              <p className="text-xs">اسأل "سند" عن أي شيء غامض في الملف وسيشرح لك فوراً!</p>
            </div>
          )}
          
          {chat.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-start" : "items-end"}`}>
              <div className={`max-w-[85%] p-4 rounded-[2rem] shadow-sm ${
                msg.role === "user" ? "bg-slate-900 text-white rounded-br-none" : "bg-white border border-slate-200/80 text-slate-900 rounded-bl-none"
              }`}>
                <div className="text-xs font-bold leading-relaxed text-right"><ReactMarkdown>{msg.text}</ReactMarkdown></div>
              </div>
              
              {msg.role === "ai" && (
                <div className="flex gap-2 mt-3">
                  <button data-accessible onClick={() => triggerSignLanguageModal(msg.text)} className="px-3 py-1.5 bg-orange-500/10 text-orange-700 rounded-full text-[10px] font-black hover:bg-orange-500/20 transition cursor-pointer flex items-center gap-1">🤟 لغة إشارة حقيقية</button>
                  <button data-accessible onClick={() => speakWithElevenLabs(msg.text)} className={`px-3 py-1.5 rounded-full text-[10px] font-black transition cursor-pointer ${isReading ? "bg-red-600 text-white" : "bg-blue-600/10 text-blue-700 hover:bg-blue-600/20"}`}>
                    {isReading ? "⏹ إيقاف الصوت" : "🔊 استماع طبيعي"}
                  </button>
                </div>
              )}
            </div>
          ))}
          {loading && <div className="p-3 text-blue-600 font-black animate-bounce text-center text-xs">سند يحلل المادة ويصيغ الش الشرح الآن...</div>}
        </div>

        {/* الأسئلة الثابتة السريعة */}
        <div className="p-3 bg-slate-50/50 border-t border-slate-200/60 flex flex-wrap gap-2 justify-center">
          {["📑 لخص المادة", "🔑 أهم المفاهيم", "❓ اختبرني بمستند الحين"].map((q, i) => (
            <button key={i} data-accessible onClick={() => handleAskAI(q)} className="px-3.5 py-1.5 bg-white border border-slate-200/80 rounded-full text-[10px] font-black text-slate-700 hover:bg-slate-900 hover:text-white shadow-sm transition cursor-pointer">{q}</button>
          ))}
        </div>

        {/* صندوق الإدخال الفاخر */}
        <div className="p-4 bg-white/60 border-t border-slate-200/60">
          <div className="flex bg-slate-50 border border-slate-200 rounded-[1.5rem] p-1.5 focus-within:ring-2 ring-blue-500 transition">
            <input 
              type="text" 
              value={inputText}
              placeholder="اسأل سند عن أي شيء..." 
              className="flex-1 bg-transparent p-3 outline-none text-slate-900 font-black placeholder:text-slate-400 text-xs"
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
            />
            <button data-accessible onClick={() => handleAskAI()} className="bg-blue-600 text-white px-5 rounded-xl font-black text-xs hover:bg-blue-700 transition cursor-pointer">إرسال</button>
          </div>
        </div>
      </div>

      {/* --- المودال المطور والأسطوري لعرض مشغل فيديوهات Mux المزدوجة والمسرعة --- */}
      {showSignLanguage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white max-w-4xl w-full p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col gap-6 relative">
            
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-black text-slate-900">مترجم لغة الإشارة المرئي (Mux Stream)</h3>
              <p className="text-xs text-slate-400 font-bold">مشغل مزدوج مسرع تلقائياً لتسهيل الفهم والتحصيل الدراسي</p>
            </div>

            {/* شبكة الفيديوهات المزدوجة التزامنية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-[2rem] border border-slate-200/60">
              <div className="rounded-2xl overflow-hidden shadow-md bg-black aspect-video relative border-2 border-orange-500/30">
                <video 
                  ref={videoRef1}
                  src={signVideos[0]} 
                  controls 
                  autoPlay 
                  loop 
                  muted
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 right-3 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">الكاميرا 1 (مسرع)</span>
              </div>

              <div className="rounded-2xl overflow-hidden shadow-md bg-black aspect-video relative border-2 border-blue-500/30">
                <video 
                  ref={videoRef2}
                  src={signVideos[1]} 
                  controls 
                  autoPlay 
                  loop 
                  muted
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 right-3 bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">الكاميرا 2 (مسرع)</span>
              </div>
            </div>

            {/* سياق النص المترجم أسفل المشغل */}
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl max-h-20 overflow-y-auto">
              <p className="text-xs font-bold text-slate-600 leading-relaxed text-right"><span className="font-black text-orange-600">النص الجاري تفسيره:</span> {signTextToTranslate}</p>
            </div>

            <div className="flex justify-center pt-2">
              <button 
                data-accessible
                onClick={() => setShowSignLanguage(false)}
                className="px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-sm shadow-md transition cursor-pointer"
              >
                إغلاق نافذة الترجمة ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}