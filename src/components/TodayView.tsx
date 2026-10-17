import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Dumbbell,
  Clock,
  Flame,
  ChevronLeft,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  Zap,
  MapPin,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const TodayView: React.FC = () => {
  const {
    userProfile,
    nutritionDays,
    workoutSessions,
    startLiveWorkout,
    setActiveTab,
    setIsChatDrawerOpen,
    sendChatMessage,
    totalActualGroceries,
    remainingBudget,
    isExpressWorkout,
    toggleExpressWorkout,
    workoutLocation,
    toggleWorkoutLocation,
    exerciseLibrary,
    swapToCheaper,
    setIsOnboardingOpen,
  } = useApp();

  const todayNutrition = nutritionDays[0]; // Sunday/First day
  const todayWorkout = workoutSessions[0];

  const quickPrompts = [
    'كيف أقلل تكلفة وجباتي الأسبوعية أكثر؟',
    'بديل تمرين لعضلات الصدر بدون أجهزة',
    'ركبتي تؤلمني قليلاً، كيف أعدل التمارين؟',
    'ما هي أفضل مصادر البروتين الرخيصة؟',
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* 1. Header Greeting & Motivation Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 font-medium mb-1">
              {todayNutrition?.dayName} · الخطة اليومية المخصصة
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              مرحباً يا {userProfile.name} 👋
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              هدفك الحالي: <span className="font-semibold text-emerald-800">
                {userProfile.goal === 'fat_loss' ? 'خسارة الدهون وتحسين اللياقة' : 'بناء العضلات والقوة'}
              </span>. خطتك متوافقة مع ميزانيتك ({userProfile.foodBudgetWeekly} {userProfile.currency}/أسبوع).
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {!userProfile.isCompleted && (
              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
              >
                استكمال إعداد الخطة
              </button>
            )}
            <button
              onClick={() => setIsChatDrawerOpen(true)}
              className="px-4 py-2 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>مساعد على قدّك</span>
            </button>
          </div>
        </div>

        {/* Weekly Stat Quick Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block mb-0.5">الحصص المكتملة</span>
            <span className="text-base font-bold text-slate-900 tabular-nums">2 من {userProfile.workoutDaysPerWeek} حصص</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">البروتين المستهدف</span>
            <span className="text-base font-bold text-slate-900 tabular-nums">115 جم / يوم</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">المصروف الفعلي</span>
            <span className="text-base font-bold text-slate-900 tabular-nums">{totalActualGroceries.toFixed(0)} {userProfile.currency}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">المتبقي من الميزانية</span>
            <span className="text-base font-bold text-emerald-700 tabular-nums">{remainingBudget.toFixed(0)} {userProfile.currency}</span>
          </div>
        </div>
      </div>

      {/* 2. Today's Workout Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="text-emerald-400 font-semibold">تمرين اليوم الأساسي</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {isExpressWorkout ? '25 دقيقة (مختصر)' : `${todayWorkout?.estimatedMinutes || 45} دقيقة`}
              </span>
              <span aria-hidden="true">·</span>
              <span>{workoutLocation === 'gym' ? 'في الصالة الرياضية' : 'تمارين منزلية'}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {todayWorkout?.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
              {todayWorkout?.focus}. تم ضبط التمارين لتناسب ركبتك وخبرتك مع أوزان آمنة وتدرج واقعي.
            </p>

            {/* Workout Controls: Express mode & Location toggle */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <button
                onClick={toggleExpressWorkout}
                className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 font-medium ${
                  isExpressWorkout
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isExpressWorkout ? 'وضع مختصر مفعّل (25 دقيقة)' : 'وقتي أقل اليوم'}</span>
              </button>

              <button
                onClick={toggleWorkoutLocation}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 font-medium"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>مكان التمرين: {workoutLocation === 'gym' ? 'الصالة (بدّل للمنزل)' : 'المنزل (بدّل للصالة)'}</span>
              </button>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5">
            <button
              onClick={() => startLiveWorkout(todayWorkout?.id)}
              className="h-12 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md whitespace-nowrap"
            >
              <Dumbbell className="w-5 h-5" />
              <span>ابدأ حصتي الآن</span>
            </button>
            <button
              onClick={() => setActiveTab('workout')}
              className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <span>تفاصيل الحركات والإحماء</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Exercises preview row */}
        <div className="mt-6 pt-5 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {todayWorkout?.exercises.slice(0, 4).map((exPlan, idx) => {
            const exInfo = exerciseLibrary.find((e) => e.id === exPlan.exerciseId);
            return (
              <div key={idx} className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/40">
                <div className="text-[11px] text-slate-400">التمرين {idx + 1}</div>
                <div className="font-semibold text-slate-100 truncate mt-0.5">
                  {exInfo?.arabicName || 'تمرين قوة'}
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 tabular-nums">
                  {exPlan.sets.length} مجموعات · راحة {exPlan.restSeconds}ث
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Today's Meals Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              وجبات اليوم الغذائية
            </h2>
            <div className="text-xs text-slate-500">
              سعرات اليوم: ~1420 سعرة · 94 جم بروتين · التكلفة اليومية التقديرية: ~16.8 {userProfile.currency}
            </div>
          </div>
          <button
            onClick={() => setActiveTab('nutrition')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>جدول الأسبوع كاملاً</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Breakfast */}
          {todayNutrition?.meals.breakfast && (
            <div className="border border-slate-200/90 rounded-xl overflow-hidden hover:border-slate-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="relative h-40 w-full bg-slate-100">
                  <img
                    src={todayNutrition.meals.breakfast.image}
                    alt={todayNutrition.meals.breakfast.arabicName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
                    فطور · {todayNutrition.meals.breakfast.prepTimeMin} دقيقة
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {todayNutrition.meals.breakfast.arabicName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <span className="tabular-nums">{todayNutrition.meals.breakfast.calories} سعرة</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-medium tabular-nums">{todayNutrition.meals.breakfast.protein}g بروتين</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-700 font-semibold tabular-nums">{todayNutrition.meals.breakfast.estimatedPortionCost.toFixed(1)} {userProfile.currency}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 pt-0 flex items-center gap-2 border-t border-slate-100 text-xs">
                <button
                  onClick={() => swapToCheaper(todayNutrition.dayId, 'breakfast')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-center transition-colors flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 text-slate-500" />
                  <span>أرخص</span>
                </button>
                <button
                  onClick={() => setActiveTab('nutrition')}
                  className="flex-1 py-1.5 px-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 font-medium text-center transition-colors"
                >
                  بدائل أخرى
                </button>
              </div>
            </div>
          )}

          {/* Lunch */}
          {todayNutrition?.meals.lunch && (
            <div className="border border-slate-200/90 rounded-xl overflow-hidden hover:border-slate-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="relative h-40 w-full bg-slate-100">
                  <img
                    src={todayNutrition.meals.lunch.image}
                    alt={todayNutrition.meals.lunch.arabicName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
                    غداء · {todayNutrition.meals.lunch.prepTimeMin} دقيقة
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {todayNutrition.meals.lunch.arabicName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <span className="tabular-nums">{todayNutrition.meals.lunch.calories} سعرة</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-medium tabular-nums">{todayNutrition.meals.lunch.protein}g بروتين</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-700 font-semibold tabular-nums">{todayNutrition.meals.lunch.estimatedPortionCost.toFixed(1)} {userProfile.currency}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 pt-0 flex items-center gap-2 border-t border-slate-100 text-xs">
                <button
                  onClick={() => swapToCheaper(todayNutrition.dayId, 'lunch')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-center transition-colors flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 text-slate-500" />
                  <span>أرخص</span>
                </button>
                <button
                  onClick={() => setActiveTab('nutrition')}
                  className="flex-1 py-1.5 px-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 font-medium text-center transition-colors"
                >
                  بدائل أخرى
                </button>
              </div>
            </div>
          )}

          {/* Dinner */}
          {todayNutrition?.meals.dinner && (
            <div className="border border-slate-200/90 rounded-xl overflow-hidden hover:border-slate-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="relative h-40 w-full bg-slate-100">
                  <img
                    src={todayNutrition.meals.dinner.image}
                    alt={todayNutrition.meals.dinner.arabicName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
                    عشاء · {todayNutrition.meals.dinner.prepTimeMin} دقائق
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {todayNutrition.meals.dinner.arabicName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <span className="tabular-nums">{todayNutrition.meals.dinner.calories} سعرة</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-medium tabular-nums">{todayNutrition.meals.dinner.protein}g بروتين</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-700 font-semibold tabular-nums">{todayNutrition.meals.dinner.estimatedPortionCost.toFixed(1)} {userProfile.currency}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 pt-0 flex items-center gap-2 border-t border-slate-100 text-xs">
                <button
                  onClick={() => swapToCheaper(todayNutrition.dayId, 'dinner')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-center transition-colors flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 text-slate-500" />
                  <span>أرخص</span>
                </button>
                <button
                  onClick={() => setActiveTab('nutrition')}
                  className="flex-1 py-1.5 px-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 font-medium text-center transition-colors"
                >
                  بدائل أخرى
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Budget & Grocery Summary Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Budget Health Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">متابعة ميزانية الطعام</span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                ضمن الميزانية المحددة
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {totalActualGroceries.toFixed(0)} {userProfile.currency}
              </span>
              <span className="text-xs text-slate-500">
                من إجمالي الميزانية: {userProfile.foodBudgetWeekly} {userProfile.currency}
              </span>
            </div>

            {/* Visual Budget Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden my-3">
              <div
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (totalActualGroceries / userProfile.foodBudgetWeekly) * 100)}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>المتبقي في المحفظة:</span>
              <span className="font-bold text-emerald-700 tabular-nums">{remainingBudget.toFixed(0)} {userProfile.currency}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">تم حساب التكلفة بناءً على المكونات المشتركة</span>
            <button
              onClick={() => setActiveTab('shopping')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>قائمة التسوق</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* AI Quick Prompts Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">اسأل كابتن على قدّك</h3>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              مدربك الذكي متاح للإجابة عن أسئلة التغذية وضبط أوزان التمارين والبدائل الاقتصادية.
            </p>

            <div className="space-y-1.5">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsChatDrawerOpen(true);
                    sendChatMessage(prompt);
                  }}
                  className="w-full text-right p-2 rounded-lg bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/60 text-xs text-slate-700 hover:text-emerald-900 transition-colors flex items-center justify-between group"
                >
                  <span className="truncate">{prompt}</span>
                  <ChevronLeft className="w-3 h-3 text-slate-400 group-hover:text-emerald-700 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2 text-center">
            <button
              onClick={() => setIsChatDrawerOpen(true)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              فتح المحادثة الكاملة مع المدرب
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
