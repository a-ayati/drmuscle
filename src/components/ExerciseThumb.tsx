import React from 'react';
import { Dumbbell, Footprints, Wind, PersonStanding } from 'lucide-react';
import type { ExerciseItem } from '../types';

/** صورة التمرين إن وُجدت صورة مطابقة له، وإلا أيقونة واضحة بدل صورة جهاز آخر. */
export const ExerciseThumb: React.FC<{ ex: ExerciseItem; className?: string }> = ({ ex, className = '' }) => {
  if (ex.image) {
    return <img src={ex.image} alt={ex.arabicName} className={`w-full h-full object-cover ${className}`} loading="lazy" />;
  }
  const Icon =
    ex.id === 'ex_jog' ? Wind : ex.targetMuscleGroup === 'قلب ورئتان' ? Footprints : ex.equipmentType === 'وزن الجسم' ? PersonStanding : Dumbbell;
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center gap-2 bg-emerald-50 text-emerald-700 ${className}`}>
      <Icon className="w-10 h-10" />
      <span className="text-[11px] font-semibold">{ex.equipmentType}</span>
    </div>
  );
};
