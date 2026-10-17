import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  Meal,
  DayNutritionPlan,
  DayWorkoutSession,
  ShoppingItem,
  ExerciseItem,
  ChatMessage,
  WeeklyReview,
} from '../types';
import {
  DEFAULT_USER_PROFILE,
  INITIAL_MEALS,
  INITIAL_NUTRITION_DAYS,
  INITIAL_WORKOUT_SESSIONS,
  INITIAL_SHOPPING_LIST,
  INITIAL_EXERCISES,
} from '../data/initialData';
import { audioCoach } from '../services/audioCoach';

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
  swapMeal: (dayId: string, category: 'breakfast' | 'lunch' | 'dinner', newMealId: string) => void;
  swapToCheaper: (dayId: string, category: 'breakfast' | 'lunch' | 'dinner') => void;
  swapToFaster: (dayId: string, category: 'breakfast' | 'lunch' | 'dinner') => void;
  usePantryAlternative: (dayId: string, category: 'breakfast' | 'lunch' | 'dinner') => void;

  // Shopping & Budget
  shoppingList: ShoppingItem[];
  toggleShoppingItem: (id: string) => void;
  updateActualPrice: (id: string, price: number) => void;
  togglePantryItem: (id: string) => void;
  totalEstimatedGroceries: number;
  totalActualGroceries: number;
  remainingBudget: number;

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
  workoutLocation: 'gym' | 'home';
  toggleWorkoutLocation: () => void;
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
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Navigation state
  const [activeTab, setActiveTab] = useState<string>('today');

  // 2. User Profile state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('alaqaddak_user_profile');
      return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  // 3. Meals & Nutrition Days
  const [allMeals] = useState<Meal[]>(INITIAL_MEALS);
  const [nutritionDays, setNutritionDays] = useState<DayNutritionPlan[]>(() => {
    try {
      const saved = localStorage.getItem('alaqaddak_nutrition_days');
      return saved ? JSON.parse(saved) : INITIAL_NUTRITION_DAYS;
    } catch {
      return INITIAL_NUTRITION_DAYS;
    }
  });
  const [selectedDayId, setSelectedDayId] = useState<string>('day_sun');

  // 4. Shopping list state
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem('alaqaddak_shopping_list');
      return saved ? JSON.parse(saved) : INITIAL_SHOPPING_LIST;
    } catch {
      return INITIAL_SHOPPING_LIST;
    }
  });

  // 5. Workout Program
  const [workoutSessions, setWorkoutSessions] = useState<DayWorkoutSession[]>(() => {
    try {
      const saved = localStorage.getItem('alaqaddak_workouts');
      return saved ? JSON.parse(saved) : INITIAL_WORKOUT_SESSIONS;
    } catch {
      return INITIAL_WORKOUT_SESSIONS;
    }
  });

  const [activeWorkoutSession, setActiveWorkoutSession] = useState<DayWorkoutSession | null>(null);
  const [isLiveWorkoutModalOpen, setIsLiveWorkoutModalOpen] = useState<boolean>(false);

  // Live Workout sub-state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [currentSetIndex, setCurrentSetIndex] = useState<number>(0);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState<number>(60);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [restTargetEndTimestamp, setRestTargetEndTimestamp] = useState<number | null>(null);

  const [audioMode, setAudioMode] = useState<'full_guidance' | 'essential_beeps' | 'silent_visual'>('essential_beeps');
  const [isExpressWorkout, setIsExpressWorkout] = useState<boolean>(false);
  const [workoutLocation, setWorkoutLocation] = useState<'gym' | 'home'>('gym');
  const [workoutPainAlert, setWorkoutPainAlert] = useState<boolean>(false);

  // 6. Exercise Library
  const [exerciseLibrary] = useState<ExerciseItem[]>(INITIAL_EXERCISES);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);

  // 7. Chat Assistant
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg_init',
        role: 'assistant',
        content: `أهلاً بك يا ${userProfile.name}! أنا «كابتن على قدّك». خطتك جاهزة لتناسب ميزانيتك الأسبوعية (${userProfile.foodBudgetWeekly} ${userProfile.currency}) ومستواك الرياضي. هل لديك أي استفسار حول وجبات اليوم أو تمارين الصالة؟`,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // 8. Reviews & Admin
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>(() => {
    try {
      const saved = localStorage.getItem('alaqaddak_reviews');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('alaqaddak_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('alaqaddak_nutrition_days', JSON.stringify(nutritionDays));
  }, [nutritionDays]);

  useEffect(() => {
    localStorage.setItem('alaqaddak_shopping_list', JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem('alaqaddak_workouts', JSON.stringify(workoutSessions));
  }, [workoutSessions]);

  useEffect(() => {
    localStorage.setItem('alaqaddak_reviews', JSON.stringify(weeklyReviews));
  }, [weeklyReviews]);

  // Profile update
  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  // Meal swapping helper
  const swapMeal = useCallback((dayId: string, category: 'breakfast' | 'lunch' | 'dinner', newMealId: string) => {
    const targetMeal = allMeals.find((m) => m.id === newMealId);
    if (!targetMeal) return;

    setNutritionDays((prev) =>
      prev.map((d) => {
        if (d.dayId !== dayId) return d;
        return {
          ...d,
          meals: {
            ...d.meals,
            [category]: targetMeal,
          },
        };
      })
    );

    // Dynamic adjustment of shopping list when swapped
    setShoppingList((prev) => {
      return prev.map((item) => {
        if (item.name.includes('تونة') && newMealId === 'meal_lentil_rice_bowl') {
          return { ...item, recipeQty: 'علبتان بدلاً من 4' };
        }
        if (item.name.includes('عدس') && newMealId === 'meal_lentil_rice_bowl') {
          return { ...item, recipeQty: '400 جم للأسبوع (تمت الزيادة)' };
        }
        return item;
      });
    });
  }, [allMeals]);

  const swapToCheaper = useCallback((dayId: string, category: 'breakfast' | 'lunch' | 'dinner') => {
    const currentDay = nutritionDays.find((d) => d.dayId === dayId);
    if (!currentDay) return;
    const currentMeal = currentDay.meals[category];
    if (currentMeal && currentMeal.cheaperAlternativeId) {
      swapMeal(dayId, category, currentMeal.cheaperAlternativeId);
    }
  }, [nutritionDays, swapMeal]);

  const swapToFaster = useCallback((dayId: string, category: 'breakfast' | 'lunch' | 'dinner') => {
    const currentDay = nutritionDays.find((d) => d.dayId === dayId);
    if (!currentDay) return;
    const currentMeal = currentDay.meals[category];
    if (currentMeal && currentMeal.fasterAlternativeId) {
      swapMeal(dayId, category, currentMeal.fasterAlternativeId);
    }
  }, [nutritionDays, swapMeal]);

  const usePantryAlternative = useCallback((dayId: string, category: 'breakfast' | 'lunch' | 'dinner') => {
    // If lunch, swap to Mujadara which relies strictly on home pantry ingredients
    if (category === 'lunch') {
      swapMeal(dayId, category, 'meal_lentil_rice_bowl');
    } else if (category === 'breakfast') {
      swapMeal(dayId, category, 'meal_shakshuka_budget');
    }
  }, [swapMeal]);

  // Shopping list toggles & calculations
  const toggleShoppingItem = useCallback((id: string) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isPurchased: !item.isPurchased } : item))
    );
  }, []);

  const updateActualPrice = useCallback((id: string, price: number) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, actualPrice: price } : item))
    );
  }, []);

  const togglePantryItem = useCallback((id: string) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inPantry: !item.inPantry } : item))
    );
  }, []);

  const totalEstimatedGroceries = shoppingList
    .filter((i) => !i.inPantry)
    .reduce((acc, curr) => acc + curr.estimatedPrice, 0);

  const totalActualGroceries = shoppingList
    .filter((i) => !i.inPantry)
    .reduce((acc, curr) => acc + (curr.actualPrice !== undefined ? curr.actualPrice : curr.estimatedPrice), 0);

  const remainingBudget = Math.max(0, userProfile.foodBudgetWeekly - totalActualGroceries);

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

  const toggleWorkoutLocation = useCallback(() => {
    setWorkoutLocation((prev) => (prev === 'gym' ? 'home' : 'gym'));
  }, []);

  // Set completion in live workout
  const finishCurrentSet = useCallback((weight: number, reps: number, difficulty: 'easy' | 'moderate' | 'hard' | 'pain') => {
    if (!activeWorkoutSession) return;

    if (difficulty === 'pain') {
      setWorkoutPainAlert(true);
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
  }, [activeWorkoutSession, currentExerciseIndex, currentSetIndex, audioMode, exerciseLibrary]);

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
    }
    closeLiveWorkout();
  }, [activeWorkoutSession, closeLiveWorkout]);

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
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
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
            budget: `${userProfile.foodBudgetWeekly} ${userProfile.currency}`,
            injuries: userProfile.injuries,
            experience: userProfile.experienceLevel,
            currentExercise: activeWorkoutSession?.exercises[currentExerciseIndex]?.exerciseId,
          },
        }),
      });

      const data = await response.json();

      let actionProposal = undefined;
      // If user asks about swapping a meal to cheaper, offer direct action button
      if (content.includes('أرخص') || content.includes('بديل للغداء') || content.includes('عدس')) {
        actionProposal = {
          type: 'swap_meal' as const,
          title: 'استبدال الغداء بمجدرة العدس والأرز البني',
          description: 'يوفر 4.0 ر.س لكل وجبة مع ضمان 21 جم بروتين وألياف عالية.',
          data: { dayId: selectedDayId, category: 'lunch', newMealId: 'meal_lentil_rice_bowl' },
        };
      } else if (content.includes('ركبتي') || content.includes('بديل للسكوات') || content.includes('بديل للرجل')) {
        actionProposal = {
          type: 'swap_exercise' as const,
          title: 'استبدال السكوات بتمرين دفع الأرجل الخفيف أو الجلوس على الحائط',
          description: 'يقلل الحمل الميكانيكي على أوتار الركبة بنسبة 40%.',
          data: { newExerciseId: 'ex_leg_press' },
        };
      }

      const botMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'أنا في خدمتك لمساعدتك في التغذية والتمارين وفق ميزانيتك.',
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        actionProposal,
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: 'أنا معك! لتوفير الميزانية، ركّز على البيض والعدس والتونة والخضار الموسمي، ولتجنب إجهاد المفاصل تحكم بسرعة التمرين وتدرج بالأوزان.',
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatMessages, userProfile, activeWorkoutSession, currentExerciseIndex, selectedDayId]);

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

  const resetAllData = useCallback(() => {
    localStorage.clear();
    setUserProfile(DEFAULT_USER_PROFILE);
    setNutritionDays(INITIAL_NUTRITION_DAYS);
    setShoppingList(INITIAL_SHOPPING_LIST);
    setWorkoutSessions(INITIAL_WORKOUT_SESSIONS);
    setWeeklyReviews([]);
  }, []);

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

        shoppingList,
        toggleShoppingItem,
        updateActualPrice,
        togglePantryItem,
        totalEstimatedGroceries,
        totalActualGroceries,
        remainingBudget,

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
        toggleWorkoutLocation,
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
