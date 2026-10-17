import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Star,
  CheckCircle2,
  DollarSign,
  Dumbbell,
  Utensils,
  Smile,
  Meh,
  Frown,
  Calendar,
  Sparkles,
  MessageSquare
} from 'lucide-react';

export const ProgressView: React.FC = () => {
  const {
    userProfile,
    totalActualGroceries,
    weeklyReviews,
    submitWeeklyReview,
    workoutSessions,
  } = useApp();

  const [workoutRating, setWorkoutRating] = useState<number>(4);
  const [nutritionRating, setNutritionRating] = useState<number>(5);
  const [difficultyFeedback, setDifficultyFeedback] = useState<string>('مناسبة جداً');
  const [tasteFeedback, setTasteFeedback] = useState<string>('مشبعة ولذيذة');
  const [userComment, setUserComment] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    submitWeeklyReview({
      workoutRating,
      nutritionRating,
      difficultyFeedback,
      tasteFeedback,
      notes: userComment,
    });
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
    setUserComment('');
  };

  const budgetAdherencePercent = Math.min(
    100,
    Math.round(((userProfile.foodBudgetWeekly - totalActualGroceries) / userProfile.foodBudgetWeekly) * 100)
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          التقدم والالتزام والمراجعة الأسبوعية
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-xl">
          متابعة مستمرة بدون لوم أو مقارنات غير واقعية. الهدف هو الاستمرارية خطوة بخطوة.
        </p>

        {/* Core KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-slate-500 block">التزام التمارين</span>
            <span className="text-xl font-black text-slate-900 tabular-nums">75%</span>
            <span className="text-[11px] text-emerald-700 block mt-0.5">3 من 4 حصص مكتملة</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-slate-500 block">التزام الميزانية</span>
            <span className="text-xl font-black text-emerald-700 tabular-nums">{budgetAdherencePercent}%</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">وفرت {userProfile.foodBudgetWeekly - totalActualGroceries} {userProfile.currency}</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-slate-500 block">الوزن الأولي vs الآن</span>
            <span className="text-xl font-black text-slate-900 tabular-nums">{userProfile.weightKg} كجم</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">المستهدف: {userProfile.targetWeightKg || 75} كجم</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-slate-500 block">تطور الأوزان المرفوعة</span>
            <span className="text-xl font-black text-emerald-700 tabular-nums">+4.5 كجم</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">في تمارين الظهر والصدر</span>
          </div>
        </div>
      </div>

      {/* 2. Weekly Satisfaction Survey Form */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              استبيان الرضا والتقييم الأسبوعي
            </h2>
            <p className="text-xs text-slate-500">
              رأيك يعدّل الخطة آلياً! نفصل تقييم التغذية عن التمارين لنحدد ما يحتاج تحسين.
            </p>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-lg">
            أسبوع 1
          </span>
        </div>

        {isSubmitted && (
          <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>شكراً لك! تم تسجيل تقييمك وسنأخذه في الاعتبار لضبط جدول الأسبوع القادم.</span>
          </div>
        )}

        <form onSubmit={handleSubmitReview} className="space-y-5 text-xs sm:text-sm">
          {/* Workout Satisfaction */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-600" />
                <span>تقييم تجربة التمارين والصعوبة (من 1 إلى 5):</span>
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setWorkoutRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= workoutRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-500">كيف كانت شدة الحصص؟</span>
              {['خفيفة جداً', 'مناسبة جداً', 'مرهقة وصعبة'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficultyFeedback(lvl)}
                  className={`px-3 py-1 rounded-lg border transition-colors ${
                    difficultyFeedback === lvl
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Nutrition Satisfaction */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-600" />
                <span>تقييم طعم الوجبات والشبع وسهولة التحضير (من 1 إلى 5):</span>
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNutritionRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= nutritionRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-500">إحساسك بالشبع وسرعة الطبخ:</span>
              {['مشبعة ولذيذة', 'أحتاج وجبات أسرع', 'أشعر بالجوع سريعاً'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTasteFeedback(t)}
                  className={`px-3 py-1 rounded-lg border transition-colors ${
                    tasteFeedback === t
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Notes textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ملاحظات إضافية أو مقترحات للتعديل:
            </label>
            <textarea
              rows={3}
              placeholder="مثال: أحببت وصفة التونة والمكرونة، لكن أريد تقليل وقت تحضير الفطور..."
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors"
          >
            إرسال المراجعة الأسبوعية
          </button>
        </form>
      </div>

      {/* 3. Review History */}
      {weeklyReviews.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-base">
            سجل مراجعاتك السابقة
          </h3>
          <div className="space-y-2">
            {weeklyReviews.map((r, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 ml-2">تاريخ {r.date}</span>
                  <span className="text-slate-500">تمارين: {r.workoutRating}⭐ · غذاء: {r.nutritionRating}⭐</span>
                  {r.notes && <p className="text-slate-600 mt-1 italic">"{r.notes}"</p>}
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
