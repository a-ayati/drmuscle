import React from 'react';
import { Coffee, Soup, Salad, Apple, UtensilsCrossed } from 'lucide-react';
import type { Meal } from '../types';

/** صورة الوجبة إن وُجدت صورة مطابقة لها، وإلا أيقونة حسب نوع الوجبة بدل صورة طبق آخر. */
export const MealThumb: React.FC<{ meal: Meal; className?: string }> = ({ meal, className = '' }) => {
  if (meal.image) {
    return <img src={meal.image} alt={meal.arabicName} className={`w-full h-full object-cover ${className}`} loading="lazy" />;
  }
  const Icon =
    meal.category === 'فطور' ? Coffee : meal.category === 'سناك' ? Apple : meal.arabicName.includes('شوربة') ? Soup : meal.arabicName.includes('سلطة') ? Salad : UtensilsCrossed;
  return (
    <div className={`w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-700 ${className}`}>
      <Icon className="w-12 h-12" />
    </div>
  );
};
