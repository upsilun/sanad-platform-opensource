# 🛡️ منصة سَنَد الذكية | Sanad AI Platform

> **"التعليم متاح للجميع، والقدرات تصنعها الإرادة الذكية"**
> منصة تعليمية تفاعلية ميسرة ومخصصة لدمج وتمكين ذوي الاحتياجات الخاصة (الصم والبكم، المكفوفين، وذوي الإعاقة الحركية) في التعليم الجامعي باستخدام تقنيات الذكاء الاصطناعي التوليدي.

🔗 **رابط المنصة الحي والشغال:** [https://sanad-platform-ten.vercel.app/](https://sanad-platform-ten.vercel.app/)

---

## 💡 فكرة المنصة والأبعاد الإنسانية

منصة **سَنَد** هي بيئة تعليمية إنسانية ذكية تهدف إلى توفير "العدالة التعليمية" وتطويع التكنولوجيا لتتكيف تلقائياً مع القدرات الجسدية والحسية لكل طالب. تقوم المنصة بتحويل الكتب والمواد الجامعية التقليدية (PDF) إلى تجارب تفاعلية ميسرة تخدم ثلاثة أبعاد رئيسية:

*   **🤟 لغة الإشارة الفورية (للصم والبكم):** يقوم النظام بتحليل شروحات الذكاء الاصطناعي وعرضها تزامناً عبر مشغل مرئي مزدوج (Dual Video Stream) لفيديوهات إشارة حقيقية ومسرعة بمعدل $1.5\times$ لتسهيل الفهم الفوري.
*   **🔊 الهندسة السمعية البشرية (للمكفوفين وضعاف البصر):** تحويل المادة الدراسية والمحادثات الذكية إلى رفيق سمعي يقرأ الشروحات بصوت بَشري طبيعي ونقي يحاكي المعلم الخاص تماماً.
*   **♿ الإبحار اللاحركي المطلق (لذوي الإعاقة الحركية):** ابتكار محرك حركة مرن يتيح للطالب التحكم في المنصة بالكامل بدون تحريك الفأرة أو توجيه المؤشر بدقة؛ تنقّل كامل بكلك يمين، وضغط تلقائي بمجرد التعليق كلك يسار لمدة **3 ثوانٍ** في أي مساحة فارغة على الشاشة.

---

## ✨ مميزات المنصة التقنية

*   **Dashboard ذكي ورائع:** لوحة تحكم عصرية بلمسات زجاجية خفيفة (`backdrop-blur-md`) تحتوي على رسومات بيانية ومقاييس أداء تفاعلية تظهر تلقائياً وتتغير مع كل تحديث.
*   **تحليل المستندات الحي:** مستعرض ملفات مدمج 100% في نفس الصفحة مربوط بنموذج الذكاء الاصطناعي (Gemini API) لقراءة وتلخيص السلايدات واستخراج أهم المفاهيم واقتراح أسئلة دراسية تفاعلية ديناميكية.
*   **حفظ وتخزين مستقر:** ربط سحابي حي مع **Firebase Auth & Firestore** لحفظ حسابات الطلاب ومقرراتهم الدراسية وتفضيلات إعاقتهم، مدمج مع قاعدة بيانات المتصفح **IndexedDB** لضمان ثبات ملفات الـ PDF المرفوعة خلفياً.
*   **نصوص متباينة وآمنة:** جميع واجهات الإدخال والصناديق مؤمنة بنصوص سوداء ملكية عميقة (`text-slate-900`) واضحة ومريحة للعين.

---

## 🛠️ البنية البرمجية والتقنيات المستخدمة (Tech Stack)

*   **Framework:** Next.js (App Router)
*   **Styling:** Tailwind CSS (Glassmorphism Effects)
*   **Database & Auth:** Firebase (Authentication, Firestore Cloud Database)
*   **Local Storage:** IndexedDB (Client-side browser storage)
*   **Core AI Engine:** Gemini API (askSanadAI Service)
*   **Audio Engine:** Web Speech API & ElevenLabs API fallbacks
*   **Video Hosting & Streaming:** Mux Video Stream Architecture
*   **Charts & Metrics:** Recharts (Responsive Area & Bar Charts)

---

## 🚀 شروط وتشغيل المشروع محلياً (Installation & Running)

تأكد من تثبيت بيئة [Node.js](https://nodejs.org/) على جهازك قبل البدء.

### 1. استنساخ المستودع (Clone the Repository)
```bash
git clone [https://github.com/your-username/sanad-platform.git](https://github.com/your-username/sanad-platform.git)
cd sanad-platform

```

### 2. تثبيت الحزم والاعتماديات (Install Dependencies)

```bash
npm install
# أو إذا كنت تستخدم yarn
yarn install

```

### 3. تثبيت مكتبة الرسوم البيانية (Charts)

```bash
npm install recharts

```

### 4. إعداد متغيرات البيئة (Environment Variables)

قم بإنشاء ملف باسم `.env.local` في المجلد الرئيسي للمشروع وأضف مفاتيحك الخاصة بالاتصال:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

```

### 5. تشغيل السيرفر المحلي للتطوير (Run Development Server)

```bash
npm run dev
# أو
yarn dev

```

افتح المتصفح على الرابط المحلي: [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) لتجد المنصة تعمل بكامل طاقتها واستقرارها.

---

## 📂 هيكلة مجلدات المشروع (Project Folder Structure)

```text
├── app/
│   ├── page.js                 # الصفحة الرئيسية (الواجهة الغنية الرائعة ومحرك الإعاقة)
│   ├── login/                  # صفحة تسجيل الدخول بنصوص مؤمنة سوداء
│   ├── register/               # صفحة إنشاء حساب جديد وربطه بـ Firestore
│   └── dashboard/              # لوحة التحكم الرئيسية والشارتس الديناميكية
│       ├── settings/           # صفحة إعدادات الحساب وتخصيص تفضيلات الإعاقة حياً
│       └── [courseId]/         # غرفة التعلم المدمجة والذكاء الاصطناعي ومشغل Mux المزدوج
├── src/
│   ├── firebase/
│   │   └── firebaseConfig.js   # ملف الاتصال والربط مع قاعدة بيانات الفايربيس
│   └── services/
│       └── gemini.js           # محرك وخدمات الاتصال الحقيقي بـ Gemini AI
├── public/                     # الصور، الشعارات، والأيقونات التوضيحية للمنصة
└── package.json                # ملف الحزم والاعتماديات الخاصة بالمشروع

```

---

## 🤝 شكر وتقدير

تم تطوير هذه المنصة بكل فخر واعتزاز لخدمة وتسهيل التحصيل الأكاديمي والتعليمي لكافة الطلاب من ذوي الاحتياجات الخاصة في عالمنا العربي.

```

```
