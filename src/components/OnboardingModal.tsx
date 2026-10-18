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
import { COUNTRIES, countryByName, suggestedWeeklyBudget, money } from '../data/food';
import { LOCATION_LABELS } from '../data/workouts';
import type { LocationPreference } from '../types';

export const OnboardingModal: React.FC = () => {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    userProfile,
    completeOnboarding,
  } = useApp();

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<UserProfile>({ ...userProfile });

  if (!isOnboardingOpen) return null;

  const handleSaveAndGenerate = () => {
    completeOnboarding(formData);
    setIsOnboardingOpen(false);
  };

  const formCountry = countryByName(formData.country);
  const suggested = suggestedWeeklyBudget(formCountry.code, formData.budgetPersons || 1);

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
            <button
              onClick={() => setIsOnboardingOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode A: Fast Structured Form in 3 Clear Steps */}
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
                            ? 'bg-emerald-600 text-white border-emerald-600'
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">الدولة</label>
                    <div className="grid grid-cols-2 gap-2">
                      {COUNTRIES.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              country: c.name,
                              currency: c.currency,
                              foodBudgetWeekly: suggestedWeeklyBudget(c.code, formData.budgetPersons || 1),
                            })
                          }
                          className={`h-10 rounded-xl border text-xs font-bold transition-colors ${
                            formCountry.code === c.code
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {c.name} ({c.currency})
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">الأسعار من متاجر الدولة التي تختارها.</p>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      ميزانية الأكل الأسبوعية ({formCountry.currency})
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={formCountry.code === 'OM' ? 0.5 : 5}
                      value={formData.foodBudgetWeekly}
                      onChange={(e) => setFormData({ ...formData, foodBudgetWeekly: Math.max(0, Number(e.target.value) || 0) })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none text-xs font-bold text-emerald-800"
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      خطة الأسبوع لشخص واحد تكلّف نحو {money(suggested / 1.15, formCountry.code)}، ونقترح {money(suggested, formCountry.code)}.
                    </p>
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
                      <option value={2}>يومان</option>
                      <option value={3}>3 أيام (مناسبة للمبتدئين)</option>
                      <option value={4}>4 أيام</option>
                      <option value={5}>5 أيام</option>
                      <option value={6}>6 أيام</option>
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
                  <label className="font-semibold text-slate-800 block mb-1">نوع التمرين</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['gym', 'home', 'run', 'walk'] as LocationPreference[]).map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setFormData({ ...formData, location: loc })}
                        className={`p-3 rounded-xl border text-xs font-semibold transition-colors ${
                          formData.location === loc
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {LOCATION_LABELS[loc]}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    {formData.location === 'gym' && 'أجهزة ودمبل، بحصص للجزء العلوي والسفلي والجسم كاملاً.'}
                    {formData.location === 'home' && 'بوزن الجسم فقط، دون أي أدوات.'}
                    {formData.location === 'run' && 'برنامج للمبتدئين يبدأ بجري ومشي متناوبين، ثم جري متواصل.'}
                    {formData.location === 'walk' && 'مشي سريع وفترات متناوبة، مناسب للبداية وللمفاصل الحساسة.'}
                  </p>
                </div>

                <div>
                  <label className="font-semibold text-slate-800 block mb-1">أي إصابات أو قيود حركية؟</label>
                  <input
                    type="text"
                    placeholder="مثال: خشونة في الركبة، ألم أسفل الظهر، كتف حساس..."
                    value={formData.injuries.join('، ')}
                    onChange={(e) => setFormData({ ...formData, injuries: e.target.value ? [e.target.value] : [] })}
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
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

      </div>
    </div>
  );
};
