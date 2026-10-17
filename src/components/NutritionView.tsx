import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  Flame,
  RotateCcw,
  Sparkles,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  CheckCircle2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Meal } from '../types';

export const NutritionView: React.FC = () => {
  const {
    userProfile,
    nutritionDays,
    selectedDayId,
    setSelectedDayId,
    swapMeal,
    swapToCheaper,
    swapToFaster,
    usePantryAlternative,
    allMeals,
  } = useApp();

  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);
  const [swapModalMeal, setSwapModalMeal] = useState<{ dayId: string; category: 'breakfast' | 'lunch' | 'dinner' } | null>(null);

  const currentDayPlan = nutritionDays.find((d) => d.dayId === selectedDayId) || nutritionDays[0];

  const totalCalories =
    (currentDayPlan.meals.breakfast?.calories || 0) +
    (currentDayPlan.meals.lunch?.calories || 0) +
    (currentDayPlan.meals.dinner?.calories || 0);

  const totalProtein =
    (currentDayPlan.meals.breakfast?.protein || 0) +
    (currentDayPlan.meals.lunch?.protein || 0) +
    (currentDayPlan.meals.dinner?.protein || 0);

  const totalDailyCost =
    (currentDayPlan.meals.breakfast?.estimatedPortionCost || 0) +
    (currentDayPlan.meals.lunch?.estimatedPortionCost || 0) +
    (currentDayPlan.meals.dinner?.estimatedPortionCost || 0);

  const toggleExpand = (id: string) => {
    setExpandedMealId(expandedMealId === id ? null : id);
  };

  const renderMealCard = (meal: Meal, category: 'breakfast' | 'lunch' | 'dinner', categoryName: string) => {
    const isExpanded = expandedMealId === meal.id;

    return (
      <div key={meal.id} className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs transition-all">
        <div className="flex flex-col sm:flex-row">
          {/* Meal Photo */}
          <div className="sm:w-64 h-48 sm:h-auto relative bg-slate-100 shrink-0">
            <img
              src={meal.image}
              alt={meal.arabicName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-md">
              {categoryName}
            </div>
          </div>

          {/* Meal Details */}
          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {meal.arabicName}
                </h3>
                <div className="text-sm font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg tabular-nums">
                  {meal.estimatedPortionCost.toFixed(1)} {userProfile.currency} <span className="text-xs font-normal text-emerald-700">/ للحصة</span>
                </div>
              </div>

              {/* Macros Strip */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2.5">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {meal.prepTimeMin} دقائق
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="tabular-nums font-semibold text-slate-900">
                  {meal.calories} سعرة
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-emerald-700 font-bold tabular-nums">
                  {meal.protein} جم بروتين
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="tabular-nums">{meal.carbs} جم كارب</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="tabular-nums">{meal.fats} جم دهون</span>
              </div>

              {/* Cost transparency insight */}
              <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800">حسبة العبوة والتوفير: </span>
                  تكلفة الحصة المأكولة ({meal.estimatedPortionCost.toFixed(1)} {userProfile.currency}). تكلفة شراء العبوات كاملة لأول مرة حوالي ({meal.packEstimatedCost.toFixed(0)} {userProfile.currency}) وتكفي لعدة وجبات خلال الأسبوع دون إهدار.
                </div>
              </div>
            </div>

            {/* Smart Action Buttons */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => swapToCheaper(currentDayPlan.dayId, category)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium transition-colors flex items-center gap-1"
                  title="استبدال بوجبة أرخص في التكلفة"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>أرخص</span>
                </button>

                <button
                  onClick={() => swapToFaster(currentDayPlan.dayId, category)}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-medium transition-colors flex items-center gap-1"
                  title="استبدال بوجبة أسرع في التحضير"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>أسرع</span>
                </button>

                <button
                  onClick={() => usePantryAlternative(currentDayPlan.dayId, category)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                  title="استخدام ما هو متوفر في مطبخك"
                >
                  استخدم الموجود عندي
                </button>

                <button
                  onClick={() => setSwapModalMeal({ dayId: currentDayPlan.dayId, category })}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 font-medium transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>بدّل الوجبة</span>
                </button>
              </div>

              <button
                onClick={() => toggleExpand(meal.id)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 py-1"
              >
                <span>{isExpanded ? 'إخفاء المقادير والخطوات' : 'طريقة التحضير والمقادير'}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Recipe Ingredients & Steps */}
        {isExpanded && (
          <div className="p-5 sm:p-6 bg-slate-50/70 border-t border-slate-200 text-xs text-slate-700 space-y-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">المقادير الدقيقة للحصة الواحدة:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {meal.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="font-medium text-slate-800">{ing.name} ({ing.portionQty})</span>
                    <span className="text-slate-500 text-[11px]">{ing.packName}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">خطوات التحضير السريعة:</h4>
              <ol className="space-y-1.5 list-decimal list-inside text-slate-700 leading-relaxed">
                {meal.recipeSteps.map((step, sIdx) => (
                  <li key={sIdx} className="pr-1">{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              التخطيط الغذائي الذكي حسب الميزانية
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              وجبات عالية البروتين ومصممة من مكونات شعبية متوفرة في أسواق {userProfile.country}. عند تبديل أي وجبة، تتحدث تلقائياً قائمة المشتريات وميزانية الأسبوع.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900">
            <div className="font-bold">الميزانية المستهدفة: {userProfile.foodBudgetWeekly} {userProfile.currency}/أسبوع</div>
            <div className="text-[11px] text-emerald-700 mt-0.5">تكلفة متوازنة تكفي شخصاً واحداً دون هدر</div>
          </div>
        </div>

        {/* Days Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 mt-2 border-t border-slate-100 no-scrollbar">
          {nutritionDays.map((d) => {
            const isSelected = d.dayId === selectedDayId;
            return (
              <button
                key={d.dayId}
                onClick={() => setSelectedDayId(d.dayId)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {d.dayName}
              </button>
            );
          })}
        </div>

        {/* Selected Day Macro & Cost Snapshot */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div>
            <span className="text-slate-500">إجمالي السعرات: </span>
            <span className="font-bold text-slate-900 tabular-nums">{totalCalories} سعرة</span>
          </div>
          <span aria-hidden="true">·</span>
          <div>
            <span className="text-slate-500">البروتين: </span>
            <span className="font-bold text-emerald-700 tabular-nums">{totalProtein} جم</span>
          </div>
          <span aria-hidden="true">·</span>
          <div>
            <span className="text-slate-500">تكلفة حصص اليوم: </span>
            <span className="font-bold text-slate-900 tabular-nums">{totalDailyCost.toFixed(1)} {userProfile.currency}</span>
          </div>
        </div>
      </div>

      {/* 2. Budget Feasibility & Realistic Expectations Box */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs text-amber-900">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm text-amber-950 mb-1">الواقعية والشفافية في «على قدّك»</h4>
          <p className="leading-relaxed">
            لا نعد بخطة خارقة بميزانية شبه معدومة؛ إذا كانت الميزانية منخفضة، يعتمد النظام بذكاء على مصادر البروتين النباتية والحيوانية الموفرة (العدس، البيض، التونة، الحمص، الأجبان الخفيفة) ويقلل اللحوم الفارهة للحفاظ على توازن السعرات والبروتين دون إرهاق ميزانيتك.
          </p>
        </div>
      </div>

      {/* 3. Meals of the selected day */}
      <div className="space-y-4">
        {currentDayPlan.meals.breakfast && renderMealCard(currentDayPlan.meals.breakfast, 'breakfast', 'وجبة الإفطار')}
        {currentDayPlan.meals.lunch && renderMealCard(currentDayPlan.meals.lunch, 'lunch', 'وجبة الغداء')}
        {currentDayPlan.meals.dinner && renderMealCard(currentDayPlan.meals.dinner, 'dinner', 'وجبة العشاء')}
      </div>

      {/* 4. Swap Meal Modal */}
      {swapModalMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                اختر وجبة بديلة متوافقة
              </h3>
              <button
                onClick={() => setSwapModalMeal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              اختر أي وجبة معتمدة، وسيتم تحديث جدول الأسبوع وقائمة التسوق فوراً.
            </p>

            <div className="space-y-3">
              {allMeals.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => {
                    swapMeal(swapModalMeal.dayId, swapModalMeal.category, candidate.id);
                    setSwapModalMeal(null);
                  }}
                  className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition-all flex items-center gap-3"
                >
                  <img
                    src={candidate.image}
                    alt={candidate.arabicName}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {candidate.arabicName}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span className="tabular-nums">{candidate.calories} سعرة</span>
                      <span>·</span>
                      <span className="text-emerald-700 font-semibold tabular-nums">{candidate.protein}g بروتين</span>
                      <span>·</span>
                      <span className="tabular-nums">{candidate.estimatedPortionCost.toFixed(1)} {userProfile.currency}</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-600 hover:text-white transition-colors">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
