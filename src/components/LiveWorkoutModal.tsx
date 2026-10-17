import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Volume2,
  VolumeX,
  Bell,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  Clock,
  Play,
  Pause,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const LiveWorkoutModal: React.FC = () => {
  const {
    isLiveWorkoutModalOpen,
    closeLiveWorkout,
    activeWorkoutSession,
    currentExerciseIndex,
    currentSetIndex,
    isResting,
    restTimeRemaining,
    timerActive,
    audioMode,
    setAudioMode,
    finishCurrentSet,
    skipRestTimer,
    adjustRestTimer,
    swapCurrentExercise,
    completeWorkout,
    workoutPainAlert,
    clearPainAlert,
    exerciseLibrary,
    setIsChatDrawerOpen,
    sendChatMessage,
  } = useApp();

  if (!isLiveWorkoutModalOpen || !activeWorkoutSession) return null;

  const currentExPlan = activeWorkoutSession.exercises[currentExerciseIndex];
  const currentExData = exerciseLibrary.find((e) => e.id === currentExPlan?.exerciseId);
  const currentSet = currentExPlan?.sets[currentSetIndex];

  const [inputWeight, setInputWeight] = useState<number>(currentSet?.weightKg || 12);
  const [inputReps, setInputReps] = useState<number>(currentSet?.targetReps || 10);
  const [showSwapDrawer, setShowSwapDrawer] = useState<boolean>(false);
  const [quickInWorkoutQuery, setQuickInWorkoutQuery] = useState<string>('');

  const nextExPlan = activeWorkoutSession.exercises[currentExerciseIndex + 1];
  const nextExData = nextExPlan ? exerciseLibrary.find((e) => e.id === nextExPlan.exerciseId) : null;

  const isSessionFinished = activeWorkoutSession.isCompleted || (
    currentExerciseIndex >= activeWorkoutSession.exercises.length - 1 &&
    currentSetIndex >= (currentExPlan?.sets.length || 1) - 1 &&
    currentSet?.completed
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md text-white flex flex-col justify-between overflow-y-auto">
      {/* Top Bar Controls */}
      <div className="max-w-3xl w-full mx-auto px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div>
          <span className="text-xs text-emerald-400 font-semibold block">
            حصة مباشرة · {activeWorkoutSession.dayName}
          </span>
          <span className="text-sm font-bold text-slate-200">
            تمرين {currentExerciseIndex + 1} من {activeWorkoutSession.exercises.length}
          </span>
        </div>

        {/* Audio Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setAudioMode('full_guidance')}
            className={`px-2 py-1 rounded-lg transition-colors ${
              audioMode === 'full_guidance' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="إرشاد صوتي كامل"
          >
            صوت كامل
          </button>
          <button
            onClick={() => setAudioMode('essential_beeps')}
            className={`px-2 py-1 rounded-lg transition-colors ${
              audioMode === 'essential_beeps' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="تنبيهات نغمية فقط"
          >
            تنبيهات
          </button>
          <button
            onClick={() => setAudioMode('silent_visual')}
            className={`px-2 py-1 rounded-lg transition-colors ${
              audioMode === 'silent_visual' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="وضع صامت واهتزاز"
          >
            صامت
          </button>
        </div>

        {/* Close / Exit Button */}
        <button
          onClick={closeLiveWorkout}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="إغلاق شاشة التمرين"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Body */}
      <div className="max-w-2xl w-full mx-auto px-4 py-6 flex-1 flex flex-col justify-center space-y-6">
        {/* Pain / Safety Alert Banner */}
        {workoutPainAlert && (
          <div className="bg-rose-950/90 border border-rose-500/80 p-4 rounded-2xl flex items-start justify-between gap-3 text-rose-100 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-rose-200">تنبيه سلامة وأمان!</h4>
                <p className="text-xs text-rose-300 mt-1 leading-relaxed">
                  تم تسجيل ألم أو انزعاج. نوصيك بالتوقف الفوري عن هذا التمرين أو تقليل المدى الحركي والوزن. لا تضغط على المفصل فوق الألم، واستشر طبيباً إذا استمر.
                </p>
              </div>
            </div>
            <button
              onClick={clearPainAlert}
              className="text-xs underline text-rose-300 hover:text-white shrink-0"
            >
              تم الفهم
            </button>
          </div>
        )}

        {/* 1. Rest Timer Active Mode */}
        {isResting ? (
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
              فترة الراحة والاسترجاع
            </div>

            {/* Giant Countdown Number */}
            <div className="text-7xl sm:text-8xl font-black text-emerald-400 tracking-tight tabular-nums animate-pulse">
              {restTimeRemaining}
              <span className="text-2xl font-normal text-slate-400 mr-2">ث</span>
            </div>

            <p className="text-xs text-slate-300">
              تنفس بعمق واشرب رشفة ماء. استعد للمجموعة القادمة.
            </p>

            {/* Timer Adjusters */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => adjustRestTimer(-15)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1"
              >
                <Minus className="w-4 h-4" />
                <span>15- ث</span>
              </button>
              <button
                onClick={() => adjustRestTimer(15)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>15+ ث</span>
              </button>
              <button
                onClick={skipRestTimer}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors"
              >
                تخطي الراحة والبدء
              </button>
            </div>

            {/* Next Exercise Preview */}
            {nextExData && (
              <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 text-right flex items-center justify-between">
                <span>التمرين التالي:</span>
                <span className="text-slate-200 font-semibold">{nextExData.arabicName}</span>
              </div>
            )}
          </div>
        ) : (
          /* 2. Active Set Execution Mode */
          <div className="space-y-6">
            {/* Exercise Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-emerald-400 font-bold mb-1">
                    المجموعة {currentSetIndex + 1} من {currentExPlan?.sets.length || 3}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {currentExData?.arabicName}
                  </h2>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {currentExData?.commonGymName} · {currentExData?.equipmentType}
                  </div>
                </div>

                <button
                  onClick={() => setShowSwapDrawer(!showSwapDrawer)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>الجهاز مشغول؟ بدّل</span>
                </button>
              </div>

              {/* Form & breathing cues */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <div className="font-semibold text-emerald-400">تذكير بالأداء والتنفس:</div>
                <p>{currentExData?.breathingGuide}</p>
              </div>

              {/* Input Weight & Reps */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-center">
                  <span className="text-xs text-slate-400 block mb-1">الوزن (كجم)</span>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setInputWeight((w) => Math.max(0, w - 2.5))}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-white tabular-nums">{inputWeight}</span>
                    <button
                      onClick={() => setInputWeight((w) => w + 2.5)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">السابق: {currentSet?.weightKg || 12} كجم</span>
                </div>

                <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-center">
                  <span className="text-xs text-slate-400 block mb-1">التكرارات المنجزة</span>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setInputReps((r) => Math.max(1, r - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-white tabular-nums">{inputReps}</span>
                    <button
                      onClick={() => setInputReps((r) => r + 1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">المستهدف: {currentSet?.targetReps || 10}</span>
                </div>
              </div>

              {/* Set Completion & RPE Evaluation buttons */}
              <div className="pt-3 space-y-2">
                <div className="text-xs text-slate-400 text-center mb-1">
                  سجّل شعورك بعد إتمام المجموعة:
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => finishCurrentSet(inputWeight, inputReps, 'easy')}
                    className="py-3 rounded-xl bg-slate-800 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-500 text-xs font-semibold text-slate-200 transition-all text-center"
                  >
                    سهلة 🟢
                  </button>
                  <button
                    onClick={() => finishCurrentSet(inputWeight, inputReps, 'moderate')}
                    className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all text-center shadow-lg"
                  >
                    مناسبة ⭐
                  </button>
                  <button
                    onClick={() => finishCurrentSet(inputWeight, inputReps, 'hard')}
                    className="py-3 rounded-xl bg-slate-800 hover:bg-amber-950/60 border border-slate-700 hover:border-amber-500 text-xs font-semibold text-slate-200 transition-all text-center"
                  >
                    صعبة 🔥
                  </button>
                  <button
                    onClick={() => finishCurrentSet(inputWeight, inputReps, 'pain')}
                    className="py-3 rounded-xl bg-rose-950/60 border border-rose-800 hover:bg-rose-900 text-xs font-semibold text-rose-300 transition-all text-center"
                  >
                    ألم / مفصل ⚠️
                  </button>
                </div>
              </div>
            </div>

            {/* Quick in-workout Coach query */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <input
                type="text"
                placeholder="سؤال سريع للكابتن خلال الحصة (لا يوقف المؤقت)..."
                value={quickInWorkoutQuery}
                onChange={(e) => setQuickInWorkoutQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && quickInWorkoutQuery.trim()) {
                    setIsChatDrawerOpen(true);
                    sendChatMessage(`أنا الآن في تمرين ${currentExData?.arabicName}: ${quickInWorkoutQuery}`);
                    setQuickInWorkoutQuery('');
                  }
                }}
                className="w-full bg-transparent border-0 text-slate-200 placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (quickInWorkoutQuery.trim()) {
                    setIsChatDrawerOpen(true);
                    sendChatMessage(`أنا الآن في تمرين ${currentExData?.arabicName}: ${quickInWorkoutQuery}`);
                    setQuickInWorkoutQuery('');
                  }
                }}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg shrink-0 font-medium"
              >
                إرسال
              </button>
            </div>
          </div>
        )}

        {/* In-Workout Exercise Swap Drawer */}
        {showSwapDrawer && currentExData && (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">اختر بديلاً فورياً لهذا التمرين:</span>
              <button onClick={() => setShowSwapDrawer(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentExData.alternativeExerciseIds.map((altId) => {
                const alt = exerciseLibrary.find((e) => e.id === altId);
                if (!alt) return null;
                return (
                  <button
                    key={altId}
                    onClick={() => {
                      swapCurrentExercise(altId);
                      setShowSwapDrawer(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-900 border border-slate-700 text-right text-slate-200"
                  >
                    <div className="font-bold">{alt.arabicName}</div>
                    <div className="text-[11px] text-slate-400">{alt.equipmentType}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Completion Bar */}
      <div className="max-w-2xl w-full mx-auto px-4 py-4 border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={closeLiveWorkout}
          className="text-xs text-slate-400 hover:text-white"
        >
          متابعة لاحقاً (حفظ التقدم)
        </button>

        <button
          onClick={completeWorkout}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs sm:text-sm text-white transition-colors"
        >
          إنهاء الحصة وتسجيل الإنجاز
        </button>
      </div>
    </div>
  );
};
