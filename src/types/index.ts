export type GoalType = 'fat_loss' | 'muscle_gain' | 'fitness' | 'maintenance';
export type ExperienceLevel = 'beginner' | 'returning' | 'intermediate';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';
export type LocationPreference = 'gym' | 'home';

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female';
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number;
  goal: GoalType;
  experienceLevel: ExperienceLevel;
  activityLevel: ActivityLevel;
  workoutDaysPerWeek: number;
  sessionDurationMin: number;
  location: LocationPreference;
  availableEquipment: string[];
  injuries: string[];
  country: string;
  currency: string;
  foodBudgetWeekly: number;
  budgetPeriod: 'weekly' | 'monthly';
  budgetPersons: number;
  budgetScope: 'all_meals' | 'specific_meals';
  dietaryPreferences: string[];
  allergies: string[];
  dislikedFoods: string[];
  cookingTimeMinutes: number;
  mealPrepAbility: boolean;
  pantryItems: string[];
  isCompleted: boolean;
}

export interface MealIngredient {
  name: string;
  portionQty: string;
  packName: string;
  packPrice: number;
  aisle: 'خضار وفواكه' | 'لحوم ودواجن وأسماك' | 'ألبان وبيض' | 'بقوليات وحبوب' | 'بهارات ومؤن';
}

export interface Meal {
  id: string;
  name: string;
  arabicName: string;
  category: 'فطور' | 'غداء' | 'عشاء' | 'سناك';
  image: string;
  prepTimeMin: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  estimatedPortionCost: number;
  packEstimatedCost: number;
  ingredients: MealIngredient[];
  recipeSteps: string[];
  tags: string[];
  cheaperAlternativeId?: string;
  fasterAlternativeId?: string;
  swapOptionIds?: string[];
  pantryNotes?: string;
}

export interface DayNutritionPlan {
  dayId: string;
  dayName: string;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snack?: Meal;
  };
}

export interface ShoppingItem {
  id: string;
  name: string;
  aisle: 'خضار وفواكه' | 'لحوم ودواجن وأسماك' | 'ألبان وبيض' | 'بقوليات وحبوب' | 'بهارات ومؤن';
  recipeQty: string;
  packToBuy: string;
  estimatedPrice: number;
  actualPrice?: number;
  isPurchased: boolean;
  inPantry: boolean;
  cheaperTip?: string;
  sourceNote?: string;
}

export interface ExerciseSet {
  setNumber: number;
  targetReps?: number;
  targetDurationSec?: number;
  weightKg?: number;
  actualReps?: number;
  completed: boolean;
  difficulty?: 'easy' | 'moderate' | 'hard' | 'pain';
}

export interface ExerciseItem {
  id: string;
  arabicName: string;
  commonGymName: string;
  targetMuscleGroup: 'صدر' | 'ظهر' | 'أرجل' | 'أكتاف' | 'ذراعين' | 'بطن';
  secondaryMuscles: string[];
  equipmentType: 'أجهزة' | 'دمبل' | 'بار' | 'وزن الجسم' | 'حبال مقاومة';
  image: string;
  machineAdjustmentGuide: string;
  breathingGuide: string;
  commonMistakes: string[];
  formTips: string[];
  alternativeExerciseIds: string[];
  isHomeFriendly: boolean;
}

export interface WorkoutExercisePlan {
  exerciseId: string;
  sets: ExerciseSet[];
  restSeconds: number;
  notes?: string;
}

export interface DayWorkoutSession {
  id: string;
  dayName: string;
  title: string;
  focus: string;
  estimatedMinutes: number;
  location: LocationPreference;
  warmup: { name: string; durationSec: number; notes: string }[];
  exercises: WorkoutExercisePlan[];
  cooldown: { name: string; durationSec: number; notes: string }[];
  isCompleted?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionProposal?: {
    type: 'swap_meal' | 'swap_exercise' | 'adjust_budget' | 'quick_workout';
    title: string;
    description: string;
    data: any;
  };
}

export interface WeeklyReview {
  date: string;
  workoutRating: number;
  nutritionRating: number;
  notes?: string;
  difficultyFeedback?: string;
  tasteFeedback?: string;
  budgetFeedback?: string;
}
