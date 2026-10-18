import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  UserProfile,
  Meal,
  DayNutritionPlan,
  DayWorkoutSession,
  ShoppingItem,
  ExerciseItem,
  ChatMessage,
  WeeklyReview,
  AppNotification,
  LocationPreference,
} from '../types';
import { DEFAULT_USER_PROFILE } from '../data/initialData';
import {
  COUNTRIES,
  CountryCode,
  countryByName,
  mealsFor,
  refreshPlan,
  defaultWeekPlan,
  buildShoppingList,
  ShoppingStatus,
  suggestedWeeklyBudget,
  money as formatMoney,
  MealSlot,
  SLOT_LABELS,
  PRICES_CHECKED_AT,
  pantryFriendlyMealId,
  dayTotals,
} from '../data/food';
import { ALL_EXERCISES, buildWeeklyWorkouts, mergeWorkoutProgress, LOCATION_LABELS, WEEKDAYS } from '../data/workouts';
import { audioCoach } from '../services/audioCoach';
import { api, AuthUser } from '../lib/api';

/** ما يُحفظ في حساب المستخدم على الخادم. */
export interface SavedAppData {
  version: 2;
  userProfile: UserProfile;
  nutritionDays: DayNutritionPlan[];
  /** حالة كل صنف في قائمة المشتريات (اشتريته، عندي في المطبخ، السعر الفعلي). القائمة نفسها تُبنى من الخطة. */
  shoppingStatus: Record<string, ShoppingStatus>;
  workoutSessions: DayWorkoutSession[];
  weeklyReviews: WeeklyReview[];
  notifications: AppNotification[];
  settings: {
    audioMode: 'full_guidance' | 'essential_beeps' | 'silent_visual';
    pricesSeen?: string;
    lastDailyNotice?: string;
    /** بداية الأسبوع (الأحد) الذي تخصّه الحصص المنجزة والمشتريات */
    weekKey?: string;
  };
}

const MAX_NOTIFICATIONS = 300;
const VALID_LOCATIONS: LocationPreference[] = ['gym', 'home', 'run', 'walk'];
const localDateKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const weekStartKey = (d = new Date()) => localDateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay()));

/** يصحح ملفاً محفوظاً قديماً: دولة غير مدعومة، أو مكان تمرين غير معروف. */
function migrateProfile(p: UserProfile): UserProfile {
  const supported = COUNTRIES.some((c) => c.name === p.country);
  const c = countryByName(p.country);
  return {
    ...p,
    country: c.name,
    currency: c.currency,
    foodBudgetWeekly: supported ? p.foodBudgetWeekly : suggestedWeeklyBudget(c.code, p.budgetPersons || 1),
    location: VALID_LOCATIONS.includes(p.location) ? p.location : 'gym',
    workoutDaysPerWeek: Math.min(6, Math.max(2, p.workoutDaysPerWeek || 3)),
  };
}

export type SaveStatus = 'saved' | 'saving' | 'error';

/** ملف شخصي لمستخدم جديد: نأخذ القيم الافتراضية المعقولة، ونفرغ البيانات الشخصية للمثال. */
export function newUserProfile(name: string): UserProfile {
  return {
    ...DEFAULT_USER_PROFILE,
    name,
    country: 'قطر',
    currency: 'ر.ق',
    foodBudgetWeekly: suggestedWeeklyBudget('QA'),
    workoutDaysPerWeek: 3,
    location: 'gym',
    injuries: [],
    dislikedFoods: [],
    isCompleted: false,
  };
}

interface AppContextType {
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Profile & Onboarding
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  resetAllData: () => void;

  // Nutrition & Meal Plan
  allMeals: Meal[];
  nutritionDays: DayNutritionPlan[];
  selectedDayId: string;
  setSelectedDayId: (id: string) => void;
  swapMeal: (dayId: string, category: MealSlot, newMealId: string) => void;
  swapToCheaper: (dayId: string, category: MealSlot) => void;
  swapToFaster: (dayId: string, category: MealSlot) => void;
  usePantryAlternative: (dayId: string, category: MealSlot) => void;

  // الدولة والعملة
  countryCode: CountryCode;
  money: (n: number) => string;
  setCountry: (countryName: string) => void;

  // اليوم
  todayIndex: number;
  todayDayPlan: DayNutritionPlan | undefined;
  todayWorkout: DayWorkoutSession | null;
  nextWorkout: DayWorkoutSession | null;

  // Shopping & Budget
  shoppingList: ShoppingItem[];
  toggleShoppingItem: (id: string) => void;
  updateActualPrice: (id: string, price: number) => void;
  togglePantryItem: (id: string) => void;
  totalEstimatedGroceries: number;
  totalActualGroceries: number;
  remainingBudget: number;
  overBudget: number;

  // Workout Program
  workoutSessions: DayWorkoutSession[];
  activeWorkoutSession: DayWorkoutSession | null;
  isLiveWorkoutModalOpen: boolean;
  setIsLiveWorkoutModalOpen: (open: boolean) => void;
  startLiveWorkout: (sessionId?: string) => void;
  closeLiveWorkout: () => void;

  // Live Workout Progress & Timer
  currentExerciseIndex: number;
  setCurrentExerciseIndex: (idx: number) => void;
  currentSetIndex: number;
  isResting: boolean;
  restTimeRemaining: number;
  timerActive: boolean;
  audioMode: 'full_guidance' | 'essential_beeps' | 'silent_visual';
  setAudioMode: (mode: 'full_guidance' | 'essential_beeps' | 'silent_visual') => void;
  isExpressWorkout: boolean;
  toggleExpressWorkout: () => void;
  workoutLocation: LocationPreference;
  setWorkoutLocation: (loc: LocationPreference) => void;
  setWorkoutDays: (days: number) => void;
  finishCurrentSet: (weight: number, reps: number, difficulty: 'easy' | 'moderate' | 'hard' | 'pain') => void;
  skipRestTimer: () => void;
  adjustRestTimer: (deltaSeconds: number) => void;
  swapCurrentExercise: (newExerciseId: string) => void;
  completeWorkout: () => void;
  workoutPainAlert: boolean;
  clearPainAlert: () => void;

  // Exercise Library
  exerciseLibrary: ExerciseItem[];
  selectedExercise: ExerciseItem | null;
  setSelectedExercise: (ex: ExerciseItem | null) => void;

  // AI Assistant Chat
  chatMessages: ChatMessage[];
  isChatDrawerOpen: boolean;
  setIsChatDrawerOpen: (open: boolean) => void;
  sendChatMessage: (content: string) => Promise<void>;
  applyActionProposal: (action: any) => void;
  isChatLoading: boolean;

  // Reviews & Feedback
  weeklyReviews: WeeklyReview[];
  submitWeeklyReview: (review: Omit<WeeklyReview, 'date'>) => void;

  // Admin View
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;

  // الإشعارات
  notifications: AppNotification[];
  unreadCount: number;
  notify: (kind: AppNotification['kind'], title: string, body: string) => void;
  markAllNotificationsRead: () => void;
  completeOnboarding: (profile: UserProfile) => void;

  // Account & sync
  user: AuthUser;
  setUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
  saveStatus: SaveStatus;
  lastSavedAt: number | null;
  exportData: () => SavedAppData;
}

const AppContext = createContext<AppContextType | null>(null);

interface AppProviderProps {
  children: React.ReactNode;
  user: AuthUser;
  initialData: Partial<SavedAppData> | null;
  initialSavedAt: number | null;
  onUserChange: (user: AuthUser) => void;
  onLoggedOut: () => void;
}

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  user,
  initialData,
  initialSavedAt,
  onUserChange,
  onLoggedOut,
}) => {
  // 1. Navigation state
  const [activeTab, setActiveTab] = useState<string>('today');

  // 2. User Profile state
  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    initialData?.userProfile ? migrateProfile(initialData.userProfile) : newUserProfile(user.name)
  );
  const countryCode: CountryCode = countryByName(userProfile.country).code;
  const money = useCallback((n: number) => formatMoney(n, countryCode), [countryCode]);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => initialData === null);

  // 3. Meals & Nutrition Days
  const allMeals: Meal[] = useMemo(() => mealsFor(countryCode), [countryCode]);
  const [nutritionDays, setNutritionDays] = useState<DayNutritionPlan[]>(() =>
    refreshPlan(initialData?.nutritionDays, countryCode)
  );
  const todayIndex = new Date().getDay();
  const [selectedDayId, setSelectedDayId] = useState<string>(() => defaultWeekPlan('QA')[todayIndex].dayId);

  // عند تغيير الدولة: نفس الوجبات بأسعار الدولة الجديدة
  const countryRef = useRef(countryCode);
  useEffect(() => {
    if (countryRef.current === countryCode) return;
    countryRef.current = countryCode;
    setNutritionDays((prev) => refreshPlan(prev, countryCode));
    setShoppingStatus((prev) =>
      Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, { ...v, actualPrice: undefined }]))
    );
  }, [countryCode]);

  // 4. قائمة المشتريات: تُبنى من وجبات الأسبوع، وتُحفظ فقط حالة كل صنف
  const [shoppingStatus, setShoppingStatus] = useState<Record<string, ShoppingStatus>>(
    () => initialData?.shoppingStatus ?? {}
  );
  const shoppingList: ShoppingItem[] = useMemo(
    () => buildShoppingList(nutritionDays, userProfile.budgetPersons || 1, shoppingStatus, countryCode),
    [nutritionDays, userProfile.budgetPersons, shoppingStatus, countryCode]
  );

  // 5. برنامج التمرين: يُبنى من مكان التمرين وعدد الأيام، ويحتفظ بما أنجزه المستخدم
  const workoutLocation: LocationPreference = userProfile.location;
  const [workoutSessions, setWorkoutSessions] = useState<DayWorkoutSession[]>(() =>
    mergeWorkoutProgress(
      buildWeeklyWorkouts(userProfile.location, userProfile.workoutDaysPerWeek),
      initialData?.workoutSessions
    )
  );
  useEffect(() => {
    setWorkoutSessions((prev) =>
      mergeWorkoutProgress(buildWeeklyWorkouts(userProfile.location, userProfile.workoutDaysPerWeek), prev)
    );
  }, [userProfile.location, userProfile.workoutDaysPerWeek]);

  const todayWorkout = workoutSessions.find((w) => w.weekdayIndex === todayIndex) ?? null;
  const nextWorkout =
    workoutSessions.find((w) => (w.weekdayIndex ?? 0) > todayIndex) ?? workoutSessions[0] ?? null;
  const todayDayPlan = nutritionDays[todayIndex];

  const [activeWorkoutSession, setActiveWorkoutSession] = useState<DayWorkoutSession | null>(null);
  const [isLiveWorkoutModalOpen, setIsLiveWorkoutModalOpen] = useState<boolean>(false);

  // Live Workout sub-state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [currentSetIndex, setCurrentSetIndex] = useState<number>(0);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState<number>(60);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [restTargetEndTimestamp, setRestTargetEndTimestamp] = useState<number | null>(null);

  const [audioMode, setAudioMode] = useState<'full_guidance' | 'essential_beeps' | 'silent_visual'>(
    () => initialData?.settings?.audioMode ?? 'essential_beeps'
  );
  const [isExpressWorkout, setIsExpressWorkout] = useState<boolean>(false);
  const [workoutPainAlert, setWorkoutPainAlert] = useState<boolean>(false);

  // 6. Exercise Library
  const exerciseLibrary: ExerciseItem[] = ALL_EXERCISES;
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);

  // 7. Chat Assistant
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg_init',
        role: 'assistant',
        content: `أهلاً بك يا ${userProfile.name}! أنا «كابتن على قدّك». خطتك مبنية على ميزانيتك الأسبوعية (${formatMoney(userProfile.foodBudgetWeekly, countryByName(userProfile.country).code)}) ومستواك. اسألني عن أي وجبة أو تمرين.`,
        timestamp: new Date().toLocaleTimeString('ar-u-nu-latn', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // 8. Reviews & Admin
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>(() => initialData?.weeklyReviews ?? []);
  const [isAdminModeRaw, setIsAdminMode] = useState<boolean>(false);
  const isAdminMode = user.isAdmin && isAdminModeRaw;

  // 9. الإشعارات: أرشيف دائم لكل ما يحدث في الحساب
  const [notifications, setNotifications] = useState<AppNotification[]>(() => initialData?.notifications ?? []);
  const [noticeSettings, setNoticeSettings] = useState<{ pricesSeen?: string; lastDailyNotice?: string; weekKey?: string }>(() => ({
    pricesSeen: initialData?.settings?.pricesSeen,
    lastDailyNotice: initialData?.settings?.lastDailyNotice,
    weekKey: initialData?.settings?.weekKey ?? weekStartKey(),
  }));
  const unreadCount = notifications.filter((n) => !n.read).length;

  const notify = useCallback((kind: AppNotification['kind'], title: string, body: string) => {
    setNotifications((prev) =>
      [
        { id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, kind, title, body, createdAt: Date.now(), read: false },
        ...prev,
      ].slice(0, MAX_NOTIFICATIONS)
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => (prev.some((n) => !n.read) ? prev.map((n) => ({ ...n, read: true })) : prev));
  }, []);

  // ترحيب الحساب الجديد، وتنبيه تحديث الأسعار، وخطة اليوم (مرة واحدة يومياً)
  const startupNoticesDone = useRef(false);
  useEffect(() => {
    if (startupNoticesDone.current) return;
    startupNoticesDone.current = true;
    const today = localDateKey();
    const updates: { pricesSeen?: string; lastDailyNotice?: string; weekKey?: string } = {};
    // أسبوع جديد: نبدأ الحصص والمشتريات من الصفر، ونُبقي ما علّمه «عندي في المطبخ»
    const thisWeek = weekStartKey();
    if (initialData && noticeSettings.weekKey !== thisWeek) {
      const doneLastWeek = workoutSessions.filter((w) => w.isCompleted).length;
      setWorkoutSessions(buildWeeklyWorkouts(userProfile.location, userProfile.workoutDaysPerWeek));
      setShoppingStatus((prev) => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, { inPantry: v.inPantry }])));
      notify('info', 'بدأ أسبوع جديد', `أنجزت الأسبوع الماضي ${doneLastWeek} من ${workoutSessions.length} حصص. صفّرنا الحصص وقائمة المشتريات لهذا الأسبوع.`);
      updates.weekKey = thisWeek;
    }
    if (!initialData) {
      notify('success', `أهلاً بك يا ${user.name}`, 'هذا مكان إشعاراتك: خطة كل يوم، وتنبيهات الميزانية، وما تنجزه من حصص. كلها محفوظة هنا.');
      updates.pricesSeen = PRICES_CHECKED_AT;
    } else if (noticeSettings.pricesSeen !== PRICES_CHECKED_AT) {
      notify('budget', 'تحدّثت الأسعار', `أسعار المكونات الآن من متاجر ${userProfile.country} بتاريخ ${PRICES_CHECKED_AT}، وتحدّثت معها تكلفة الوجبات وقائمة المشتريات.`);
      updates.pricesSeen = PRICES_CHECKED_AT;
    }
    if (!initialData) {
      // حساب جديد: خطة اليوم تأتي في إشعار «خطتك جاهزة» بعد تعبئة الملف، لا قبلها
      updates.lastDailyNotice = today;
    } else if (noticeSettings.lastDailyNotice !== today) {
      const t = dayTotals(nutritionDays[todayIndex]);
      const w = workoutSessions.find((x) => x.weekdayIndex === todayIndex);
      notify(
        'workout',
        `خطة اليوم · ${WEEKDAYS[todayIndex]}`,
        (w ? `حصة اليوم: ${w.title} (نحو ${w.estimatedMinutes} دقيقة). ` : 'اليوم يوم راحة من التمرين، والمشي الخفيف مفيد. ') +
          `أكل اليوم: ${t.calories} سعرة و${t.protein} جم بروتين بتكلفة ${formatMoney(t.cost, countryCode)} تقريباً.`
      );
      updates.lastDailyNotice = today;
    }
    setNoticeSettings((prev) => ({ ...prev, ...updates }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // حفظ تلقائي في حساب المستخدم على الخادم (بعد ثانية من آخر تغيير)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(initialSavedAt);

  const exportData = useCallback(
    (): SavedAppData => ({
      version: 2,
      userProfile,
      nutritionDays,
      shoppingStatus,
      workoutSessions,
      weeklyReviews,
      notifications,
      settings: { audioMode, ...noticeSettings },
    }),
    [userProfile, nutritionDays, shoppingStatus, workoutSessions, weeklyReviews, notifications, audioMode, noticeSettings]
  );

  const latestDataRef = useRef<SavedAppData>(exportData());
  const dirtyRef = useRef(false);
  const firstRenderRef = useRef(true);

  useEffect(() => {
    latestDataRef.current = exportData();
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      // مستخدم جديد بلا بيانات محفوظة: نحفظ خطته الأولى فوراً
      if (initialData) return;
    }
    dirtyRef.current = true;
    setSaveStatus('saving');
    const timer = window.setTimeout(async () => {
      dirtyRef.current = false;
      try {
        const res = await api.putState(latestDataRef.current as unknown as Record<string, unknown>);
        if (!dirtyRef.current) setSaveStatus('saved');
        setLastSavedAt(res.updatedAt);
      } catch {
        dirtyRef.current = true;
        setSaveStatus('error');
      }
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [exportData, initialData]);

  // إذا أُغلقت الصفحة قبل الحفظ، نرسل آخر نسخة
  useEffect(() => {
    const flush = () => {
      if (dirtyRef.current) {
        api.putState(latestDataRef.current as unknown as Record<string, unknown>, true).catch(() => {});
        dirtyRef.current = false;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const logout = useCallback(async () => {
    if (dirtyRef.current) {
      try {
        await api.putState(latestDataRef.current as unknown as Record<string, unknown>);
      } catch {
        // نكمل الخروج
      }
    }
    try {
      await api.logout();
    } finally {
      onLoggedOut();
    }
  }, [onLoggedOut]);

  // Profile update
  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  // تبديل وجبة: قائمة المشتريات والميزانية تتحدث تلقائياً لأنها مبنية من الخطة
  const swapMeal = useCallback((dayId: string, category: MealSlot, newMealId: string) => {
    const targetMeal = allMeals.find((m) => m.id === newMealId);
    if (!targetMeal) return;
    const day = nutritionDays.find((d) => d.dayId === dayId);
    const oldMeal = day?.meals[category];
    if (oldMeal?.id === newMealId) return;

    setNutritionDays((prev) =>
      prev.map((d) => (d.dayId === dayId ? { ...d, meals: { ...d.meals, [category]: targetMeal } } : d))
    );

    if (day && oldMeal) {
      const diff = targetMeal.estimatedPortionCost - oldMeal.estimatedPortionCost;
      const diffText =
        Math.abs(diff) < 0.0005 ? 'بنفس التكلفة تقريباً' : diff < 0 ? `ووفّرت ${formatMoney(-diff, countryCode)}` : `بزيادة ${formatMoney(diff, countryCode)}`;
      notify('meal', `تبديل ${SLOT_LABELS[category]} · ${day.dayName}`, `«${targetMeal.arabicName}» بدلاً من «${oldMeal.arabicName}»، ${diffText}. تحدّثت قائمة المشتريات.`);
    }
  }, [allMeals, nutritionDays, notify, countryCode]);

  const swapToCheaper = useCallback((dayId: string, category: MealSlot) => {
    const currentMeal = nutritionDays.find((d) => d.dayId === dayId)?.meals[category];
    if (currentMeal?.cheaperAlternativeId) swapMeal(dayId, category, currentMeal.cheaperAlternativeId);
  }, [nutritionDays, swapMeal]);

  const swapToFaster = useCallback((dayId: string, category: MealSlot) => {
    const currentMeal = nutritionDays.find((d) => d.dayId === dayId)?.meals[category];
    if (currentMeal?.fasterAlternativeId) swapMeal(dayId, category, currentMeal.fasterAlternativeId);
  }, [nutritionDays, swapMeal]);

  /** وجبة تعتمد أكثر على مؤن البيت (عدس، أرز، شوفان، بيض…) بدل الطازج. */
  const usePantryAlternative = useCallback((dayId: string, category: MealSlot) => {
    const currentMeal = nutritionDays.find((d) => d.dayId === dayId)?.meals[category];
    const id = currentMeal ? pantryFriendlyMealId(currentMeal.category, currentMeal.id) : undefined;
    if (id) swapMeal(dayId, category, id);
  }, [nutritionDays, swapMeal]);

  // Shopping list toggles & calculations
  const patchStatus = useCallback((id: string, patch: (st: ShoppingStatus) => ShoppingStatus) => {
    setShoppingStatus((prev) => ({ ...prev, [id]: patch(prev[id] || {}) }));
  }, []);

  const toggleShoppingItem = useCallback(
    (id: string) => patchStatus(id, (st) => ({ ...st, isPurchased: !st.isPurchased })),
    [patchStatus]
  );

  const updateActualPrice = useCallback(
    (id: string, price: number) =>
      patchStatus(id, (st) => ({ ...st, actualPrice: Number.isFinite(price) && price >= 0 ? price : undefined })),
    [patchStatus]
  );

  const togglePantryItem = useCallback(
    (id: string) => patchStatus(id, (st) => ({ ...st, inPantry: !st.inPantry })),
    [patchStatus]
  );

  const totalEstimatedGroceries = shoppingList
    .filter((i) => !i.inPantry)
    .reduce((acc, curr) => acc + curr.estimatedPrice, 0);

  const totalActualGroceries = shoppingList
    .filter((i) => !i.inPantry)
    .reduce((acc, curr) => acc + (curr.actualPrice !== undefined ? curr.actualPrice : curr.estimatedPrice), 0);

  const remainingBudget = Math.max(0, userProfile.foodBudgetWeekly - totalActualGroceries);
  const overBudget = Math.max(0, totalActualGroceries - userProfile.foodBudgetWeekly);

  // تنبيه عند تجاوز الميزانية، وعند إكمال المشتريات (مرة واحدة لكل تغيّر في الحالة)
  const overRef = useRef(overBudget > 0);
  useEffect(() => {
    const isOver = overBudget > 0;
    if (isOver && !overRef.current) {
      notify('budget', 'تجاوزت ميزانية الأسبوع', `مشترياتك المتوقعة أكثر من ميزانيتك بـ ${formatMoney(overBudget, countryCode)}. جرّب زر «أرخص» في صفحة الغذاء، أو علّم ما عندك في المطبخ.`);
    }
    overRef.current = isOver;
  }, [overBudget, notify, countryCode]);

  const allBought = shoppingList.length > 0 && shoppingList.every((i) => i.isPurchased || i.inPantry);
  const boughtRef = useRef(allBought);
  useEffect(() => {
    if (allBought && !boughtRef.current) {
      notify('success', 'أكملت مشتريات الأسبوع', `المصروف: ${formatMoney(totalActualGroceries, countryCode)} من ميزانية ${formatMoney(userProfile.foodBudgetWeekly, countryCode)}.`);
    }
    boughtRef.current = allBought;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allBought]);

  const setCountry = useCallback((countryName: string) => {
    const c = countryByName(countryName);
    if (c.name === userProfile.country) return;
    const budget = suggestedWeeklyBudget(c.code, userProfile.budgetPersons || 1);
    setUserProfile((prev) => ({ ...prev, country: c.name, currency: c.currency, foodBudgetWeekly: budget }));
    notify('budget', `الأسعار الآن من ${c.name}`, `تحدّثت أسعار الوجبات وقائمة المشتريات بعملة ${c.currency}، واقترحنا ميزانية أسبوعية ${formatMoney(budget, c.code)} يمكنك تعديلها من الإعدادات.`);
  }, [userProfile.country, userProfile.budgetPersons, notify]);

  // Live Workout Management
  const startLiveWorkout = useCallback((sessionId?: string) => {
    const session = sessionId
      ? workoutSessions.find((s) => s.id === sessionId)
      : workoutSessions[0];
    if (session) {
      setActiveWorkoutSession(JSON.parse(JSON.stringify(session)));
      setCurrentExerciseIndex(0);
      setCurrentSetIndex(0);
      setIsResting(false);
      setTimerActive(false);
      setIsLiveWorkoutModalOpen(true);
      setWorkoutPainAlert(false);
      audioCoach.speak(`بداية موفقة يا ${userProfile.name}! التمرين الأول هو ${exerciseLibrary.find(e => e.id === session.exercises[0]?.exerciseId)?.arabicName || ''}. خذ وقتك وركّز على الأداء.`, audioMode);
    }
  }, [workoutSessions, userProfile.name, exerciseLibrary, audioMode]);

  const closeLiveWorkout = useCallback(() => {
    setIsLiveWorkoutModalOpen(false);
    setIsResting(false);
    setTimerActive(false);
    setRestTargetEndTimestamp(null);
  }, []);

  const toggleExpressWorkout = useCallback(() => {
    setIsExpressWorkout((prev) => !prev);
  }, []);

  const setWorkoutLocation = useCallback((loc: LocationPreference) => {
    if (loc === userProfile.location) return;
    setUserProfile((prev) => ({ ...prev, location: loc }));
    notify('workout', `برنامجك الآن: ${LOCATION_LABELS[loc]}`, `بنينا لك ${userProfile.workoutDaysPerWeek} حصص أسبوعياً مناسبة لـ${LOCATION_LABELS[loc]}، ووزّعناها على أيام الأسبوع مع أيام راحة.`);
  }, [userProfile.location, userProfile.workoutDaysPerWeek, notify]);

  const setWorkoutDays = useCallback((days: number) => {
    const d = Math.min(6, Math.max(2, days));
    if (d === userProfile.workoutDaysPerWeek) return;
    setUserProfile((prev) => ({ ...prev, workoutDaysPerWeek: d }));
    notify('workout', `${d} أيام تمرين أسبوعياً`, `تحدّث جدول تمرينك في صفحة التمارين.`);
  }, [userProfile.workoutDaysPerWeek, notify]);

  // Set completion in live workout
  const finishCurrentSet = useCallback((weight: number, reps: number, difficulty: 'easy' | 'moderate' | 'hard' | 'pain') => {
    if (!activeWorkoutSession) return;

    if (difficulty === 'pain') {
      setWorkoutPainAlert(true);
      notify('warning', 'سجّلت ألماً أثناء التمرين', 'إذا كان الألم حاداً أو استمر، توقف عن التمرين وراجع طبيباً. يمكنك استبدال التمرين ببديل أخف من دليل الأجهزة.');
      audioCoach.speak('تنبيه أمان: توقف فوراً عند الشعور بألم غير طبيعي، وافحص المفصل أو استشر طبيباً.', audioMode);
    }

    const currentEx = activeWorkoutSession.exercises[currentExerciseIndex];
    if (!currentEx) return;

    const updatedSets = currentEx.sets.map((s, idx) => {
      if (idx === currentSetIndex) {
        return {
          ...s,
          completed: true,
          weightKg: weight,
          actualReps: reps,
          difficulty,
        };
      }
      return s;
    });

    currentEx.sets = updatedSets;

    // Check if more sets remain in this exercise
    if (currentSetIndex + 1 < currentEx.sets.length) {
      setCurrentSetIndex((prev) => prev + 1);
      // Start rest timer
      const restDuration = currentEx.restSeconds || 60;
      setRestTimeRemaining(restDuration);
      setIsResting(true);
      setTimerActive(true);
      setRestTargetEndTimestamp(Date.now() + restDuration * 1000);
      audioCoach.playRestStart();
      audioCoach.speak(`أحسنت! أنهيت المجموعة. وقت راحة لمدة ${restDuration} ثانية.`, audioMode);
    } else {
      // Exercise finished!
      if (currentExerciseIndex + 1 < activeWorkoutSession.exercises.length) {
        const nextExPlan = activeWorkoutSession.exercises[currentExerciseIndex + 1];
        const nextExData = exerciseLibrary.find((e) => e.id === nextExPlan.exerciseId);
        setCurrentExerciseIndex((prev) => prev + 1);
        setCurrentSetIndex(0);
        // Inter-exercise rest
        const transitionRest = 90;
        setRestTimeRemaining(transitionRest);
        setIsResting(true);
        setTimerActive(true);
        setRestTargetEndTimestamp(Date.now() + transitionRest * 1000);
        audioCoach.playRestStart();
        audioCoach.speak(`ممتاز! انتهيت من التمرين الحالي. استرح 90 ثانية، واستعد للتمرين القادم: ${nextExData?.arabicName || ''}.`, audioMode);
      } else {
        // Complete whole session
        setIsResting(false);
        setTimerActive(false);
        activeWorkoutSession.isCompleted = true;
        audioCoach.playRestComplete();
        audioCoach.speak('ألف مبروك! أنهيت حصتك الرياضية بنجاح واقتدار. استمر في هذا الالتزام!', audioMode);
      }
    }
  }, [activeWorkoutSession, currentExerciseIndex, currentSetIndex, audioMode, exerciseLibrary, notify]);

  // Robust Wall-clock timer loop using Date.now() so background tabs never desync
  useEffect(() => {
    if (!timerActive || !restTargetEndTimestamp || !isResting) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remainingMs = restTargetEndTimestamp - now;
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

      setRestTimeRemaining(remainingSec);

      // 3-2-1 countdown audio cues
      if (remainingSec === 3 || remainingSec === 2 || remainingSec === 1) {
        audioCoach.playCountdownTick();
      }

      if (remainingSec <= 0) {
        clearInterval(interval);
        setIsResting(false);
        setTimerActive(false);
        setRestTargetEndTimestamp(null);
        audioCoach.playRestComplete();
        audioCoach.speak('انتهت فترة الراحة، استعد للمجموعة القادمة!', audioMode);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [timerActive, restTargetEndTimestamp, isResting, audioMode]);

  const skipRestTimer = useCallback(() => {
    setIsResting(false);
    setTimerActive(false);
    setRestTargetEndTimestamp(null);
    setRestTimeRemaining(0);
    audioCoach.speak('تم تخطي الراحة، بالتوفيق في المجموعة القادمة!', audioMode);
  }, [audioMode]);

  const adjustRestTimer = useCallback((deltaSeconds: number) => {
    setRestTargetEndTimestamp((prev) => {
      if (!prev) return Date.now() + Math.max(10, deltaSeconds * 1000);
      const newTimestamp = prev + deltaSeconds * 1000;
      setRestTimeRemaining(Math.max(5, Math.ceil((newTimestamp - Date.now()) / 1000)));
      return newTimestamp;
    });
  }, []);

  const swapCurrentExercise = useCallback((newExerciseId: string) => {
    if (!activeWorkoutSession) return;
    const currentEx = activeWorkoutSession.exercises[currentExerciseIndex];
    if (currentEx) {
      currentEx.exerciseId = newExerciseId;
      setActiveWorkoutSession({ ...activeWorkoutSession });
    }
  }, [activeWorkoutSession, currentExerciseIndex]);

  const completeWorkout = useCallback(() => {
    if (activeWorkoutSession) {
      setWorkoutSessions((prev) =>
        prev.map((s) => (s.id === activeWorkoutSession.id ? { ...activeWorkoutSession, isCompleted: true } : s))
      );
      const done = workoutSessions.filter((s) => s.isCompleted || s.id === activeWorkoutSession.id).length;
      notify('success', `أنهيت حصة: ${activeWorkoutSession.title}`, `أحسنت! أنجزت ${done} من ${workoutSessions.length} حصص هذا الأسبوع.`);
    }
    closeLiveWorkout();
  }, [activeWorkoutSession, closeLiveWorkout, workoutSessions, notify]);

  const clearPainAlert = useCallback(() => {
    setWorkoutPainAlert(false);
  }, []);

  // AI Assistant Chat action
  const sendChatMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString('ar-u-nu-latn', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          userContext: {
            name: userProfile.name,
            goal: userProfile.goal,
            budget: formatMoney(userProfile.foodBudgetWeekly, countryCode),
            country: userProfile.country,
            workoutLocation: LOCATION_LABELS[userProfile.location],
            injuries: userProfile.injuries,
            experience: userProfile.experienceLevel,
            currentExercise: activeWorkoutSession?.exercises[currentExerciseIndex]?.exerciseId,
          },
        }),
      });

      const data = await response.json();

      let actionProposal = undefined;
      // If user asks about swapping a meal to cheaper, offer direct action button
      const currentLunch = nutritionDays.find((d) => d.dayId === selectedDayId)?.meals.lunch;
      const cheaperLunch = currentLunch?.cheaperAlternativeId ? allMeals.find((m) => m.id === currentLunch.cheaperAlternativeId) : undefined;
      if ((content.includes('أرخص') || content.includes('بديل للغداء') || content.includes('ميزانية')) && currentLunch && cheaperLunch) {
        actionProposal = {
          type: 'swap_meal' as const,
          title: `استبدال الغداء بـ«${cheaperLunch.arabicName}»`,
          description: `يوفّر ${formatMoney(currentLunch.estimatedPortionCost - cheaperLunch.estimatedPortionCost, countryCode)} في هذه الوجبة، وفيه ${cheaperLunch.protein} جم بروتين.`,
          data: { dayId: selectedDayId, category: 'lunch', newMealId: cheaperLunch.id },
        };
      } else if (content.includes('ركبتي') || content.includes('بديل للسكوات') || content.includes('بديل للرجل')) {
        actionProposal = {
          type: 'swap_exercise' as const,
          title: 'استبدال التمرين الحالي بالجلوس على الحائط',
          description: 'تمرين ثابت للأفخاذ بحمل أخف على الركبة، وتتحكم أنت بالزاوية.',
          data: { newExerciseId: 'ex_wall_sit' },
        };
      }

      const botMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'أنا في خدمتك لمساعدتك في التغذية والتمارين وفق ميزانيتك.',
        timestamp: new Date().toLocaleTimeString('ar-u-nu-latn', { hour: '2-digit', minute: '2-digit' }),
        actionProposal,
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: 'أنا معك! لتوفير الميزانية، ركّز على البيض والعدس والتونة والخضار الموسمي، ولتجنب إجهاد المفاصل تحكم بسرعة التمرين وتدرج بالأوزان.',
        timestamp: new Date().toLocaleTimeString('ar-u-nu-latn', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatMessages, userProfile, activeWorkoutSession, currentExerciseIndex, selectedDayId, nutritionDays, allMeals, countryCode]);

  const applyActionProposal = useCallback((proposal: any) => {
    if (proposal.type === 'swap_meal' && proposal.data) {
      swapMeal(proposal.data.dayId, proposal.data.category, proposal.data.newMealId);
      audioCoach.speak('تم تطبيق استبدال الوجبة وتحديث قائمة المشتريات والميزانية بنجاح!', 'essential_beeps');
    } else if (proposal.type === 'swap_exercise' && proposal.data) {
      swapCurrentExercise(proposal.data.newExerciseId);
      audioCoach.speak('تم استبدال التمرين الحالي بنجاح!', 'essential_beeps');
    }
  }, [swapMeal, swapCurrentExercise]);

  const submitWeeklyReview = useCallback((review: Omit<WeeklyReview, 'date'>) => {
    const fullReview: WeeklyReview = {
      ...review,
      date: new Date().toISOString().split('T')[0],
    };
    setWeeklyReviews((prev) => [fullReview, ...prev]);
  }, []);

  const completeOnboarding = useCallback((profile: UserProfile) => {
    const p = migrateProfile({ ...profile, isCompleted: true });
    const wasCompleted = userProfile.isCompleted;
    setUserProfile(p);
    const c = countryByName(p.country);
    notify(
      'success',
      wasCompleted ? 'حفظنا تعديلات ملفك' : 'خطتك جاهزة',
      `أكل أسبوعي بأسعار ${c.name} وميزانية ${formatMoney(p.foodBudgetWeekly, c.code)}، و${p.workoutDaysPerWeek} حصص تمرين (${LOCATION_LABELS[p.location]}) أسبوعياً. ستجد هنا كل صباح خطة يومك.`
    );
  }, [userProfile.isCompleted, notify]);

  const resetAllData = useCallback(() => {
    const fresh = newUserProfile(user.name);
    const keepCountry = countryByName(userProfile.country);
    const profile = { ...fresh, country: keepCountry.name, currency: keepCountry.currency, foodBudgetWeekly: suggestedWeeklyBudget(keepCountry.code) };
    setUserProfile(profile);
    setNutritionDays(defaultWeekPlan(keepCountry.code));
    setShoppingStatus({});
    setWorkoutSessions(buildWeeklyWorkouts(profile.location, profile.workoutDaysPerWeek));
    setWeeklyReviews([]);
    notify('info', 'بدأت من جديد', 'مسحنا خطتك ومشترياتك وتقدّمك، وبقيت إشعاراتك السابقة محفوظة هنا.');
    setActiveTab('today');
    setIsOnboardingOpen(true);
  }, [user.name, userProfile.country, notify]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        userProfile,
        updateUserProfile,
        isOnboardingOpen,
        setIsOnboardingOpen,
        resetAllData,

        allMeals,
        nutritionDays,
        selectedDayId,
        setSelectedDayId,
        swapMeal,
        swapToCheaper,
        swapToFaster,
        usePantryAlternative,

        countryCode,
        money,
        setCountry,
        todayIndex,
        todayDayPlan,
        todayWorkout,
        nextWorkout,

        shoppingList,
        toggleShoppingItem,
        updateActualPrice,
        togglePantryItem,
        totalEstimatedGroceries,
        totalActualGroceries,
        remainingBudget,
        overBudget,

        workoutSessions,
        activeWorkoutSession,
        isLiveWorkoutModalOpen,
        setIsLiveWorkoutModalOpen,
        startLiveWorkout,
        closeLiveWorkout,

        currentExerciseIndex,
        setCurrentExerciseIndex,
        currentSetIndex,
        isResting,
        restTimeRemaining,
        timerActive,
        audioMode,
        setAudioMode,
        isExpressWorkout,
        toggleExpressWorkout,
        workoutLocation,
        setWorkoutLocation,
        setWorkoutDays,
        finishCurrentSet,
        skipRestTimer,
        adjustRestTimer,
        swapCurrentExercise,
        completeWorkout,
        workoutPainAlert,
        clearPainAlert,

        exerciseLibrary,
        selectedExercise,
        setSelectedExercise,

        chatMessages,
        isChatDrawerOpen,
        setIsChatDrawerOpen,
        sendChatMessage,
        applyActionProposal,
        isChatLoading,

        weeklyReviews,
        submitWeeklyReview,

        isAdminMode,
        setIsAdminMode,

        notifications,
        unreadCount,
        notify,
        markAllNotificationsRead,
        completeOnboarding,

        user,
        setUser: onUserChange,
        logout,
        saveStatus,
        lastSavedAt,
        exportData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
