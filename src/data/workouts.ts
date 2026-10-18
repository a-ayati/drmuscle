/**
 * برامج التمرين الأسبوعية حسب المكان وعدد الأيام.
 *
 * المكان: الصالة، البيت، الجري، المشي. عدد الأيام: من 2 إلى 6.
 * كل برنامج يتكون من حصص تتناوب (أ، ب، ج) موزعة على أيام الأسبوع، وبينها أيام راحة.
 */
import type { DayWorkoutSession, ExerciseItem, ExerciseSet, LocationPreference, WorkoutExercisePlan } from '../types';
import { BASE_EXERCISES } from './exercises';

const ex = (x: ExerciseItem) => x;

const EXTRA_EXERCISES: ExerciseItem[] = [
  ex({
    id: 'ex_bodyweight_squat',
    arabicName: 'سكوات بوزن الجسم',
    commonGymName: 'Bodyweight Squat',
    targetMuscleGroup: 'أرجل',
    secondaryMuscles: ['عضلات المؤخرة', 'الجذع'],
    equipmentType: 'وزن الجسم',
    image: '',
    machineAdjustmentGuide: 'قف وقدماك بعرض الكتفين وأصابعهما للخارج قليلاً. يمكنك الجلوس على كرسي ثم القيام منه إذا كانت ركبتك حساسة.',
    breathingGuide: 'شهيق أثناء النزول، وزفير أثناء الصعود.',
    commonMistakes: ['دخول الركبتين للداخل.', 'رفع الكعبين عن الأرض.', 'انحناء الظهر للأمام كثيراً.'],
    formTips: ['ادفع الأرض بكامل قدمك.', 'انزل فقط إلى المدى المريح لركبتك.'],
    alternativeExerciseIds: ['ex_wall_sit', 'ex_goblet_squat'],
    isHomeFriendly: true,
  }),
  ex({
    id: 'ex_wall_sit',
    arabicName: 'الجلوس على الحائط',
    commonGymName: 'Wall Sit',
    targetMuscleGroup: 'أرجل',
    secondaryMuscles: ['الأفخاذ الأمامية'],
    equipmentType: 'وزن الجسم',
    image: '',
    machineAdjustmentGuide: 'أسند ظهرك إلى الحائط وانزل حتى تقترب ركبتاك من زاوية 90 درجة، أو أعلى إذا شعرت بضغط على الركبة.',
    breathingGuide: 'تنفّس بهدوء وانتظام طوال الثبات، ولا تحبس نفسك.',
    commonMistakes: ['تقدّم الركبتين أمام أصابع القدمين.', 'حبس النفس.'],
    formTips: ['ابدأ بزاوية مريحة، ثم انزل تدريجياً مع الأسابيع.'],
    alternativeExerciseIds: ['ex_bodyweight_squat'],
    isHomeFriendly: true,
  }),
  ex({
    id: 'ex_glute_bridge',
    arabicName: 'رفع الحوض من الاستلقاء',
    commonGymName: 'Glute Bridge',
    targetMuscleGroup: 'أرجل',
    secondaryMuscles: ['عضلات المؤخرة', 'أسفل الظهر'],
    equipmentType: 'وزن الجسم',
    image: '',
    machineAdjustmentGuide: 'استلقِ على ظهرك، واثنِ ركبتيك، وضع قدميك على الأرض قريبتين من الحوض.',
    breathingGuide: 'زفير أثناء رفع الحوض، وشهيق أثناء النزول ببطء.',
    commonMistakes: ['تقويس أسفل الظهر بدل شد عضلات المؤخرة.', 'النزول بسرعة.'],
    formTips: ['اثبت ثانيتين في الأعلى مع شد المؤخرة.'],
    alternativeExerciseIds: ['ex_bodyweight_squat'],
    isHomeFriendly: true,
  }),
  ex({
    id: 'ex_superman',
    arabicName: 'تمرين السوبرمان لعضلات الظهر',
    commonGymName: 'Superman Hold',
    targetMuscleGroup: 'ظهر',
    secondaryMuscles: ['أسفل الظهر', 'عضلات المؤخرة'],
    equipmentType: 'وزن الجسم',
    image: '',
    machineAdjustmentGuide: 'استلقِ على بطنك ويداك ممدودتان للأمام.',
    breathingGuide: 'زفير أثناء رفع اليدين والقدمين قليلاً، وشهيق أثناء النزول.',
    commonMistakes: ['رفع الرأس للأعلى كثيراً.', 'الحركة السريعة المتأرجحة.'],
    formTips: ['ارفع قليلاً فقط واثبت ثانيتين، فالهدف التحكم لا الارتفاع.'],
    alternativeExerciseIds: ['ex_dumbbell_row'],
    isHomeFriendly: true,
  }),
  ex({
    id: 'ex_shoulder_press',
    arabicName: 'ضغط الكتف بالدمبل جالساً',
    commonGymName: 'Seated Dumbbell Shoulder Press',
    targetMuscleGroup: 'أكتاف',
    secondaryMuscles: ['الترايسبس', 'أعلى الصدر'],
    equipmentType: 'دمبل',
    image: '',
    machineAdjustmentGuide: 'اجلس على بنش بظهر قائم، وابدأ والدمبل عند مستوى الأذنين.',
    breathingGuide: 'زفير أثناء الدفع للأعلى، وشهيق أثناء النزول.',
    commonMistakes: ['تقويس أسفل الظهر.', 'قفل المرفقين بقوة في الأعلى.'],
    formTips: ['ابدأ بوزن خفيف جداً، فالكتف مفصل حساس.'],
    alternativeExerciseIds: ['ex_pushups'],
    isHomeFriendly: true,
  }),
  ex({
    id: 'ex_brisk_walk',
    arabicName: 'مشي سريع',
    commonGymName: 'Brisk Walk',
    targetMuscleGroup: 'قلب ورئتان',
    secondaryMuscles: ['الأرجل'],
    equipmentType: 'بدون أدوات',
    image: '',
    machineAdjustmentGuide: 'امشِ بسرعة تستطيع معها الكلام بجمل قصيرة دون أن تلهث. على جهاز المشي، استعمل ميلاً خفيفاً 1 إلى 2٪.',
    breathingGuide: 'تنفّس من أنفك قدر الإمكان، وحرّك ذراعيك مع خطواتك.',
    commonMistakes: ['خطوات طويلة جداً تجهد الركبة.', 'الانحناء إلى الأمام.'],
    formTips: ['في قطر، امشِ في الصباح الباكر أو بعد المغرب، أو في مكان مكيّف، واشرب الماء.'],
    alternativeExerciseIds: ['ex_easy_walk'],
    isHomeFriendly: true,
  }),
  ex({
    id: 'ex_easy_walk',
    arabicName: 'مشي هادئ',
    commonGymName: 'Easy Walk',
    targetMuscleGroup: 'قلب ورئتان',
    secondaryMuscles: ['الأرجل'],
    equipmentType: 'بدون أدوات',
    image: '',
    machineAdjustmentGuide: 'سرعة مريحة تستطيع معها الحديث بسهولة.',
    breathingGuide: 'تنفّس بهدوء ودع نبضك ينخفض.',
    commonMistakes: ['التوقف المفاجئ بعد الجهد.'],
    formTips: ['استعمله للإحماء والتهدئة وفترات الاستشفاء.'],
    alternativeExerciseIds: ['ex_brisk_walk'],
    isHomeFriendly: true,
  }),
  ex({
    id: 'ex_jog',
    arabicName: 'جري خفيف',
    commonGymName: 'Easy Jog',
    targetMuscleGroup: 'قلب ورئتان',
    secondaryMuscles: ['الأرجل', 'الجذع'],
    equipmentType: 'بدون أدوات',
    image: '',
    machineAdjustmentGuide: 'اجرِ ببطء شديد، أبطأ مما تظن. يجب أن تستطيع قول جملة كاملة أثناء الجري.',
    breathingGuide: 'إيقاع منتظم: شهيق لخطوتين أو ثلاث، وزفير لخطوتين أو ثلاث.',
    commonMistakes: ['البدء بسرعة كبيرة.', 'الهبوط على الكعب بخطوة طويلة أمام الجسم.'],
    formTips: ['خطوات قصيرة وسريعة، والقدم تهبط تحت الجسم.', 'إذا لهثت، فحوّل إلى مشي حتى يهدأ نفسك.'],
    alternativeExerciseIds: ['ex_brisk_walk'],
    isHomeFriendly: true,
  }),
];

const VALID = new Set([...BASE_EXERCISES, ...EXTRA_EXERCISES].map((e) => e.id));

/** مكتبة التمارين كاملة، مع حذف أي بديل يشير إلى تمرين غير موجود. */
export const ALL_EXERCISES: ExerciseItem[] = [...BASE_EXERCISES, ...EXTRA_EXERCISES].map((e) => ({
  ...e,
  alternativeExerciseIds: e.alternativeExerciseIds.filter((id) => VALID.has(id)),
}));

// ───────────────── أدوات بناء الحصص ─────────────────

const reps = (n: number, list: (number | [number, number])[]): ExerciseSet[] =>
  list.map((x, i) =>
    Array.isArray(x)
      ? { setNumber: i + 1, targetReps: x[0], weightKg: x[1], completed: false }
      : { setNumber: i + 1, targetReps: x, completed: false }
  ).slice(0, n);

const timed = (count: number, sec: number): ExerciseSet[] =>
  Array.from({ length: count }, (_, i) => ({ setNumber: i + 1, targetDurationSec: sec, completed: false }));

const plan = (exerciseId: string, sets: ExerciseSet[], restSeconds: number, notes?: string): WorkoutExercisePlan => ({
  exerciseId,
  sets,
  restSeconds,
  notes,
});

interface Template {
  key: string;
  title: string;
  focus: string;
  warmup: DayWorkoutSession['warmup'];
  exercises: WorkoutExercisePlan[];
  cooldown: DayWorkoutSession['cooldown'];
}

const STRENGTH_WARMUP = [
  { name: 'مشي في المكان أو دراجة ثابتة', durationSec: 180, notes: 'لرفع حرارة الجسم' },
  { name: 'دوران الكتفين والذراعين', durationSec: 60, notes: 'حركة سلسة دون ألم' },
  { name: 'تأرجح الساقين للأمام والجانب', durationSec: 60, notes: 'لتجهيز مفصل الحوض' },
];
const STRENGTH_COOLDOWN = [
  { name: 'إطالة الصدر والكتفين على الحائط', durationSec: 60, notes: '30 ثانية لكل جانب' },
  { name: 'إطالة الفخذ الأمامي والخلفي', durationSec: 90, notes: 'دون ارتداد' },
  { name: 'تنفّس عميق', durationSec: 60, notes: 'شهيق 4 ثوانٍ وزفير 6 ثوانٍ' },
];
const CARDIO_WARMUP = [
  { name: 'مشي هادئ', durationSec: 300, notes: 'ارفع سرعتك تدريجياً' },
  { name: 'دوران الكاحلين والركبتين والحوض', durationSec: 60, notes: 'لتجهيز المفاصل' },
];
const CARDIO_COOLDOWN = [
  { name: 'مشي هادئ', durationSec: 300, notes: 'حتى يعود نفسك طبيعياً' },
  { name: 'إطالة السمانة والفخذ', durationSec: 120, notes: '30 ثانية لكل عضلة' },
];

const TEMPLATES: Record<LocationPreference, Template[]> = {
  gym: [
    {
      key: 'A',
      title: 'حصة الجزء العلوي',
      focus: 'الظهر والصدر والكتفين',
      warmup: STRENGTH_WARMUP,
      exercises: [
        plan('ex_lat_pulldown', reps(3, [[12, 25], [10, 30], [10, 30]]), 75, 'انزل ببطء واشعر بلوح الكتف'),
        plan('ex_chest_press_dumbbell', reps(3, [[12, 10], [10, 12], [10, 12]]), 75, 'الوزن لكل يد'),
        plan('ex_dumbbell_row', reps(3, [[10, 10], [10, 12], [10, 12]]), 60, 'الوزن لكل يد'),
        plan('ex_shoulder_press', reps(2, [[10, 6], [10, 6]]), 60, 'ابدأ خفيفاً'),
        plan('ex_plank', timed(2, 30), 45),
      ],
      cooldown: STRENGTH_COOLDOWN,
    },
    {
      key: 'B',
      title: 'حصة الجزء السفلي والجذع',
      focus: 'الأفخاذ وعضلات المؤخرة والجذع، بحمل لطيف على الركبة',
      warmup: STRENGTH_WARMUP,
      exercises: [
        plan('ex_leg_press', reps(3, [[12, 40], [12, 50], [10, 50]]), 90, 'لا تقفل الركبة في الأعلى'),
        plan('ex_goblet_squat', reps(3, [[10, 8], [10, 10], [10, 10]]), 75),
        plan('ex_glute_bridge', reps(3, [15, 15, 15]), 45),
        plan('ex_plank', timed(3, 30), 45),
      ],
      cooldown: STRENGTH_COOLDOWN,
    },
    {
      key: 'C',
      title: 'حصة الجسم كاملاً',
      focus: 'حركات أساسية لكل الجسم في حصة واحدة',
      warmup: STRENGTH_WARMUP,
      exercises: [
        plan('ex_goblet_squat', reps(3, [[10, 10], [10, 12], [10, 12]]), 75),
        plan('ex_chest_press_dumbbell', reps(3, [[10, 12], [10, 12], [10, 12]]), 75),
        plan('ex_lat_pulldown', reps(3, [[10, 30], [10, 30], [10, 30]]), 75),
        plan('ex_glute_bridge', reps(2, [15, 15]), 45),
        plan('ex_plank', timed(2, 35), 45),
      ],
      cooldown: STRENGTH_COOLDOWN,
    },
  ],
  home: [
    {
      key: 'A',
      title: 'حصة منزلية للجزء العلوي',
      focus: 'الصدر والظهر والجذع بوزن الجسم',
      warmup: STRENGTH_WARMUP,
      exercises: [
        plan('ex_pushups', reps(3, [10, 10, 8]), 60, 'على الركبتين أو على حافة طاولة إذا كان صعباً'),
        plan('ex_superman', reps(3, [12, 12, 12]), 45),
        plan('ex_pushups', reps(2, [8, 8]), 60, 'بأيدٍ أضيق قليلاً'),
        plan('ex_plank', timed(3, 30), 45),
      ],
      cooldown: STRENGTH_COOLDOWN,
    },
    {
      key: 'B',
      title: 'حصة منزلية للأرجل',
      focus: 'الأفخاذ وعضلات المؤخرة دون أدوات',
      warmup: STRENGTH_WARMUP,
      exercises: [
        plan('ex_bodyweight_squat', reps(3, [15, 15, 12]), 60, 'استعمل كرسياً إذا كانت ركبتك حساسة'),
        plan('ex_glute_bridge', reps(3, [15, 15, 15]), 45),
        plan('ex_wall_sit', timed(3, 30), 60),
        plan('ex_plank', timed(2, 30), 45),
      ],
      cooldown: STRENGTH_COOLDOWN,
    },
    {
      key: 'C',
      title: 'دائرة منزلية للجسم كاملاً',
      focus: 'حركات متتالية ترفع النبض وتقوي الجسم',
      warmup: STRENGTH_WARMUP,
      exercises: [
        plan('ex_bodyweight_squat', reps(3, [12, 12, 12]), 30),
        plan('ex_pushups', reps(3, [8, 8, 8]), 30),
        plan('ex_glute_bridge', reps(3, [12, 12, 12]), 30),
        plan('ex_superman', reps(3, [10, 10, 10]), 30),
        plan('ex_plank', timed(3, 30), 45),
      ],
      cooldown: STRENGTH_COOLDOWN,
    },
  ],
  run: [
    {
      key: 'A',
      title: 'جري متقطع للمبتدئين',
      focus: 'دقيقة جري ثم دقيقتا مشي، 6 مرات',
      warmup: CARDIO_WARMUP,
      exercises: [plan('ex_jog', timed(6, 60), 120, 'الراحة هنا مشي هادئ وليست توقفاً')],
      cooldown: CARDIO_COOLDOWN,
    },
    {
      key: 'B',
      title: 'جري متقطع أطول',
      focus: 'دقيقتا جري ثم دقيقة ونصف مشي، 6 مرات',
      warmup: CARDIO_WARMUP,
      exercises: [plan('ex_jog', timed(6, 120), 90, 'الراحة هنا مشي هادئ وليست توقفاً')],
      cooldown: CARDIO_COOLDOWN,
    },
    {
      key: 'C',
      title: 'جري هادئ متواصل',
      focus: 'ثلاث فترات جري هادئ مدة كل منها 5 دقائق',
      warmup: CARDIO_WARMUP,
      exercises: [plan('ex_jog', timed(3, 300), 120, 'الراحة هنا مشي هادئ وليست توقفاً')],
      cooldown: CARDIO_COOLDOWN,
    },
  ],
  walk: [
    {
      key: 'A',
      title: 'مشي سريع',
      focus: '30 دقيقة مشي سريع على ثلاث فترات',
      warmup: CARDIO_WARMUP.slice(0, 1).map((w) => ({ ...w, durationSec: 180 })),
      exercises: [plan('ex_brisk_walk', timed(3, 600), 60, 'الراحة هنا مشي هادئ وليست توقفاً')],
      cooldown: CARDIO_COOLDOWN.slice(1),
    },
    {
      key: 'B',
      title: 'مشي بالتناوب بين السريع والهادئ',
      focus: '3 دقائق سريعة ثم دقيقتان هادئتان، 6 مرات',
      warmup: CARDIO_WARMUP.slice(0, 1).map((w) => ({ ...w, durationSec: 180 })),
      exercises: [plan('ex_brisk_walk', timed(6, 180), 120, 'الراحة هنا مشي هادئ وليست توقفاً')],
      cooldown: CARDIO_COOLDOWN.slice(1),
    },
    {
      key: 'C',
      title: 'مشي طويل هادئ',
      focus: '45 دقيقة على ثلاث فترات بسرعة مريحة',
      warmup: CARDIO_WARMUP.slice(0, 1).map((w) => ({ ...w, durationSec: 180 })),
      exercises: [plan('ex_brisk_walk', timed(3, 900), 60, 'الراحة هنا مشي هادئ وليست توقفاً')],
      cooldown: CARDIO_COOLDOWN.slice(1),
    },
  ],
};

export const WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/** أيام التمرين في الأسبوع (0 = الأحد) حسب العدد، مع ترك يوم راحة بين الحصص قدر الإمكان. */
export const TRAINING_DAYS: Record<number, number[]> = {
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
};

export const LOCATION_LABELS: Record<LocationPreference, string> = {
  gym: 'الصالة',
  home: 'البيت',
  run: 'الجري',
  walk: 'المشي',
};

const SET_WORK_SEC = 40; // متوسط زمن مجموعة التكرارات

function estimateMinutes(t: Template): number {
  const warm = t.warmup.reduce((s, w) => s + w.durationSec, 0);
  const cool = t.cooldown.reduce((s, w) => s + w.durationSec, 0);
  const main = t.exercises.reduce(
    (s, e) =>
      s + e.sets.reduce((a, set) => a + (set.targetDurationSec ?? SET_WORK_SEC), 0) + e.restSeconds * Math.max(0, e.sets.length - 1),
    0
  );
  const transitions = Math.max(0, t.exercises.length - 1) * 60;
  return Math.round((warm + cool + main + transitions) / 60 / 5) * 5 || 5;
}

export function buildWeeklyWorkouts(location: LocationPreference, daysPerWeek: number): DayWorkoutSession[] {
  const days = TRAINING_DAYS[Math.min(6, Math.max(2, Math.round(daysPerWeek)))] ?? TRAINING_DAYS[3];
  const templates = TEMPLATES[location] ?? TEMPLATES.gym;
  return days.map((weekday, i) => {
    const t = templates[i % templates.length];
    return {
      id: `w_${location}_${weekday}_${t.key}`,
      weekdayIndex: weekday,
      dayName: `${WEEKDAYS[weekday]} · ${t.title}`,
      title: t.title,
      focus: t.focus,
      estimatedMinutes: estimateMinutes(t),
      location,
      warmup: t.warmup,
      exercises: JSON.parse(JSON.stringify(t.exercises)),
      cooldown: t.cooldown,
    };
  });
}

/** يبني البرنامج ويُبقي على ما أنجزه المستخدم في الحصص المحفوظة بنفس المعرّف. */
export function mergeWorkoutProgress(fresh: DayWorkoutSession[], saved?: DayWorkoutSession[]): DayWorkoutSession[] {
  if (!saved) return fresh;
  return fresh.map((s) => {
    const old = saved.find((o) => o.id === s.id);
    return old ? { ...s, isCompleted: old.isCompleted, exercises: old.exercises?.length ? old.exercises : s.exercises } : s;
  });
}
