"use client";
import { useState } from "react";
import { auth } from "../../src/firebase/firebaseConfig"; // تأكد من مطابقة المسار لملفاتك
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return alert("الرجاء تعبئة الحقول");
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
      alert("فشل تسجيل الدخول، تأكد من البريد الإلكتروني وكلمة المرور");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f1f5f9] via-[#f8fafc] to-[#e2e8f0] p-6" style={{ direction: "rtl" }}>
      <div className="max-w-md w-full bg-white/80 border border-white/50 backdrop-blur-md p-10 rounded-[2.5rem] shadow-xl text-center">
        <img src="/logo.png" alt="Logo" className="w-20 h-20 mx-auto mb-6 object-contain" />
        <h2 className="text-3xl font-black text-slate-900 mb-2">تسجيل الدخول</h2>
        <p className="text-slate-500 font-bold mb-8">عد إلى غرفتك التعليمية المساعدة الذكية</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="البريد الإلكتروني" 
              value={email}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 font-bold outline-none focus:ring-2 ring-blue-500 transition"
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div>
            <input 
              type="password" 
              placeholder="كلمة المرور" 
              value={password}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 font-bold outline-none focus:ring-2 ring-blue-500 transition"
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100 active:scale-95 disabled:bg-slate-300 cursor-pointer"
          >
            {loading ? "جاري الدخول..." : "تسجيل الدخول 🛡️"}
          </button>
        </form>

        <p className="mt-6 text-slate-500 font-bold">
          ليس لديك حساب؟{" "}
          <span onClick={() => router.push("/register")} className="text-blue-600 cursor-pointer font-black hover:underline">
            إنشاء حساب جديد
          </span>
        </p>
      </div>
    </div>
  );
}