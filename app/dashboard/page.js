"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../src/firebase/firebaseConfig"; 
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, setDoc, onSnapshot } from "firebase/firestore";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("الطالب"); 
  const [courses, setCourses] = useState([]); 
  
  // States المودال
  const [showModal, setShowModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [isSavingCourse, setIsSavingCourse] = useState(false);

  // States الإحصائيات
  const [metrics, setMetrics] = useState({ hours: 0, progress: 0, rank: "" });
  const [chartData, setChartData] = useState([]);

  const softColors = [
    "from-blue-500/20 to-cyan-500/20",
    "from-purple-500/20 to-indigo-500/20",
    "from-orange-500/20 to-amber-500/20",
    "from-emerald-500/20 to-teal-500/20",
    "from-pink-500/20 to-rose-500/20"
  ];

  // ربط بيانات الفايربيس
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        getDoc(doc(db, "users", user.uid)).then((userDoc) => {
          if (userDoc.exists() && userDoc.data().name) {
            setUserName(userDoc.data().name.split(" ")[0]);
          }
        });

        const coursesRef = collection(db, "users", user.uid, "courses");
        const unsubCourses = onSnapshot(coursesRef, (snapshot) => {
          const loadedCourses = snapshot.docs.map((doc, index) => ({
            id: doc.id,
            ...doc.data(),
            color: doc.data().color || softColors[index % softColors.length]
          }));
          setCourses(loadedCourses);
        });

        return () => unsubCourses();
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // توليد البيانات العشوائية للشارات والرسومات
  useEffect(() => {
    setMetrics({
      hours: Math.floor(Math.random() * (45 - 15 + 1)) + 15,
      progress: Math.floor(Math.random() * (94 - 72 + 1)) + 72,
      rank: ["متميز 🏅", "متقدم 🔥", "صدارة الجيل 🛡️"][Math.floor(Math.random() * 3)]
    });

    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];
    setChartData(days.map(day => ({
      name: day,
      "ساعات الدراسة": (Math.random() * (4.5 - 1.2) + 1.2).toFixed(1),
      "الاستيعاب الذكي": Math.floor(Math.random() * (98 - 60 + 1)) + 60,
    })));
  }, []);

  const handleAddCourseSubmit = async (e) => {
    e.preventDefault();
    if (!newCourseName.trim() || !newCourseCode.trim()) return alert("الرجاء تعبئة البيانات");
    setIsSavingCourse(true);
    try {
      const courseSlug = newCourseCode.toLowerCase().replace(/\s+/g, "-");
      await setDoc(doc(db, "users", userId, "courses", courseSlug), {
        name: newCourseName.trim(),
        code: newCourseCode.trim().toUpperCase(),
        color: softColors[Math.floor(Math.random() * softColors.length)],
        createdAt: new Date()
      });
      setNewCourseName(""); setNewCourseCode(""); setShowModal(false);
    } catch (error) {
      alert("حدث خطأ أثناء حفظ المقرر");
    }
    setIsSavingCourse(false);
  };

  // --- محرك الإعاقة الحركية الخارق (كلك يمين للتنقل، كلك يسار مطول 3 ثوانٍ للضغط في أي مكان) ---
  const [focusableElements, setFocusableElements] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0); // مؤشر بصري للعداد
  const holdTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-accessible]");
    setFocusableElements(Array.from(elements));
  }, [courses, showModal]);

  useEffect(() => {
    if (focusableElements[activeIndex]) {
      focusableElements.forEach(el => el.classList.remove("ring-4", "ring-orange-500", "scale-105", "bg-orange-50/50"));
      focusableElements[activeIndex].classList.add("ring-4", "ring-orange-500", "scale-105", "bg-orange-50/50");
      focusableElements[activeIndex].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeIndex, focusableElements]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (focusableElements.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % focusableElements.length);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // كلك يسار فقط
    setHoldProgress(0);

    // عداد بصري لتحديث الـ progress bar
    let currentProgress = 0;
    progressIntervalRef.current = setInterval(() => {
      currentProgress += 3.33; // تحديث كل 100 ملي ثانية ليصل لـ 100% في 3 ثوانٍ
      setHoldProgress(Math.min(currentProgress, 100));
    }, 100);

    // تفعيل الكليك بعد 3 ثوانٍ كاملة حتى لو الماوس خارج العنصر
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
      className="min-h-screen bg-gradient-to-br from-[#f1f5f9] via-[#f8fafc] to-[#e2e8f0] p-8 relative select-none" 
      style={{ direction: "rtl" }}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseDownCapture={(e) => e.button === 0 && handleMouseDown(e)} // التقاط الضغط في أي مكان بالشاشة
      onMouseUp={handleMouseUp}
    >
      {/* العداد البصري العائم أعلى الشاشة يوضح ضغط ذوي الإعاقة الحركية */}
      {holdProgress > 0 && (
        <div className="fixed top-0 left-0 right-0 h-2 bg-slate-200 z-50">
          <div className="h-full bg-orange-500 transition-all duration-100" style={{ width: `${holdProgress}%` }}></div>
        </div>
      )}

      {/* الهيدر */}
      <div className="max-w-7xl mx-auto backdrop-blur-md bg-white/70 border border-white/50 rounded-[2.5rem] p-6 mb-8 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop" alt="Avatar" className="w-14 h-14 rounded-full border-4 border-blue-500/30 object-cover shadow-sm" />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <h1 className="text-2xl font-black text-slate-900">مرحباً بك، {userName} 👋</h1>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3 max-w-sm">
          <p className="text-[10px] font-black text-orange-800 leading-relaxed text-center">
            ♿ نظام حركي مطلق: كلك يمين للتنقل · اضغط وعلق كلك يسار (3 ثوانٍ) في أي مكان بالشاشة لتفعيل الزر المحدد بالبرتقالي فوراً.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* كروت الأداء */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-white p-6 rounded-[2rem] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">ساعات التعلم المنجزة</p>
                <h3 className="text-3xl font-black text-slate-900">{metrics.hours} <span className="text-xs font-bold">ساعة</span></h3>
              </div>
              <span className="text-3xl bg-white p-3 rounded-2xl shadow-sm">⏳</span>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-white p-6 rounded-[2rem] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">معدل الاستيعاب العام</p>
                <h3 className="text-3xl font-black text-slate-900">{metrics.progress}%</h3>
              </div>
              <span className="text-3xl bg-white p-3 rounded-2xl shadow-sm">📈</span>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white p-6 rounded-[2rem] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">تصنيف الأداء الحالي</p>
                <h3 className="text-lg font-black text-slate-900 mt-2">{metrics.rank}</h3>
              </div>
              <span className="text-3xl bg-white p-3 rounded-2xl shadow-sm">🛡️</span>
            </div>
          </div>

          {/* الرسومات */}
          <div className="bg-white/80 border border-white/50 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm">
            <h3 className="font-black text-slate-900 text-lg mb-6">📊 تحليل الاستيعاب الأسبوعي المتغير</h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" h="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Area type="monotone" dataKey="الاستيعاب الذكي" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* المقررات */}
          <div>
            <h3 className="font-black text-slate-900 text-xl mb-4">📚 المقررات الدراسية النشطة</h3>
            {courses.length === 0 ? (
              <div className="text-center p-12 bg-white/40 border border-dashed rounded-[2rem] text-slate-400 font-bold">
                لا توجد مقررات مضافة حالياً. علق 3 ثوانٍ على الزر باليسار لإضافة أول مقرر!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div 
                    key={course.id}
                    data-accessible
                    onClick={() => router.push(`/dashboard/${course.id}`)}
                    className={`bg-gradient-to-br ${course.color} border border-white p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-white/60 px-3 py-1 rounded-full text-slate-700">{course.code}</span>
                        <h4 className="text-lg font-black text-slate-800 mt-2 group-hover:text-blue-600 transition">{course.name}</h4>
                      </div>
                      <img src={`https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=40&sig=${course.id}`} alt="Illust" className="w-12 h-12 rounded-xl object-cover mix-blend-multiply opacity-70" />
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-white/40">
                      <span className="text-xs font-black text-blue-700">دخول الغرفة التعليمية ←</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* القسم الأيسر */}
        <div className="space-y-8">
          <div className="bg-white/80 border border-white/50 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm">
            <h3 className="font-black text-slate-900 text-sm mb-4">⏱️ معدل ساعات المذاكرة يومياً</h3>
            <div className="w-full h-44">
              <ResponsiveContainer width="100%" h="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                  <Tooltip />
                  <Bar dataKey="ساعات الدراسة" fill="#8b5cf6" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="relative rounded-[2.5rem] overflow-hidden h-48 border border-white shadow-sm">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&auto=format&fit=crop" alt="Motivation" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-6 flex flex-col justify-end">
              <h5 className="text-white font-black text-sm">شعار "سند" الدائم 🛡️</h5>
            </div>
          </div>

          <button 
            data-accessible
            onClick={() => setShowModal(true)}
            className="w-full p-5 bg-slate-900 hover:bg-slate-800 text-white rounded-[2rem] font-black transition-all flex items-center justify-center shadow-lg cursor-pointer"
          >
            ➕ إضافة مقرر دراسي جديد
          </button>
        </div>
      </div>

      {/* مودال الإضافة - نصوص الانبوت هنا سوداء صريحة ومؤمنة */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col gap-6">
            <div className="text-center">
              <h3 className="text-2xl font-black text-slate-900">إضافة مقرر جديد لـ سند</h3>
            </div>
            <form onSubmit={handleAddCourseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-2">اسم المقرر الدراسي</label>
                <input 
                  type="text" 
                  data-accessible
                  placeholder="مثال: أنظمة مدمجة..."
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 font-bold outline-none focus:ring-2 ring-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 mb-2">رمز المقرر</label>
                <input 
                  type="text" 
                  data-accessible
                  placeholder="مثال: CEN-452"
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 font-bold outline-none focus:ring-2 ring-blue-500 transition"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" data-accessible disabled={isSavingCourse} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-black transition">حفظ المقرر 🛡️</button>
                <button type="button" data-accessible onClick={() => setShowModal(false)} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 p-4 rounded-xl font-black transition">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}