import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Tag,
  DollarSign,
  Utensils,
  Dumbbell,
  Check,
  Star,
  Users,
  AlertCircle,
  Database,
  Lock,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { userProfile, allMeals, exerciseLibrary, shoppingList, setIsAdminMode } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState<'tiers' | 'prices' | 'exercises' | 'feedback'>('tiers');

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>لوحة الإدارة ونموذج الاشتراكات</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              إدارة المنصة وباقات الاشتراك
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              إدارة أسعار المكونات المحلية، وتخصيص الباقات المجانية والمدفوعة، وحماية خصوصية بيانات المستخدمين.
            </p>
          </div>

          <button
            onClick={() => setIsAdminMode(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors self-start sm:self-auto"
          >
            إغلاق لوحة الإدارة
          </button>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 mt-2 border-t border-slate-100 no-scrollbar">
          {[
            { id: 'tiers', label: 'باقات الاشتراك' },
            { id: 'prices', label: 'مؤشر أسعار السوق' },
            { id: 'exercises', label: 'إدارة التمارين' },
            { id: 'feedback', label: 'بلاغات ورضا المستخدمين' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeAdminTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Subscription Tiers Showcase */}
      {activeAdminTab === 'tiers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Tier */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-500 font-semibold mb-1">للمبتدئين والمجربين</div>
              <h3 className="text-xl font-extrabold text-slate-900">الباقة المجانية</h3>
              <div className="text-2xl font-black text-slate-900 mt-2">
                0 {userProfile.currency} <span className="text-xs font-normal text-slate-500">/ مدى الحياة</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                تتيح تجربة تخطيط الوجبات الأساسية وتتبع التمارين لجزء من مكتبة الأجهزة.
              </p>

              <ul className="mt-5 space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تخطيط 3 وجبات يومية أساسية</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>برنامج تمارين 3 أيام أسبوعياً</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>الوصول لأجهزة الصالة الأساسية</span>
                </li>
              </ul>
            </div>

            <button className="w-full mt-6 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50">
              باقتك الحالية
            </button>
          </div>

          {/* Plus Tier (Flagship) */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-4 left-4 bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
              الأكثر شعبية
            </div>

            <div>
              <div className="text-xs text-emerald-400 font-semibold mb-1">التجربة الكاملة</div>
              <h3 className="text-xl font-extrabold text-white">على قدّك بلس ⭐</h3>
              <div className="text-2xl font-black text-white mt-2">
                29 {userProfile.currency} <span className="text-xs font-normal text-slate-400">/ شهرياً (حسب السوق)</span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                تخصيص متواصل، ميزة التبديل الذكي حسب ميزانية السوق، والمدرب الصوتي الحي التفاعلي.
              </p>

              <ul className="mt-5 space-y-2.5 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>تبديل وجبات غير محدود بأرخص وأسرع</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>مساعد كابتن على قدّك بالمحادثة الفورية</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>المدرب الصوتي التفاعلي أثناء جلسات التمرين</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>تحديث دوري لأسعار السلع بالأسواق المحلية</span>
                </li>
              </ul>
            </div>

            <button className="w-full mt-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm">
              ترقية الآن (تجربة 7 أيام مجاناً)
            </button>
          </div>

          {/* Pro Coaching Tier */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-500 font-semibold mb-1">متابعة بشرية مباشرة</div>
              <h3 className="text-xl font-extrabold text-slate-900">متابعة كابتن مختص</h3>
              <div className="text-2xl font-black text-slate-900 mt-2">
                149 {userProfile.currency} <span className="text-xs font-normal text-slate-500">/ شهرياً</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                متابعة أسبوعية من أخصائي تغذية ومدرب معتمد مع فحص تكنيك الحركات بالفيديو.
              </p>

              <ul className="mt-5 space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>كل مميزات باقة على قدّك بلس</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>مكالمة استشارية نصف شهرية</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>مراجعة تصوير أدائك للأجهزة المعقدة</span>
                </li>
              </ul>
            </div>

            <button className="w-full mt-6 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50">
              قريباً في منطقتك
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Market Price Index Admin */}
      {activeAdminTab === 'prices' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              مؤشر أسعار المكونات الأساسية ({userProfile.country})
            </h3>
            <span className="text-xs text-slate-500">تحديث آلي أسبوعي</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3">السلعة</th>
                  <th className="p-3">القسم</th>
                  <th className="p-3">متوسط سعر التجزئة</th>
                  <th className="p-3">سعر الجملة المقترح</th>
                  <th className="p-3">حالة الوفرة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shoppingList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="p-3 font-semibold text-slate-800">{item.name}</td>
                    <td className="p-3 text-slate-500">{item.aisle}</td>
                    <td className="p-3 font-bold tabular-nums text-slate-900">{item.estimatedPrice} {userProfile.currency}</td>
                    <td className="p-3 text-emerald-700 font-bold tabular-nums">{(item.estimatedPrice * 0.8).toFixed(1)} {userProfile.currency}</td>
                    <td className="p-3 text-emerald-700 font-medium">متوفر بالسوق</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Exercise Library CMS */}
      {activeAdminTab === 'exercises' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              قاعدة بيانات التمارين ومراجعة التكنيك
            </h3>
            <span className="text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-semibold">
              {exerciseLibrary.length} تمارين معتمدة طبياً
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exerciseLibrary.map((ex) => (
              <div key={ex.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{ex.arabicName}</div>
                  <div className="text-slate-500 mt-0.5">{ex.commonGymName} · {ex.targetMuscleGroup}</div>
                </div>
                <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded">
                  محدث ومراجع
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Feedback Logs */}
      {activeAdminTab === 'feedback' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              مراجعات المستخدمين وبلاغات الصعوبة
            </h3>
            <span className="text-xs text-slate-500">حماية الخصوصية مفعلة</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">مستخدم مجهول (رياضي مبتدئ)</span>
              <span className="text-slate-400">اليوم 11:20</span>
            </div>
            <p className="text-slate-700">
              "وجد تمرين دفع الأرجل مريحاً جداً لركبته بفضل ضبط الزاوية وعدم قفل المفصل، وطالب بالمزيد من وصفات التونة السريعة."
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
