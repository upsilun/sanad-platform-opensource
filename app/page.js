"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // محرك الإعاقة الحركية المتكامل المطلق
  const [focusableElements, setFocusableElements] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0); 
  const holdTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-accessible]");
    setFocusableElements(Array.from(elements));
  }, []);

  useEffect(() => {
    if (focusableElements[activeIndex]) {
      focusableElements.forEach(el => el.classList.remove("ring-4", "ring-orange-500", "scale-105", "bg-orange-500/10"));
      focusableElements[activeIndex].classList.add("ring-4", "ring-orange-500", "scale-105", "bg-orange-500/10");
      focusableElements[activeIndex].scrollIntoView({ behavior: "smooth", block: "center" });
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

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#f1f5f9] via-[#f8fafc] to-[#e2e8f0] text-slate-900 font-sans select-none"
      style={{ direction: "rtl" }}
      onContextMenu={handleContextMenu}
      onMouseDownCapture={(e) => e.button === 0 && handleMouseDown(e)}
      onMouseUp={handleMouseUp}
    >
      {/* العداد العلوي */}
      {holdProgress > 0 && (
        <div className="fixed top-0 left-0 right-0 h-2 bg-slate-200 z-50">
          <div className="h-full bg-orange-500 transition-all duration-100" style={{ width: `${holdProgress}%` }}></div>
        </div>
      )}

      {/* الهيدر (Navbar) */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="سند الذكي" className="w-12 h-12 object-contain" />
          <span className="text-2xl font-black tracking-tight text-slate-900">منصة سَنَد 🛡️</span>
        </div>
        <div className="flex gap-4">
          <button data-accessible onClick={() => router.push("/login")} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-sm text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer transition">تسجيل الدخول</button>
          <button data-accessible onClick={() => router.push("/register")} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 cursor-pointer transition">ابدأ مجاناً</button>
        </div>
      </nav>

      {/* البطل (Hero Section) */}
      <main className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-right">
          <span className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-700 text-xs font-black">ذكاء اصطناعي إشاري وصوتي شامل للجميع 🧠</span>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.15] tracking-tight">
            المنصة الأولى المخصصة لـ <span className="text-blue-600">ذوي الاحتياجات الخاصة</span>
          </h1>
          <p className="text-lg text-slate-500 font-bold leading-relaxed max-w-xl">
            سند يدمج مناهجك الجامعية وسلايداتك بتقنيات الذكاء الاصطناعي التوليدي، ليوفر لغة إشارة فورية، قراءة صوتية طبيعية، ونظام حركة ذكي مخصص كلياً.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button data-accessible onClick={() => router.push("/register")} className="px-8 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 cursor-pointer transition">سجل حسابك وابدأ دراستك الحين 🚀</button>
          </div>
          
          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl max-w-md mt-6">
            <p className="text-xs font-black text-orange-800 leading-relaxed text-center">
              ♿ نظام حركة مطلق: كلك يمين للتنقل · علّق كلك يسار (3 ثوانٍ) في أي مكان بالشاشة للضغط تلقائياً.
            </p>
          </div>
        </div>

        {/* قسم الصور الجمالية العلوي */}
        <div className="grid grid-cols-2 gap-4 relative">
          <div className="space-y-4">
            <div className="h-60 rounded-[3rem] overflow-hidden border border-white shadow-md">
              <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop" alt="Smart Education" className="w-full h-full object-cover" />
            </div>
            <div className="h-40 rounded-[3rem] bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-white shadow-sm p-6 flex flex-col justify-end">
              <span className="text-3xl">🤟</span>
              <h4 className="font-black text-slate-900 mt-2 text-sm">مترجم الإشارة الفوري أونلاين</h4>
            </div>
          </div>
          <div className="space-y-4 pt-12">
            <div className="h-40 rounded-[3rem] bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white shadow-sm p-6 flex flex-col justify-end">
              <span className="text-3xl">🔊</span>
              <h4 className="font-black text-slate-900 mt-2 text-sm">قراءة إنسانية طبيعية ElevenLabs</h4>
            </div>
            <div className="h-60 rounded-[3rem] overflow-hidden border border-white shadow-md">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&auto=format&fit=crop" alt="Students" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </main>

      {/* --- الأقسام والمميزات الجديدة والـ Rich (New Features Section) --- */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/60 space-y-16">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900">بيئة تعلم ذكية متكاملة وميسرة لكل الطلاب</h2>
          <p className="text-slate-500 font-bold max-w-2xl mx-auto">نطوّع التقنية والذكاء الاصطناعي لخدمة التنوع الإنساني وتسهيل التحصيل الدراسي لأقصى درجة.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* قسم الصم والبكم */}
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-orange-500/10 text-orange-600 rounded-2xl flex items-center justify-center text-2xl font-bold">🤟</div>
              <h3 className="text-xl font-black text-slate-900">محرك لغة الإشارة الفوري</h3>
              <p className="text-sm text-slate-500 font-bold leading-relaxed">
                يقوم بتحليل ردود وشروحات الذكاء الاصطناعي فوراً، وتوليد إشارات الحروف العربية متسلسلة عبر الإنترنت دون الحاجة لتحميل قاموس محلي معقد.
              </p>
            </div>
            <div className="mt-6 rounded-2xl overflow-hidden h-36">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop" alt="Sign Language Section" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* قسم المكفوفين وضعاف البصر */}
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold">🔊</div>
              <h3 className="text-xl font-black text-slate-900">الهندسة السمعية البشرية</h3>
              <p className="text-sm text-slate-500 font-bold leading-relaxed">
                ربط مباشر مع خوارزميات صياغة الصوت الأكثر تقدماً في العالم لإنتاج قراءة صوتية طبيعية بلكنة بشرية مريحة تحاكي المدرس الخاص تماماً.
              </p>
            </div>
            <div className="mt-6 rounded-2xl overflow-hidden h-36">
              <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop" alt="Audio Section" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* قسم الإعاقة الحركية */}
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-purple-500/10 text-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold">♿</div>
              <h3 className="text-xl font-black text-slate-900">الإبحار اللاحركي الشامل</h3>
              <p className="text-sm text-slate-500 font-bold leading-relaxed">
                نظام مرن بالكامل للتحكم بالصفحات والتنقل دون تحريك الفأرة أو الحاجة للماوس فوق الزر؛ تنقّل بكلك يمين وفَعّل الكليك يسار المطول من أي زاوية بالشاشة.
              </p>
            </div>
            <div className="mt-6 rounded-2xl overflow-hidden h-36">
              <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300&auto=format&fit=crop" alt="Accessibility Section" className="w-full h-full object-cover" />
            </div>
          </div>

        </div>
      </section>

      {/* الفوتر */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200/60 flex justify-between items-center text-slate-400 font-bold text-xs">
        <p>© 2026 منصة سند AI</p>
        <p>تم التطوير بكل فخر من قبل فريق سند بهاكاثون اديوثون 3🛡️</p>
      </footer>
    </div>
  );
}