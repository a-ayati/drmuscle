import React from 'react';
import { useApp } from '../context/AppContext';
import { MealThumb } from './MealThumb';
import { Dumbbell, Clock, ChevronLeft, Sparkles, RefreshCw, Coffee, CheckCircle2, AlertTriangle } from 'lucide-react';
import { LocationPicker } from './LocationPicker';
import { dayTotals, MEAL_SLOTS, SLOT_LABELS, MealSlot } from '../data/food';
import { WEEKDAYS, LOCATION_LABELS } from '../data/workouts';
import type { Meal } from '../types';

export const TodayView: React.FC = () => {
  const {
    userProfile,
    workoutSessions,
    startLiveWorkout,
    setActiveTab,
    setIsChatDrawerOpen,
    sendChatMessage,
    totalActualGroceries,
    remainingBudget,
    overBudget,
    exerciseLibrary,
    swapToCheaper,
    setIsOnboardingOpen,
    todayIndex,
    todayDayPlan,
    todayWorkout,
    nextWorkout,
    money,
    setSelectedDayId,
  } = useApp();

  const totals = dayTotals(todayDayPlan);
  const completed = workoutSessions.filter((s) => s.isCompleted).length;
  const budget = userProfile.foodBudgetWeekly || 0;
  const budgetPct = budget > 0 ? Math.min(100, (totalActualGroceries / budget) * 100) : 0;

  const goalText: Record<string, string> = {
    fat_loss: 'خسارة الدهون',
    muscle_gain: 'بناء العضلات',
    fitness: 'تحسين اللياقة',
    maintenance: 'المحافظة على الوزن',
  };

  const quickPrompts = [
    'أريد غداءً أرخص اليوم',
    'ما بديل هذا التمرين إذا كان الجهاز مشغولاً؟',
    'ركبتي تؤلمني قليلاً، كيف أعدّل التمارين؟',
    'ما أرخص مصادر البروتين؟',
  ];

  const renderMeal = (slot: MealSlot, meal: Meal) => (
    <div key={slot} className="rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col bg-white">
      <div className="relative h-32 bg-slate-100">
        <MealThumb meal={meal} />
        <span className="absolute top-2 right-2 bg-slate-950/80 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
          {SLOT_LABELS[slot]} · {meal.prepTimeMin} د
        </span>
      </div>
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <h4 className="font-bold text-slate-900 text-sm leading-snug">{meal.arabicName}</h4>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="tabular-nums">{meal.calories} سعرة</span>
          <span className="text-emerald-700 font-semibold tabular-nums">{meal.protein} جم بروتين</span>
          <span className="text-slate-800 font-semibold tabular-nums">{money(meal.estimatedPortionCost)}</span>
        </div>
        <div className="mt-auto pt-2 flex gap-2 text-xs">
          {meal.cheaperAlternativeId ? (
            <button
              onClick={() => todayDayPlan && swapToCheaper(todayDayPlan.dayId, slot)}
              className="flex-1 h-9 rounded-lg border border-slate-200 text-slate-700 hover:border-emerald-600 font-semibold flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> أرخص
            </button>
          ) : (
            <span className="flex-1 h-9 rounded-lg bg-emerald-50 text-emerald-800 font-semibold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> الأرخص
            </span>
          )}
          <button
            onClick={() => {
              if (todayDayPlan) setSelectedDayId(todayDayPlan.dayId);
              setActiveTab('nutrition');
            }}
            className="flex-1 h-9 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
          >
            الوصفة والبدائل
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-24 lg:pb-12">
      {/* 1. التحية */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 font-medium mb-1">
              {WEEKDAYS[todayIndex]} · {userProfile.country}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">مرحباً يا {userProfile.name}</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-xl">
              هدفك: <span className="font-semibold text-emerald-800">{goalText[userProfile.goal] ?? 'اللياقة'}</span>. ميزانية الأكل:{' '}
              {money(budget)} أسبوعياً.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {!userProfile.isCompleted && (
              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="h-10 px-4 text-xs font-bold bg-amber-500 text-white rounded-xl hover:bg-amber-600"
              >
                أكمل ملفك
              </button>
            )}
            <button
              onClick={() => setIsChatDrawerOpen(true)}
              className="h-10 px-4 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl hover:bg-emerald-100 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>اسأل الكابتن</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block mb-1">حصص هذا الأسبوع</span>
            <span className="text-base font-bold text-slate-900 tabular-nums">
              {completed} من {workoutSessions.length}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">أكل اليوم</span>
            <span className="text-base font-bold text-slate-900 tabular-nums">
              {totals.calories} سعرة · {totals.protein} جم
            </span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">مشتريات الأسبوع</span>
            <span className="text-base font-bold text-slate-900 tabular-nums">{money(totalActualGroceries)}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">{overBudget > 0 ? 'تجاوزت الميزانية بـ' : 'المتبقي من الميزانية'}</span>
            <span className={`text-base font-bold tabular-nums ${overBudget > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
              {money(overBudget > 0 ? overBudget : remainingBudget)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. تمرين اليوم */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="text-emerald-400 font-semibold">تمرين اليوم · {LOCATION_LABELS[userProfile.location]}</span>
              {todayWorkout && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> نحو {todayWorkout.estimatedMinutes} دقيقة
                  </span>
                </>
              )}
            </div>

            {todayWorkout ? (
              <>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  {todayWorkout.title}
                  {todayWorkout.isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                </h2>
                <p className="text-sm text-slate-300 max-w-lg">{todayWorkout.focus}</p>
              </>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Coffee className="w-6 h-6 text-emerald-400" /> اليوم راحة
                </h2>
                <p className="text-sm text-slate-300 max-w-lg">
                  الراحة جزء من التمرين، فالعضلات تتقوّى وقت الراحة. مشي خفيف 20 دقيقة مفيد إن رغبت.
                  {nextWorkout && ` حصتك القادمة: ${nextWorkout.title} يوم ${WEEKDAYS[nextWorkout.weekdayIndex ?? 0]}.`}
                </p>
              </>
            )}

            <div className="pt-1">
              <LocationPicker tone="onDark" />
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5">
            <button
              onClick={() => startLiveWorkout((todayWorkout ?? nextWorkout)?.id)}
              className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2"
            >
              <Dumbbell className="w-5 h-5 text-white" />
              <span>{todayWorkout ? 'ابدأ حصة اليوم' : 'تمرّن رغم ذلك'}</span>
            </button>
            <button
              onClick={() => setActiveTab('workout')}
              className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <span>جدول الأسبوع</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {todayWorkout && (
          <div className="mt-6 pt-5 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {todayWorkout.exercises.slice(0, 4).map((exPlan, idx) => {
              const exInfo = exerciseLibrary.find((e) => e.id === exPlan.exerciseId);
              const timed = exPlan.sets[0]?.targetDurationSec;
              return (
                <div key={idx} className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
                  <div className="text-[11px] text-slate-400">التمرين {idx + 1}</div>
                  <div className="font-semibold text-slate-100 mt-1 leading-snug">{exInfo?.arabicName || 'تمرين'}</div>
                  <div className="text-[11px] text-emerald-400 mt-1.5 tabular-nums">
                    {exPlan.sets.length} ×{' '}
                    {timed ? (timed >= 60 ? `${Math.round(timed / 60)} د` : `${timed} ث`) : `${exPlan.sets[0]?.targetReps ?? 10} تكرار`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. أكل اليوم */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">أكل اليوم</h2>
            <div className="text-xs text-slate-500 mt-1 tabular-nums">
              {totals.calories} سعرة · {totals.protein} جم بروتين · التكلفة نحو {money(totals.cost)}
            </div>
          </div>
          <button
            onClick={() => setActiveTab('nutrition')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start"
          >
            <span>جدول الأسبوع كاملاً</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {todayDayPlan && MEAL_SLOTS.map((slot) => (todayDayPlan.meals[slot] ? renderMeal(slot, todayDayPlan.meals[slot]!) : null))}
        </div>
      </div>

      {/* اختصارات للهاتف: صفحات غير موجودة في الشريط السفلي */}
      <div className="lg:hidden grid grid-cols-2 gap-3">
        <button
          onClick={() => setActiveTab('library')}
          className="h-14 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-800 flex items-center justify-center gap-2"
        >
          <Dumbbell className="w-5 h-5 text-emerald-700" /> دليل التمارين
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className="h-14 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-800 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-700" /> تقدّمي
        </button>
      </div>

      {/* 4. الميزانية والكابتن */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium">ميزانية الأكل هذا الأسبوع</span>
              {overBudget > 0 ? (
                <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> فوق الميزانية
                </span>
              ) : (
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">ضمن الميزانية</span>
              )}
            </div>
            <div className="flex flex-wrap items-baseline gap-2 mb-2">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">{money(totalActualGroceries)}</span>
              <span className="text-xs text-slate-500">من {money(budget)}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden my-3">
              <div
                className={`${overBudget > 0 ? 'bg-amber-500' : 'bg-emerald-600'} h-2.5 rounded-full transition-all duration-500`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500">محسوبة من أسعار المتاجر في {userProfile.country}</span>
            <button
              onClick={() => setActiveTab('shopping')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 shrink-0"
            >
              <span>قائمة المشتريات</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">اسأل كابتن على قدّك</h3>
          </div>
          <div className="space-y-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setIsChatDrawerOpen(true);
                  sendChatMessage(prompt);
                }}
                className="w-full text-right p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200/60 text-xs text-slate-700 flex items-center justify-between gap-2"
              >
                <span className="truncate">{prompt}</span>
                <ChevronLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
