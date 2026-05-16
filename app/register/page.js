"use client";
import { useState } from "react";
import { auth, db } from "../../src/firebase/firebaseConfig"; // تأكد من مطابقة المسار لملفاتك
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      return alert("الرجاء تعبئة جميع الحقول");
    }
    
    setLoading(false);
    setLoading(true);
    try {
      // 1. إنشاء الحساب في الفايربيس Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. إنشاء مستند للمستخدم في Firestore لربط الاسم وتفضيلات الإعاقة لاحقاً
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        disabilityType: "عامة", // القيمة الافتراضية عند التسجيل
        createdAt: new Date()
      });

      alert("تم إنشاء الحساب بنجاح! 🎉");
      router.push("/dashboard"); // التوجه تلقائياً للداشبورد
    } catch (error) {
      console.error("Register Error:", error);
      if (error.code === "auth/email-already-in-check" || error.code === "auth/email-already-in-use") {
        alert("هذا البريد الإلكتروني مسجل بالفعل!");
      } else {
        alert("حدث خطأ أثناء التسجيل، تأكد من البيانات وحاول مجدداً");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6" style={{ direction: "rtl" }}>
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 text-center">
        <img src="/logo.png" alt="Logo" className="w-20 h-20 mx-auto mb-6 object-contain" />
        <h2 className="text-3xl font-black text-slate-900 mb-2">إنشاء حساب جديد</h2>
        <p className="text-slate-500 font-bold mb-8">انضم إلى منصة سند وابدأ رحلتك التعليمية الذكية</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="الاسم الكامل" 
              value={name}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 font-bold outline-none focus:ring-2 ring-blue-500 transition"
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          <div>
            <input 
              type="email" 
              placeholder="البريد الإلكتروني الجامعي أو الشخصي" 
              value={email}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 font-bold outline-none focus:ring-2 ring-blue-500 transition"
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div>
            <input 
              type="password" 
              placeholder="كلمة المرور (6 خانات على الأقل)" 
              value={password}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 font-bold outline-none focus:ring-2 ring-blue-500 transition"
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100 active:scale-95 disabled:bg-slate-300"
          >
            {loading ? "جاري إنشاء الحساب..." : "تسجيل حساب جديد 🛡️"}
          </button>
        </form>

        <p className="mt-6 text-slate-500 font-bold">
          لديك حساب بالفعل؟{" "}
          <span onClick={() => router.push("/login")} className="text-blue-600 cursor-pointer font-black hover:underline">
            تسجيل الدخول
          </span>
        </p>
      </div>
    </div>
  );
}