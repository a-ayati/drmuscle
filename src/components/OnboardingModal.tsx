import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  HeartPulse,
  DollarSign,
  Utensils,
  Dumbbell
} from 'lucide-react';
import { UserProfile, GoalType, ExperienceLevel, ActivityLevel } from '../types';
import { COUNTRIES, currencyFor } from '../data/countries';

export const OnboardingModal: React.FC = () => {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    userProfile,
    updateUserProfile,
    allMeals,
  } = useApp();

  const [mode, setMode] = useState<'form' | 'chat'>('form');
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<UserProfile>({ ...userProfile });
  const [chatInputs, setChatInputs] = useState<string[]>([]);
  const [chatStepIndex, setChatStepIndex] = useState<number>(0);

  if (!isOnboardingOpen) return null;

  const handleSaveAndGenerate = () => {
    updateUserProfile({ ...formData, isCompleted: true });
    setIsOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full min-w-0 max-h-[92vh] overflow-y-auto overflow-x-hidden shadow-2xl p-5 sm:p-8 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="text-xs font-semibold text-emerald-700 mb-0.5">
              منصة على قدّك · تخصيص خطتك
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              ملفك الشخصي وميزانيتك
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode switch: Quick Form vs Interactive AI */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs">
              <button
                onClick={() => setMode('form')}
                className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                  mode === 'form' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                استمارة سريعة
              </button>
              <button
                onClick={() => setMode('chat')}
                className={`px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1 ${
                  mode === 'chat' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>محادثة تعارف</span>
              </button>
            </div>

            <button
              onClick={() => setIsOnboardingOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode A: Fast Structured Form in 3 Clear Steps */}
        {mode === 'form' ? (
          <div className="space-y-6">
            {/* Step Indicators */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => setStep(1)}
                className={`p-2 rounded-xl border text-center transition-colors ${
                  step === 1 ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-900' : 'border-slate-200 text-slate-500'
                }`}
              >
                1. الجسم والهدف
              </button>
              <button
                onClick={() => setStep(2)}
                className={`p-2 rounded-xl border text-center transition-colors ${
                  step === 2 ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-900' : 'border-slate-200 text-slate-500'
                }`}
              >
                2. الميزانية والطعام
              </button>
              <button
                onClick={() => setStep(3)}
                className={`p-2 rounded-xl border text-center transition-colors ${
                  step === 3 ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-900' : 'border-slate-200 text-slate-500'
                }`}
              >
                3. التمارين والمفاصل
              </button>
            </div>

            {/* Step 1: Body & Goal */}
            {step === 1 && (
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    صور الجسم ليست إلزامية إطلاقاً. نطلب الوزن والطول والعمر فقط لحساب معدل الأيض الأساسي واحتياجك الفعلي من السعرات والبروتين بدقة علمية.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">الاسم أو اللقب</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">العمر (سنة)</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">الطول (سم)</label>
                    <input
                      type="number"
                      value={formData.heightCm}
                      onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">الوزن الحالي (كجم)</label>
                    <input
                      type="number"
                      value={formData.weightKg}
                      onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-800 block mb-2">هدفك الأساسي</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'fat_loss', label: 'خسارة دهون' },
                      { id: 'muscle_gain', label: 'بناء عضلات' },
                      { id: 'fitness', label: 'تحسين اللياقة' },
                      { id: 'maintenance', label: 'المحافظة على الوزن' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, goal: g.id as GoalType })}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          formData.goal === g.id
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Budget & Food preferences */}
            {step === 2 && (
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    حدد ميزانيتك الواقعية وسنقوم بتوزيع الوجبات ومكونات السوق الذكية لكي لا تدفع أكثر مما خططت له.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">الدولة</label>
                    <select
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          country: e.target.value,
                          currency: currencyFor(e.target.value) ?? formData.currency,
                        })
                      }
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none text-xs"
                    >
                      {!COUNTRIES.some((c) => c.name === formData.country) && (
                        <option value={formData.country}>{formData.country}</option>
                      )}
                      {COUNTRIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">العملة</label>
                    <input
                      type="text"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">الميزانية الغذائية الأسبوعية</label>
                    <input
                      type="number"
                      value={formData.foodBudgetWeekly}
                      onChange={(e) => setFormData({ ...formData, foodBudgetWeekly: Number(e.target.value) })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none text-xs font-bold text-emerald-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">وقت الطبخ اليومي المتاح (دقائق)</label>
                    <input
                      type="number"
                      value={formData.cookingTimeMinutes}
                      onChange={(e) => setFormData({ ...formData, cookingTimeMinutes: Number(e.target.value) })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">أطعمة غير مرغوبة أو حساسية</label>
                    <input
                      type="text"
                      placeholder="مثال: الباذنجان، الفول السوداني، الحليب..."
                      value={formData.dislikedFoods.join('، ')}
                      onChange={(e) => setFormData({ ...formData, dislikedFoods: e.target.value.split('،') })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Workouts & Injuries */}
            {step === 3 && (
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <HeartPulse className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    أي إصابة تسجلها هنا تُعامل بأولوية قصوى لاستبدال التمارين الضاغطة على المفصل بحركات آمنة وبدائل مدعومة.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">أيام التمرين أسبوعياً</label>
                    <select
                      value={formData.workoutDaysPerWeek}
                      onChange={(e) => setFormData({ ...formData, workoutDaysPerWeek: Number(e.target.value) })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none text-xs"
                    >
                      <option value={3}>3 أيام (مثالي للمبتدئين والعائدين)</option>
                      <option value={4}>4 أيام (جزء علوي وسفلي)</option>
                      <option value={5}>5 أيام</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">مدة الحصة المستهدفة</label>
                    <select
                      value={formData.sessionDurationMin}
                      onChange={(e) => setFormData({ ...formData, sessionDurationMin: Number(e.target.value) })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none text-xs"
                    >
                      <option value={30}>30 دقيقة</option>
                      <option value={45}>45 دقيقة (موصى بها)</option>
                      <option value={60}>60 دقيقة</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-800 block mb-1">مكان التمرين المفضل</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, location: 'gym' })}
                      className={`p-3 rounded-xl border text-xs font-semibold ${
                        formData.location === 'gym' ? 'bg-slate-900 text-white' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      في الصالة الرياضية (الجيم)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, location: 'home' })}
                      className={`p-3 rounded-xl border text-xs font-semibold ${
                        formData.location === 'home' ? 'bg-slate-900 text-white' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      في المنزل (أوزان أو وزن الجسم)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-800 block mb-1">أي إصابات أو قيود حركية؟</label>
                  <input
                    type="text"
                    placeholder="مثال: خشونة في الركبة، ألم أسفل الظهر، كتف حساس..."
                    value={formData.injuries.join('، ')}
                    onChange={(e) => setFormData({ ...formData, injuries: [e.target.value] })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none text-xs"
                  />
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100"
                >
                  السابق
                </button>
              ) : <div />}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  التالي
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveAndGenerate}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm"
                >
                  تأكيد وحفظ الخطة
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Mode B: Conversational AI Onboarding */
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>محادثة التعارف مع كابتن على قدّك</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                مرحباً بك! سأطرح عليك أسئلة سريعة لفهم هدفك وميزانيتك:
                «ما هي ميزانيتك التقريبية للطعام أسبوعياً وهل تعاني من أي آلام في المفاصل؟»
              </p>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="مثال: ميزانيتي 180 ريال أسبوعياً، وعندي ألم بسيط بالركبة..."
                  className="flex-1 h-10 px-3 border border-slate-200 rounded-xl text-xs focus:border-emerald-600 focus:outline-none"
                />
                <button
                  onClick={handleSaveAndGenerate}
                  className="px-4 h-10 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700"
                >
                  إرسال واعتماد
                </button>
              </div>
            </div>
            <div className="text-center pt-2">
              <button
                onClick={() => setMode('form')}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                العودة للاستمارة المباشرة
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
