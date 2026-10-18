import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  Circle,
  Home,
  Tag,
  DollarSign,
  AlertCircle,
  TrendingDown,
  Info,
  Edit2,
  Check,
  Search,
} from 'lucide-react';

export const ShoppingView: React.FC = () => {
  const {
    userProfile,
    shoppingList,
    toggleShoppingItem,
    updateActualPrice,
    togglePantryItem,
    totalEstimatedGroceries,
    totalActualGroceries,
    remainingBudget,
    money,
  } = useApp();

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [filterAisle, setFilterAisle] = useState<string>('all');

  const aisles = [
    'all',
    'ألبان وبيض',
    'لحوم ودواجن وأسماك',
    'خضار وفواكه',
    'بقوليات وحبوب',
    'مخبوزات',
  ].filter((a) => a === 'all' || shoppingList.some((i) => i.aisle === a));

  const filteredList = shoppingList.filter((item) => {
    if (filterAisle !== 'all' && item.aisle !== filterAisle) return false;
    return true;
  });

  const purchasedCount = shoppingList.filter((i) => i.isPurchased && !i.inPantry).length;
  const totalItemsToBuy = shoppingList.filter((i) => !i.inPantry).length;

  const handleStartEdit = (id: string, currentPrice: number) => {
    setEditingItemId(id);
    setTempPrice(currentPrice.toString());
  };

  const handleSavePrice = (id: string) => {
    const val = parseFloat(tempPrice);
    if (!isNaN(val) && val >= 0) {
      updateActualPrice(id, val);
    }
    setEditingItemId(null);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* 1. Budget Summary Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              قائمة المشتريات والميزانية الأسبوعية
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              مبنية من وجبات أسبوعك كما هي الآن. علّم ما عندك في المطبخ ليُخصم من الحساب، واكتب السعر الذي دفعته إن اختلف.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl text-xs">
            <div>
              <span className="text-slate-500 block">إجمالي المقدر</span>
              <span className="text-base font-bold text-slate-800 tabular-nums">
                {money(totalEstimatedGroceries)}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <span className="text-slate-500 block">المصروف الفعلي</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {money(totalActualGroceries)}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <span className="text-slate-500 block">المتبقي من الميزانية</span>
              <span className="text-base font-bold text-emerald-700 tabular-nums">
                {money(remainingBudget)}
              </span>
            </div>
          </div>
        </div>

        {/* Grocery Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>اشتريت {purchasedCount} من {totalItemsToBuy} أصناف</span>
          <span className="font-semibold text-emerald-700 tabular-nums">
            {totalItemsToBuy > 0 ? Math.round((purchasedCount / totalItemsToBuy) * 100) : 100}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
          <div
            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${totalItemsToBuy > 0 ? (purchasedCount / totalItemsToBuy) * 100 : 100}%`,
            }}
          />
        </div>
      </div>

      {/* 2. Aisle Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {aisles.map((aisle) => (
          <button
            key={aisle}
            onClick={() => setFilterAisle(aisle)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterAisle === aisle
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {aisle === 'all' ? 'جميع الأقسام' : aisle}
          </button>
        ))}
      </div>

      {/* 3. Categorized Items List */}
      <div className="space-y-3">
        {filteredList.map((item) => {
          const isEditing = editingItemId === item.id;
          const currentPrice = item.actualPrice !== undefined ? item.actualPrice : item.estimatedPrice;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                item.inPantry
                  ? 'border-slate-200/60 bg-slate-50/70 opacity-75'
                  : item.isPurchased
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-slate-200/90'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                {/* Purchase Toggle */}
                {!item.inPantry ? (
                  <button
                    onClick={() => toggleShoppingItem(item.id)}
                    className="mt-0.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"
                    aria-label="تبديل حالة الشراء"
                  >
                    {item.isPurchased ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-50" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300" />
                    )}
                  </button>
                ) : (
                  <div className="mt-0.5 p-1 rounded-md bg-slate-200/60 text-slate-500" title="متوفر بالمطبخ">
                    <Home className="w-4 h-4" />
                  </div>
                )}

                {/* Item Details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-sm sm:text-base ${item.isPurchased ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {item.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-normal">
                      ({item.aisle})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span>تحتاج: <strong className="text-slate-800">{item.recipeQty}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>تشتري: <strong className="text-slate-800">{item.packToBuy}</strong></span>
                  </div>

                  {item.cheaperTip && (
                    <div className="text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-lg mt-1 inline-flex items-center gap-1 font-medium">
                      <TrendingDown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>نصيحة توفير: {item.cheaperTip}</span>
                    </div>
                  )}
                  {item.sourceNote && <div className="text-[11px] text-slate-400">{item.sourceNote}</div>}
                </div>
              </div>

              {/* Price & Actions */}
              <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 text-xs">
                {/* In Pantry Toggle */}
                <button
                  onClick={() => togglePantryItem(item.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                    item.inPantry
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.inPantry ? 'عندي في المطبخ (مخصوم)' : 'عندي في المطبخ'}
                </button>

                {/* Price Display and Edit */}
                {!item.inPantry && (
                  <div className="flex items-center gap-1.5">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="any"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(e.target.value)}
                          className="w-20 h-8 px-2 border border-emerald-500 rounded-lg text-xs font-bold text-center bg-white text-slate-900"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSavePrice(item.id)}
                          className="h-8 px-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(item.id, currentPrice)}
                        className="group flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        title="انقر لتعديل السعر الفعلي الذي دفعته"
                      >
                        <div className="text-right">
                          <div className="font-bold text-slate-900 text-sm tabular-nums">
                            {money(currentPrice)}
                          </div>
                          {item.actualPrice !== undefined && item.actualPrice !== item.estimatedPrice && (
                            <div className="text-[10px] text-slate-400 line-through tabular-nums">
                              المقدّر: {money(item.estimatedPrice)}
                            </div>
                          )}
                        </div>
                        <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-slate-700" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Price Transparency & Source Disclaimer */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>من أين الأسعار؟</span>
        </div>
        <p className="leading-relaxed">
          كل سعر منقول من موقع متجر في {userProfile.country} (لولو أو كارفور) لعبوة محددة، والتاريخ مكتوب تحت كل صنف. المؤن التي تكفي أكثر من أسبوع (الأرز والعدس والشوفان والدجاج المجمد) نحسب منها حصة هذا الأسبوع فقط. الأسعار تتغير بالعروض، فاكتب السعر الذي دفعته ليصبح حسابك دقيقاً.
        </p>
      </div>
    </div>
  );
};
