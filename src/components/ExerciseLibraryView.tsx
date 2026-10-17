import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Dumbbell,
  AlertTriangle,
  Wind,
  CheckCircle2,
  X,
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';
import { ExerciseItem } from '../types';

export const ExerciseLibraryView: React.FC = () => {
  const { exerciseLibrary, selectedExercise, setSelectedExercise, setIsChatDrawerOpen, sendChatMessage } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');

  const muscleGroups = ['all', 'صدر', 'ظهر', 'أرجل', 'أكتاف', 'ذراعين', 'بطن'];
  const equipmentTypes = ['all', 'أجهزة', 'دمبل', 'بار', 'وزن الجسم', 'حبال مقاومة'];

  const filteredExercises = exerciseLibrary.filter((ex) => {
    const matchesSearch =
      ex.arabicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.commonGymName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'all' || ex.targetMuscleGroup === selectedMuscle;
    const matchesEquipment = selectedEquipment === 'all' || ex.equipmentType === selectedEquipment;

    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* 1. Header & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          دليل أجهزة الصالة والتمارين
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          تعلّم ضبط مقاعد الأجهزة، وضعية البداية الآمنة، وتوقيت التنفس الصحيح، وتعرف على البدائل الفورية عندما يكون الجهاز مشغولاً.
        </p>

        {/* Search Input */}
        <div className="mt-5 relative">
          <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث باسم الجهاز أو التمرين (مثال: سحب، دفع أرجل، صدر، Lat Pulldown)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pr-11 pl-4 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 focus:outline-none transition-colors"
          />
        </div>

        {/* Muscle Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 no-scrollbar">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap ml-1">العضلة المستهدفة:</span>
          {muscleGroups.map((muscle) => (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedMuscle === muscle
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {muscle === 'all' ? 'الكل' : muscle}
            </button>
          ))}
        </div>

        {/* Equipment Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 no-scrollbar">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap ml-1">نوع الأداة:</span>
          {equipmentTypes.map((eq) => (
            <button
              key={eq}
              onClick={() => setSelectedEquipment(eq)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedEquipment === eq
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {eq === 'all' ? 'جميع المعدات' : eq}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Grid of Exercises */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredExercises.map((ex) => (
          <div
            key={ex.id}
            onClick={() => setSelectedExercise(ex)}
            className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:border-emerald-500 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-48 w-full bg-slate-100">
                <img
                  src={ex.image}
                  alt={ex.arabicName}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                  {ex.targetMuscleGroup} · {ex.equipmentType}
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition-colors">
                  {ex.arabicName}
                </h3>
                <div className="text-xs text-slate-400 font-mono">
                  {ex.commonGymName}
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                  {ex.machineAdjustmentGuide}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-semibold">
              <span>عرض الدليل وضبط المقعد</span>
              <Maximize2 className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Detailed Exercise Inspection Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="text-xs font-semibold text-emerald-700 mb-1">
                  عضلة {selectedExercise.targetMuscleGroup} · {selectedExercise.equipmentType}
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {selectedExercise.arabicName}
                </h2>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  {selectedExercise.commonGymName}
                </div>
              </div>
              <button
                onClick={() => setSelectedExercise(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media & Muscle Diagram */}
            <div className="relative rounded-xl overflow-hidden bg-slate-100 h-64 border border-slate-200">
              <img
                src={selectedExercise.image}
                alt={selectedExercise.arabicName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur-xs text-white text-xs p-2.5 rounded-xl max-w-xs">
                <span className="font-bold text-emerald-400 block mb-0.5">العضلات الثانوية المشتركة:</span>
                <span>{selectedExercise.secondaryMuscles.join('، ')}</span>
              </div>
            </div>

            {/* Adjustment Guide */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Dumbbell className="w-4 h-4 text-emerald-600" />
                <span>طريقة ضبط المقعد والمسند ووضعية البداية:</span>
              </div>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedExercise.machineAdjustmentGuide}
              </p>
            </div>

            {/* Breathing cadence */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Wind className="w-4 h-4 text-sky-600" />
                <span>تعليمات التنفس السليم (الشهيق والزفير):</span>
              </div>
              <p className="text-slate-700 leading-relaxed bg-sky-50/60 p-3 rounded-xl border border-sky-100">
                {selectedExercise.breathingGuide}
              </p>
            </div>

            {/* Common Mistakes */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>أخطاء شائعة يجب تجنبها لحماية المفاصل:</span>
              </div>
              <ul className="space-y-1 list-disc list-inside text-slate-700 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                {selectedExercise.commonMistakes.map((mistake, mIdx) => (
                  <li key={mIdx}>{mistake}</li>
                ))}
              </ul>
            </div>

            {/* Alternatives when occupied */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  الجهاز مشغول في الصالة؟ إليك بدائل بنفس الفعالية:
                </span>
              </div>
              <p className="text-slate-600">
                يمكنك التبديل فوراً لأي من التمارين التالية بالأوزان الحرة أو حبال المقاومة:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedExercise.alternativeExerciseIds.map((altId) => {
                  const altEx = exerciseLibrary.find((e) => e.id === altId);
                  if (!altEx) return null;
                  return (
                    <button
                      key={altId}
                      onClick={() => setSelectedExercise(altEx)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                    >
                      {altEx.arabicName} ({altEx.equipmentType})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ask AI Coach button */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedExercise(null);
                  setIsChatDrawerOpen(true);
                  sendChatMessage(`كيف أؤدي تمرين ${selectedExercise.arabicName} بشكل سليم إذا كان ظهري يؤلمني؟`);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-2 hover:bg-slate-800 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>اسأل كابتن على قدّك عن هذا التمرين</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
