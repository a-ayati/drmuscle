import React, { useState } from 'react';
import { LocationPicker } from './LocationPicker';
import { ExerciseThumb } from './ExerciseThumb';
import { WEEKDAYS, LOCATION_LABELS } from '../data/workouts';
import { useApp } from '../context/AppContext';
import {
  Dumbbell,
  Clock,
  MapPin,
  Zap,
  ChevronLeft,
  Info,
  ShieldAlert,
  Flame,
  ArrowRight,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';

export const WorkoutPlanView: React.FC = () => {
  const {
    userProfile,
    workoutSessions,
    startLiveWorkout,
    exerciseLibrary,
    setSelectedExercise,
    isExpressWorkout,
    toggleExpressWorkout,
    workoutLocation,
    todayIndex,
  } = useApp();

  const initialIndex = Math.max(0, workoutSessions.findIndex((s) => (s.weekdayIndex ?? 0) >= todayIndex));
  const [selectedSessionIndex, setSelectedSessionIndex] = useState<number>(initialIndex);
  const currentSession = workoutSessions[selectedSessionIndex] || workoutSessions[0];
  const isCardio = workoutLocation === 'run' || workoutLocation === 'walk';
  const levelText: Record<string, string> = { beginner: 'مبتدئ', returning: 'عائد بعد انقطاع', intermediate: 'متوسط' };
  const fmtDur = (sec: number) => (sec >= 60 ? `${Math.round(sec / 60)} دقيقة` : `${sec} ثانية`);

  if (!currentSession) return null;

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              برنامج التمارين المخصص
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-xl">
              {workoutSessions.length} حصص أسبوعياً · {LOCATION_LABELS[workoutLocation]} · مستوى {levelText[userProfile.experienceLevel] ?? 'مبتدئ'}
              {userProfile.injuries.filter(Boolean).length > 0 && ` · مع مراعاة: ${userProfile.injuries.filter(Boolean).join('، ')}`}
            </p>
          </div>

          <button
            onClick={() => startLiveWorkout(currentSession.id)}
            className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all self-start md:self-auto whitespace-nowrap"
          >
            <Dumbbell className="w-4 h-4" />
            <span>ابدأ هذه الحصة الآن</span>
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
          <LocationPicker />

          {/* أيام الأسبوع: حصة أو راحة */}
          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((dayName, wd) => {
              const idx = workoutSessions.findIndex((s) => s.weekdayIndex === wd);
              const session = idx >= 0 ? workoutSessions[idx] : null;
              const selected = idx === selectedSessionIndex;
              const isToday = wd === todayIndex;
              return (
                <button
                  key={dayName}
                  type="button"
                  disabled={!session}
                  onClick={() => session && setSelectedSessionIndex(idx)}
                  className={`rounded-xl border px-1 py-2 text-center transition-colors ${
                    selected
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : session
                      ? 'bg-white border-slate-200 text-slate-800 hover:border-emerald-600'
                      : 'bg-slate-50 border-slate-100 text-slate-400 cursor-default'
                  }`}
                >
                  <div className={`text-[11px] font-bold ${isToday && !selected ? 'text-emerald-700' : ''}`}>{dayName}</div>
                  <div className="text-[10px] mt-1 leading-tight">
                    {session ? (session.isCompleted ? 'تمّت ✓' : 'حصة') : 'راحة'}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
            <span className="font-bold text-slate-900">{currentSession.dayName}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> نحو {currentSession.estimatedMinutes} دقيقة
            </span>
          </div>
        </div>
      </div>

      {/* 2. Injury & Progressive Overload Safety Advice */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs text-emerald-950">
        <TrendingUp className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm text-emerald-900 mb-1">{isCardio ? 'ابدأ أبطأ مما تظن' : 'مبدأ التدرج في «على قدّك»'}</h4>
          <p className="leading-relaxed">
            لا نزيد الأوزان بشكل عشوائي! بعد كل مجموعة، تسجل درجة الصعوبة؛ إذا كانت «سهلة» لجلستين متتاليتين، يقترح عليك التطبيق زيادة بسيطة (1-2 كجم) أو إضافة تكرار واحد مع الحفاظ على التكنيك السليم وخلو الحركة من أي ألم.
          </p>
        </div>
      </div>

      {/* 3. Session Warmup Sequence */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-base">
              الإحماء (نحو {Math.round(currentSession.warmup.reduce((a, c) => a + c.durationSec, 0) / 60)} دقائق)
            </h3>
          </div>
          <span className="text-xs text-slate-500">إلزامي لتجنب الإصابات</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {currentSession.warmup.map((step, wIdx) => (
            <div key={wIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
              <div className="font-bold text-slate-900 mb-1">{step.name}</div>
              <div className="text-slate-500">{step.notes}</div>
              <div className="text-emerald-700 font-semibold mt-2 tabular-nums">
                المدة: {fmtDur(step.durationSec)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Ordered Exercises List */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-base px-1">
          تمارين الحصة بالترتيب الميكانيكي المدروس
        </h3>

        {currentSession.exercises.map((exPlan, idx) => {
          const exInfo = exerciseLibrary.find((e) => e.id === exPlan.exerciseId);
          if (!exInfo) return null;

          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row gap-5 items-start"
            >
              <div className="w-full md:w-36 h-32 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
                <ExerciseThumb ex={exInfo} />
                <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  تمرين #{idx + 1}
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-base text-slate-900">
                    {exInfo.arabicName}
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">
                    {exInfo.commonGymName} · {exInfo.equipmentType}
                  </span>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed">
                  {exInfo.machineAdjustmentGuide}
                </div>

                {/* Sets & Target Matrix */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {exPlan.sets.map((set, sIdx) => (
                    <div
                      key={sIdx}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-center gap-1.5"
                    >
                      <span className="font-semibold text-slate-900">م{set.setNumber}:</span>
                      {set.targetReps ? <span>{set.targetReps} تكرار</span> : null}
                      {set.targetDurationSec ? <span>{fmtDur(set.targetDurationSec)}</span> : null}
                      {set.weightKg ? <span className="font-bold text-emerald-800">{set.weightKg} كجم</span> : null}
                    </div>
                  ))}
                  <div className="text-xs text-slate-500 mr-2">
                    {isCardio ? 'مشي هادئ بين الفترات' : 'راحة بين المجموعات'}: <strong className="text-slate-800">{fmtDur(exPlan.restSeconds)}</strong>
                  </div>
                </div>

                {/* Actions & Library guide */}
                <div className="pt-3 flex flex-wrap items-center gap-2 text-xs">
                  <button
                    onClick={() => setSelectedExercise(exInfo)}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                  >
                    {isCardio ? 'نصائح الأداء والتنفس' : 'شرح التمرين والتنفس'}
                  </button>

                  {exPlan.notes && <span className="text-slate-500 text-[11px]">{exPlan.notes}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Cooldown */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <h3 className="font-bold text-slate-900 text-base mb-2">
          التهدئة والإطالة (نحو {Math.round(currentSession.cooldown.reduce((a, c) => a + c.durationSec, 0) / 60)} دقائق)
        </h3>
        <p className="text-xs text-slate-600 mb-3">
          تساعد على إعادة مرونة العضلات وخفض هرمون التوتر وتخفيف الشد العضلي لليوم التالي.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentSession.cooldown.map((c, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
              <div className="font-bold text-slate-800">{c.name}</div>
              <div className="text-slate-500 mt-0.5">{c.notes}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
