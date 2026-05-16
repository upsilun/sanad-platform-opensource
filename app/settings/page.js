"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../../src/firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { DISABILITY_TYPES } from "../../src/utils/constants";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

export default function Settings() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleUpdate = async (typeId) => {
    try {
      const user = auth.currentUser;
      await updateDoc(doc(db, "users", user.uid), { disabilityType: typeId });
      setUserData(prev => ({ ...prev, disabilityType: typeId }));
      alert("تم تحديث تفضيلات الإتاحة بنجاح ✅");
    } catch (error) {
      alert("حدث خطأ أثناء التحديث");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-slate-900 font-bold">جاري تحميل الإعدادات...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12" style={{ direction: "rtl" }}>
      <div className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header الخاص بالإعدادات */}
        <div className="p-8 md:p-12 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2 italic">إعدادات ملفك الشخصي</h2>
            <p className="text-slate-500 font-medium">تحكم في بياناتك وطريقة تفاعل سند معك</p>
          </div>
          <button 
            onClick={() => router.push("/dashboard")} 
            className="bg-slate-50 text-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-slate-100 transition border border-slate-200"
          >
            العودة للرئيسية ←
          </button>
        </div>
        
        <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12 text-right">
          
          {/* قسم المعلومات الشخصية (4 أعمدة) */}
          <section className="lg:col-span-5 space-y-8">
            <h3 className="text-xl font-black text-slate-800 border-r-4 border-blue-600 pr-4">المعلومات الأساسية</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-500 block mb-2 mr-1">الاسم المسجل</label>
                <div className="p-5 bg-slate-50 rounded-2xl text-slate-900 font-black border border-slate-100 shadow-inner">
                  {userData?.name}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-500 block mb-2 mr-1">البريد الإلكتروني</label>
                <div className="p-5 bg-slate-50 rounded-2xl text-slate-900 font-black border border-slate-100 shadow-inner">
                  {userData?.email}
                </div>
              </div>

              <div className="pt-4 p-6 bg-yellow-50 rounded-3xl border border-yellow-100">
                <p className="text-yellow-800 text-sm font-medium leading-relaxed">
                  💡 معلومات الحساب مرتبطة بنظام الجامعة، لتغيير الاسم الرسمي يرجى مراجعة الدعم الفني.
                </p>
              </div>
            </div>
          </section>

          {/* قسم تخصيص الإعاقة (7 أعمدة) */}
          <section className="lg:col-span-7 space-y-8">
            <h3 className="text-xl font-black text-slate-800 border-r-4 border-green-500 pr-4">تخصيص تجربة "سند"</h3>
            <p className="text-slate-600 font-medium leading-relaxed">
              اختر نوع الإعاقة ليقوم "سند" بتكييف طريقة شرح السلايدات، وصف الصور، وتبسيط المحتوى بما يتناسب مع احتياجك:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DISABILITY_TYPES.map(type => (
                <button 
                  key={type.id}
                  onClick={() => handleUpdate(type.id)}
                  className={`flex flex-col items-center justify-center gap-4 p-8 rounded-[2rem] border-2 transition-all group ${
                    userData?.disabilityType === type.id 
                    ? 'border-blue-600 bg-blue-50 shadow-md scale-[1.02]' 
                    : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-5xl group-hover:scale-110 transition-transform">{type.icon}</span>
                  <div className="text-center">
                    <p className={`font-black text-lg ${userData?.disabilityType === type.id ? 'text-blue-900' : 'text-slate-800'}`}>
                      {type.label}
                    </p>
                    {userData?.disabilityType === type.id && (
                      <span className="text-xs font-bold text-blue-600 mt-1 block tracking-widest uppercase">الخيار النشط الآن</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}