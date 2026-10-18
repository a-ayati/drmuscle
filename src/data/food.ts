/**
 * أسعار المكونات في كل دولة، والوجبات المبنية عليها.
 *
 * كل سعر هنا منقول من موقع متجر في الدولة نفسها (لولو أو كارفور) وقت التحديث، لعبوة محددة.
 * تكلفة كل وجبة تُحسب من هذه الأسعار تلقائياً: (الكمية المستعملة ÷ حجم العبوة) × سعر العبوة.
 * وقائمة المشتريات تُبنى من وجبات الأسبوع الفعلية، فإذا بدّل المستخدم وجبة تغيّرت القائمة والميزانية.
 *
 * لتحديث الأسعار: عدّل price و checkedAt هنا فقط، وكل الأرقام في التطبيق تتحدث وحدها.
 */
import type { Meal, MealIngredient, ShoppingItem, DayNutritionPlan } from '../types';

export const PRICES_CHECKED_AT = '2026-10-18';

type Aisle = ShoppingItem['aisle'];

export type CountryCode = 'QA' | 'OM';

export const COUNTRIES: { code: CountryCode; name: string; currency: string; decimals: number }[] = [
  { code: 'QA', name: 'قطر', currency: 'ر.ق', decimals: 2 },
  { code: 'OM', name: 'عُمان', currency: 'ر.ع', decimals: 3 },
];

export function countryByName(name: string | undefined) {
  return COUNTRIES.find((c) => c.name === name) ?? COUNTRIES[0];
}

/** المكوّن كما يُستعمل في الوصفات، بلا سعر. */
interface IngredientBase {
  id: string;
  name: string;
  aisle: Aisle;
  /** الوحدة الأساسية التي تُقاس بها الكمية في الوجبات */
  unit: 'جم' | 'حبة' | 'علبة' | 'رغيف';
  /**
   * مؤن تدوم أسابيع (أرز، عدس، شوفان، بيض، دجاج مجمد…): تُحسب في ميزانية الأسبوع بقدر ما يُستهلك منها،
   * مع ذكر سعر العبوة الكاملة. الطازج يُحسب بعدد العبوات الكاملة اللازمة.
   */
  longLasting: boolean;
  tip?: string;
}

/** سعر المكوّن في دولة معيّنة: العبوة كما تُباع هناك. */
interface PricePoint {
  pack: string;
  packSize: number;
  price: number;
  store: string;
  tip?: string;
}

export interface Ingredient extends IngredientBase, PricePoint {}

const BASE: IngredientBase[] = [
  { id: 'eggs', name: 'بيض طازج', aisle: 'ألبان وبيض', unit: 'حبة', longLasting: true, tip: 'الطبق الكبير أرخص للحبة الواحدة، ويبقى صالحاً 3 إلى 4 أسابيع في الثلاجة.' },
  { id: 'chicken', name: 'صدور دجاج مجمدة', aisle: 'لحوم ودواجن وأسماك', unit: 'جم', longLasting: true, tip: 'الصدور المجمدة أرخص من الطازجة بكثير بنفس البروتين. أذب حصة اليوم في الثلاجة من الليلة السابقة.' },
  { id: 'tuna', name: 'تونة لايت بالماء', aisle: 'لحوم ودواجن وأسماك', unit: 'علبة', longLasting: true, tip: 'التونة بالماء أقل دهوناً من التونة بالزيت. راقب عروض العبوات الثلاثية.' },
  { id: 'lentils_brown', name: 'عدس حب كامل', aisle: 'بقوليات وحبوب', unit: 'جم', longLasting: true, tip: 'من أرخص مصادر البروتين والألياف، ويُحفظ أشهراً في علبة محكمة.' },
  { id: 'lentils_red', name: 'عدس أحمر مجروش', aisle: 'بقوليات وحبوب', unit: 'جم', longLasting: true, tip: 'ينضج في 15 دقيقة دون نقع، ومثالي للشوربة.' },
  { id: 'rice', name: 'أرز أبيض', aisle: 'بقوليات وحبوب', unit: 'جم', longLasting: true, tip: 'الأرز الأبيض العادي أرخص بكثير من البسمتي الفاخر ويؤدي الغرض نفسه.' },
  { id: 'pasta', name: 'مكرونة', aisle: 'بقوليات وحبوب', unit: 'جم', longLasting: true },
  { id: 'chickpeas', name: 'حمص مسلوق معلّب', aisle: 'بقوليات وحبوب', unit: 'علبة', longLasting: false, tip: 'بعد فتح العلبة انقل الباقي إلى وعاء مغلق، ويبقى 3 أيام في الثلاجة.' },
  { id: 'oats', name: 'شوفان', aisle: 'بقوليات وحبوب', unit: 'جم', longLasting: true, tip: 'الشوفان السادة أرخص من المنكّه، وحلِّه بالموز والقرفة.' },
  { id: 'yogurt', name: 'زبادي قليل الدسم', aisle: 'ألبان وبيض', unit: 'علبة', longLasting: false },
  { id: 'labneh', name: 'لبنة قليلة الدسم', aisle: 'ألبان وبيض', unit: 'جم', longLasting: false },
  { id: 'bread', name: 'خبز عربي', aisle: 'مخبوزات', unit: 'رغيف', longLasting: false, tip: 'يُجمَّد بسهولة: أخرج حاجتك كل يوم وسخّنه دقيقة.' },
  { id: 'tomato', name: 'طماطم', aisle: 'خضار وفواكه', unit: 'جم', longLasting: false },
  { id: 'onion', name: 'بصل', aisle: 'خضار وفواكه', unit: 'جم', longLasting: true },
  { id: 'cucumber', name: 'خيار', aisle: 'خضار وفواكه', unit: 'جم', longLasting: false, tip: 'الخيار المحلي أرخص كثيراً من المستورد من أوروبا.' },
  { id: 'capsicum', name: 'فلفل رومي أخضر', aisle: 'خضار وفواكه', unit: 'جم', longLasting: false },
  { id: 'lettuce', name: 'خس', aisle: 'خضار وفواكه', unit: 'جم', longLasting: false },
  { id: 'carrot', name: 'جزر', aisle: 'خضار وفواكه', unit: 'جم', longLasting: false },
  { id: 'banana', name: 'موز', aisle: 'خضار وفواكه', unit: 'جم', longLasting: false, tip: 'موز الإكوادور أرخص من الهندي بنحو النصف.' },
  { id: 'lemon', name: 'ليمون', aisle: 'خضار وفواكه', unit: 'جم', longLasting: false },
];

/**
 * الأسعار كما ظهرت على مواقع المتاجر بتاريخ PRICES_CHECKED_AT.
 * قطر: لولو قطر (gcc.luluhypermarket.com/en-qa) وكارفور قطر (carrefourqatar.com).
 * عُمان: لولو عُمان (gcc.luluhypermarket.com/en-om)، وبعض الأصناف من فرع لولو على طلبات عُمان.
 */
const PRICES: Record<CountryCode, Record<string, PricePoint>> = {
  QA: {
    eggs: { pack: 'طبق 30 حبة (الواحة)', packSize: 30, price: 18.0, store: 'لولو' },
    chicken: { pack: 'كيس 1 كجم (ساديا)', packSize: 1000, price: 16.0, store: 'كارفور' },
    tuna: { pack: 'علبة 185 جم (كاليفورنيا جاردن)', packSize: 1, price: 6.0, store: 'كارفور' },
    lentils_brown: { pack: 'كيس 1 كجم (لولو)', packSize: 1000, price: 9.0, store: 'لولو' },
    lentils_red: { pack: 'كيس 1 كجم (لولو)', packSize: 1000, price: 7.5, store: 'لولو' },
    rice: { pack: 'كيس 2 كجم (لولو)', packSize: 2000, price: 10.0, store: 'لولو' },
    pasta: { pack: 'كيس 400 جم (لولو)', packSize: 400, price: 3.0, store: 'لولو' },
    chickpeas: { pack: 'علبة 400 جم (كاليفورنيا جاردن)', packSize: 3, price: 3.5, store: 'لولو' },
    oats: { pack: 'عبوتان 500 جم (جرينز)', packSize: 1000, price: 8.0, store: 'لولو' },
    yogurt: { pack: '6 علب × 170 جم (بلدنا)', packSize: 6, price: 7.5, store: 'لولو', tip: 'عبوة الست علب أرخص من شراء العلبة منفردة (1.50).' },
    labneh: { pack: 'علبة 200 جم (بلدنا)', packSize: 200, price: 6.5, store: 'لولو' },
    bread: { pack: 'كيس 10 أرغفة صغيرة', packSize: 10, price: 1.0, store: 'لولو' },
    tomato: { pack: '1 كجم', packSize: 1000, price: 4.75, store: 'لولو' },
    onion: { pack: '1 كجم (بصل أحمر)', packSize: 1000, price: 3.75, store: 'كارفور', tip: 'البصل الأحمر هنا أرخص من البني والأبيض بأكثر من النصف.' },
    cucumber: { pack: '1 كجم', packSize: 1000, price: 6.0, store: 'لولو' },
    capsicum: { pack: '500 جم', packSize: 500, price: 4.88, store: 'كارفور' },
    lettuce: { pack: '500 جم', packSize: 500, price: 4.25, store: 'لولو' },
    carrot: { pack: '500 جم', packSize: 500, price: 3.0, store: 'كارفور' },
    banana: { pack: '1 كجم (الإكوادور)', packSize: 1000, price: 7.5, store: 'لولو' },
    lemon: { pack: '500 جم', packSize: 500, price: 1.75, store: 'لولو' },
  },
  OM: {
    eggs: { pack: 'طبق 30 حبة (لولو)', packSize: 30, price: 1.925, store: 'لولو' },
    chicken: { pack: 'كيس 1 كجم (فارم فريش)', packSize: 1000, price: 2.09, store: 'لولو' },
    tuna: { pack: 'علبة 185 جم (كاليفورنيا جاردن)', packSize: 1, price: 0.95, store: 'لولو' },
    lentils_brown: { pack: 'كيس 400 جم (بيارا)', packSize: 400, price: 0.44, store: 'لولو' },
    lentils_red: { pack: 'كيس 1 كجم (لولو)', packSize: 1000, price: 0.8, store: 'لولو' },
    rice: { pack: 'كيس 2 كجم (لولو)', packSize: 2000, price: 0.7, store: 'لولو' },
    pasta: { pack: 'كيس 400 جم (لولو)', packSize: 400, price: 0.34, store: 'لولو' },
    chickpeas: { pack: 'علبة 400 جم (كاليفورنيا جاردن)', packSize: 3, price: 0.375, store: 'لولو' },
    oats: { pack: 'عبوة 500 جم (لولو)', packSize: 500, price: 0.625, store: 'لولو' },
    yogurt: { pack: 'علبة 170 جم (المراعي)', packSize: 1, price: 0.17, store: 'لولو' },
    labneh: { pack: 'علبة 225 جم (بلدي فارمز)', packSize: 225, price: 0.49, store: 'لولو' },
    bread: { pack: 'كيس 4 أرغفة متوسطة', packSize: 4, price: 0.1, store: 'لولو' },
    tomato: { pack: '500 جم', packSize: 500, price: 0.305, store: 'لولو' },
    onion: { pack: '1 كجم', packSize: 1000, price: 0.65, store: 'لولو', tip: 'البصل الهندي أرخص من البني بأكثر من النصف.' },
    cucumber: { pack: '500 جم (عُماني)', packSize: 500, price: 0.215, store: 'لولو' },
    capsicum: { pack: '500 جم', packSize: 500, price: 0.49, store: 'لولو' },
    lettuce: { pack: '400 جم (روماني)', packSize: 400, price: 0.26, store: 'لولو' },
    carrot: { pack: '500 جم', packSize: 500, price: 0.545, store: 'لولو' },
    banana: { pack: '1 كجم (الإكوادور)', packSize: 1000, price: 0.87, store: 'لولو' },
    lemon: { pack: '500 جم', packSize: 500, price: 0.55, store: 'لولو' },
  },
};

export function ingredientsFor(country: CountryCode): Record<string, Ingredient> {
  const prices = PRICES[country] ?? PRICES.QA;
  return Object.fromEntries(
    BASE.map((b) => {
      const p = prices[b.id];
      return [b.id, { ...b, ...p, tip: p.tip ?? b.tip }];
    })
  );
}

/** مكونات لا تُشترى كل أسبوع ولا تدخل في الحساب: زيت، ملح، بهارات. */
const PANTRY_NOTE = 'الزيت والملح والبهارات من مخزون البيت ولا تدخل في الحساب.';

type Use = { id: string; qty: number; label: string };

interface MealSpec {
  id: string;
  name: string;
  arabicName: string;
  category: Meal['category'];
  image: string;
  prepTimeMin: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  uses: Use[];
  recipeSteps: string[];
  tags: string[];
  pantryNotes?: string;
}

const IMG = {
  eggs: '/images/meal_egg_oat_breakfast_1792268390800.jpg',
  tuna: '/images/meal_tuna_pasta_salad_1792268391098.jpg',
  lentils: '/images/meal_lentil_rice_bowl_1792268391600.jpg',
};

// القيم الغذائية تقريبية ومحسوبة من جداول التغذية المعتادة للكميات المذكورة.
const SPECS: MealSpec[] = [
  // ───── الفطور ─────
  {
    id: 'meal_egg_oats_breakfast',
    name: 'Scrambled eggs with peppers and Arabic bread',
    arabicName: 'بيض مخفوق بالطماطم والفلفل مع خبز عربي',
    category: 'فطور',
    image: IMG.eggs,
    prepTimeMin: 10,
    calories: 440,
    protein: 25,
    carbs: 39,
    fats: 21,
    uses: [
      { id: 'eggs', qty: 3, label: '3 حبات' },
      { id: 'tomato', qty: 100, label: 'حبة متوسطة' },
      { id: 'capsicum', qty: 50, label: 'نصف حبة' },
      { id: 'bread', qty: 2, label: 'رغيفان صغيران' },
    ],
    recipeSteps: [
      'اخفق البيض مع رشة ملح وفلفل أسود.',
      'شوّح الفلفل والطماطم المقطعة في ملعقة صغيرة من الزيت دقيقتين.',
      'أضف البيض وقلّب على نار متوسطة حتى ينضج بقوام طري.',
      'قدّمه مع الخبز العربي بعد تسخينه.',
    ],
    tags: ['عالي البروتين', 'سريع'],
    pantryNotes: PANTRY_NOTE,
  },
  {
    id: 'meal_shakshuka_budget',
    name: 'Budget shakshuka',
    arabicName: 'شكشوكة اقتصادية بالبصل والطماطم',
    category: 'فطور',
    image: '',
    prepTimeMin: 15,
    calories: 390,
    protein: 20,
    carbs: 44,
    fats: 16,
    uses: [
      { id: 'eggs', qty: 2, label: 'حبتان' },
      { id: 'tomato', qty: 150, label: 'حبة ونصف' },
      { id: 'onion', qty: 50, label: 'نصف بصلة' },
      { id: 'bread', qty: 2, label: 'رغيفان صغيران' },
    ],
    recipeSteps: [
      'شوّح البصل المفروم في ملعقة صغيرة من الزيت حتى يذبل.',
      'أضف الطماطم المفرومة مع الكمون والملح، واتركها 5 دقائق حتى تتسبك.',
      'اصنع فجوتين واكسر فيهما البيض، وغطِّ المقلاة 4 دقائق على نار هادئة.',
    ],
    tags: ['اقتصادي', 'تقليدي'],
    pantryNotes: PANTRY_NOTE,
  },
  {
    id: 'meal_boiled_eggs_oat',
    name: 'Oats with yogurt, banana and boiled eggs',
    arabicName: 'شوفان بالقرفة مع زبادي وموزة وبيضتين مسلوقتين',
    category: 'فطور',
    image: '',
    prepTimeMin: 7,
    calories: 570,
    protein: 28,
    carbs: 77,
    fats: 17,
    uses: [
      { id: 'oats', qty: 60, label: '60 جم (ثلثا كوب)' },
      { id: 'yogurt', qty: 1, label: 'علبة 170 جم' },
      { id: 'banana', qty: 120, label: 'موزة متوسطة' },
      { id: 'eggs', qty: 2, label: 'حبتان' },
    ],
    recipeSteps: [
      'اسلق البيض 8 دقائق (يمكن سلقه من الليلة السابقة).',
      'اطبخ الشوفان بكوب ماء ورشة قرفة دقيقتين في القدر أو الميكروويف.',
      'أضف الزبادي وشرائح الموز فوق الشوفان.',
    ],
    tags: ['الأسرع', 'شبع طويل', 'تجهيز مسبق'],
    pantryNotes: 'القرفة من مخزون البيت.',
  },

  // ───── الغداء ─────
  {
    id: 'meal_tuna_pasta_salad',
    name: 'Tuna and chickpea pasta salad',
    arabicName: 'سلطة مكرونة بالتونة والحمص والفلفل',
    category: 'غداء',
    image: IMG.tuna,
    prepTimeMin: 18,
    calories: 625,
    protein: 48,
    carbs: 80,
    fats: 13,
    uses: [
      { id: 'tuna', qty: 1, label: 'علبة 185 جم' },
      { id: 'pasta', qty: 80, label: '80 جم قبل الطبخ' },
      { id: 'chickpeas', qty: 1 / 3, label: 'ثلث علبة' },
      { id: 'capsicum', qty: 50, label: 'نصف حبة' },
      { id: 'lemon', qty: 60, label: 'نصف ليمونة' },
    ],
    recipeSteps: [
      'اسلق المكرونة في ماء مملح 9 دقائق، ثم صفّها واتركها تبرد قليلاً.',
      'اخلطها مع التونة المصفاة والحمص والفلفل المقطع.',
      'تبّلها بعصير الليمون وملعقة صغيرة من زيت الزيتون والكمون.',
    ],
    tags: ['عالي البروتين', 'يُحضَّر مسبقاً', 'مناسب للدوام'],
    pantryNotes: PANTRY_NOTE,
  },
  {
    id: 'meal_tuna_sandwich_wrap',
    name: 'Tuna wraps in Arabic bread',
    arabicName: 'لفائف تونة بالخبز العربي والخضار',
    category: 'غداء',
    image: '',
    prepTimeMin: 5,
    calories: 460,
    protein: 43,
    carbs: 57,
    fats: 7,
    uses: [
      { id: 'tuna', qty: 1, label: 'علبة 185 جم' },
      { id: 'bread', qty: 3, label: '3 أرغفة صغيرة' },
      { id: 'tomato', qty: 100, label: 'حبة متوسطة' },
      { id: 'cucumber', qty: 100, label: 'حبة' },
      { id: 'lettuce', qty: 50, label: 'بضع أوراق' },
    ],
    recipeSteps: [
      'صفّ التونة وتبّلها بالليمون أو الكمون.',
      'وزّعها على الأرغفة مع شرائح الطماطم والخيار والخس، ثم لفّها.',
    ],
    tags: ['الأسرع', 'عالي البروتين'],
    pantryNotes: PANTRY_NOTE,
  },
  {
    id: 'meal_lentil_rice_bowl',
    name: 'Mujadara with yogurt and cucumber',
    arabicName: 'مجدرة عدس وأرز بالبصل مع زبادي وخيار',
    category: 'غداء',
    image: IMG.lentils,
    prepTimeMin: 30,
    calories: 655,
    protein: 30,
    carbs: 102,
    fats: 13,
    uses: [
      { id: 'lentils_brown', qty: 70, label: '70 جم قبل الطبخ' },
      { id: 'rice', qty: 50, label: '50 جم قبل الطبخ' },
      { id: 'onion', qty: 100, label: 'بصلة متوسطة' },
      { id: 'yogurt', qty: 1, label: 'علبة 170 جم' },
      { id: 'cucumber', qty: 100, label: 'حبة' },
    ],
    recipeSteps: [
      'اسلق العدس 15 دقيقة حتى يلين نصف استواء.',
      'أضف الأرز والكمون والملح وماءً يغطيهما، واتركه على نار هادئة حتى ينضج.',
      'حمّر شرائح البصل في ملعقة صغيرة من الزيت حتى تصبح ذهبية، وضعها فوق الطبق.',
      'قدّمه مع الزبادي والخيار.',
    ],
    tags: ['الأرخص', 'نباتي', 'ألياف عالية'],
    pantryNotes: PANTRY_NOTE,
  },
  {
    id: 'meal_chicken_rice_budget',
    name: 'Grilled chicken breast with rice and salad',
    arabicName: 'صدر دجاج مشوي مع أرز وسلطة خضراء',
    category: 'غداء',
    image: '',
    prepTimeMin: 25,
    calories: 575,
    protein: 48,
    carbs: 64,
    fats: 12,
    uses: [
      { id: 'chicken', qty: 180, label: '180 جم' },
      { id: 'rice', qty: 70, label: '70 جم قبل الطبخ' },
      { id: 'lettuce', qty: 80, label: 'طبق صغير' },
      { id: 'cucumber', qty: 100, label: 'حبة' },
      { id: 'tomato', qty: 100, label: 'حبة متوسطة' },
      { id: 'lemon', qty: 60, label: 'نصف ليمونة' },
    ],
    recipeSteps: [
      'تبّل الدجاج بالثوم والليمون والبابريكا والملح.',
      'اشوِه في مقلاة أو قلّاية هوائية 12 دقيقة مع التقليب.',
      'قدّمه مع الأرز المطبوخ وسلطة الخس والخيار والطماطم.',
    ],
    tags: ['بناء العضلات', 'عالي البروتين'],
    pantryNotes: PANTRY_NOTE,
  },

  // ───── العشاء ─────
  {
    id: 'meal_cottage_cheese_snack',
    name: 'Light labneh with boiled eggs and vegetables',
    arabicName: 'لبنة خفيفة مع بيضتين مسلوقتين وخيار وطماطم',
    category: 'عشاء',
    image: '',
    prepTimeMin: 10,
    calories: 495,
    protein: 27,
    carbs: 44,
    fats: 23,
    uses: [
      { id: 'labneh', qty: 100, label: 'نصف علبة' },
      { id: 'eggs', qty: 2, label: 'حبتان' },
      { id: 'cucumber', qty: 100, label: 'حبة' },
      { id: 'tomato', qty: 100, label: 'حبة متوسطة' },
      { id: 'bread', qty: 2, label: 'رغيفان صغيران' },
    ],
    recipeSteps: [
      'اسلق البيض 8 دقائق.',
      'قدّم اللبنة برشة زعتر وقطرات زيت زيتون، مع البيض والخضار والخبز.',
    ],
    tags: ['خفيف', 'سريع'],
    pantryNotes: 'الزعتر والزيت من مخزون البيت.',
  },
  {
    id: 'meal_tuna_light_dinner',
    name: 'Tuna salad with chickpeas',
    arabicName: 'سلطة تونة بالحمص والخضار',
    category: 'عشاء',
    image: '',
    prepTimeMin: 6,
    calories: 420,
    protein: 44,
    carbs: 44,
    fats: 8,
    uses: [
      { id: 'tuna', qty: 1, label: 'علبة 185 جم' },
      { id: 'chickpeas', qty: 1 / 3, label: 'ثلث علبة' },
      { id: 'lettuce', qty: 100, label: 'طبق' },
      { id: 'cucumber', qty: 100, label: 'حبة' },
      { id: 'tomato', qty: 100, label: 'حبة متوسطة' },
      { id: 'bread', qty: 1, label: 'رغيف صغير' },
    ],
    recipeSteps: ['اخلط التونة المصفاة مع الحمص والخضار المقطعة، وتبّلها بالليمون والكمون.'],
    tags: ['عالي البروتين', 'قليل الدهون', 'سريع'],
    pantryNotes: PANTRY_NOTE,
  },
  {
    id: 'meal_lentil_soup',
    name: 'Red lentil soup',
    arabicName: 'شوربة عدس أحمر بالجزر مع خبز',
    category: 'عشاء',
    image: '',
    prepTimeMin: 20,
    calories: 405,
    protein: 22,
    carbs: 68,
    fats: 6,
    uses: [
      { id: 'lentils_red', qty: 70, label: '70 جم' },
      { id: 'onion', qty: 50, label: 'نصف بصلة' },
      { id: 'carrot', qty: 50, label: 'جزرة صغيرة' },
      { id: 'lemon', qty: 60, label: 'نصف ليمونة' },
      { id: 'bread', qty: 1, label: 'رغيف صغير' },
    ],
    recipeSteps: [
      'شوّح البصل والجزر المقطعين في ملعقة صغيرة من الزيت.',
      'أضف العدس المغسول و3 أكواب ماء والكمون والملح، واتركه 15 دقيقة.',
      'اهرسه أو اخلطه، وقدّمه بالليمون مع الخبز.',
    ],
    tags: ['الأرخص', 'دافئ', 'ألياف عالية'],
    pantryNotes: PANTRY_NOTE,
  },

  // ───── وجبة خفيفة ─────
  {
    id: 'snack_yogurt_banana',
    name: 'Yogurt with banana and oats',
    arabicName: 'زبادي بالموز وملعقة شوفان',
    category: 'سناك',
    image: '',
    prepTimeMin: 2,
    calories: 255,
    protein: 10,
    carbs: 45,
    fats: 4,
    uses: [
      { id: 'yogurt', qty: 1, label: 'علبة 170 جم' },
      { id: 'banana', qty: 120, label: 'موزة متوسطة' },
      { id: 'oats', qty: 20, label: 'ملعقتان كبيرتان' },
    ],
    recipeSteps: ['ضع الزبادي في وعاء، وأضف شرائح الموز والشوفان ورشة قرفة.'],
    tags: ['سريع', 'قبل التمرين'],
  },
  {
    id: 'snack_eggs_veg',
    name: 'Boiled eggs with cucumber and carrot',
    arabicName: 'بيضتان مسلوقتان مع خيار وجزر',
    category: 'سناك',
    image: '',
    prepTimeMin: 10,
    calories: 175,
    protein: 13,
    carbs: 8,
    fats: 10,
    uses: [
      { id: 'eggs', qty: 2, label: 'حبتان' },
      { id: 'cucumber', qty: 100, label: 'حبة' },
      { id: 'carrot', qty: 50, label: 'جزرة صغيرة' },
    ],
    recipeSteps: ['اسلق البيض 8 دقائق، وقدّمه مع أصابع الخيار والجزر.'],
    tags: ['عالي البروتين', 'بعد التمرين'],
  },
  {
    id: 'snack_chickpeas_lemon',
    name: 'Chickpeas with lemon and cumin',
    arabicName: 'حمص بالليمون والكمون',
    category: 'سناك',
    image: '',
    prepTimeMin: 3,
    calories: 150,
    protein: 7,
    carbs: 22,
    fats: 3,
    uses: [
      { id: 'chickpeas', qty: 1 / 3, label: 'ثلث علبة' },
      { id: 'lemon', qty: 30, label: 'ربع ليمونة' },
    ],
    recipeSteps: ['صفّ الحمص واغسله، ثم تبّله بالليمون والكمون ورشة ملح.'],
    tags: ['الأرخص', 'ألياف عالية'],
    pantryNotes: 'الكمون والملح من مخزون البيت.',
  },
];

const round3 = (n: number) => Math.round(n * 1000) / 1000;

function buildMeals(country: CountryCode): Meal[] {
  const ing = ingredientsFor(country);
  const meals: Meal[] = SPECS.map((s) => {
    const ingredients: MealIngredient[] = s.uses.map((u) => {
      const i = ing[u.id];
      return { name: i.name, portionQty: u.label, packName: i.pack, packPrice: i.price, aisle: i.aisle };
    });
    return {
      id: s.id,
      name: s.name,
      arabicName: s.arabicName,
      category: s.category,
      image: s.image,
      prepTimeMin: s.prepTimeMin,
      servings: 1,
      calories: s.calories,
      protein: s.protein,
      carbs: s.carbs,
      fats: s.fats,
      estimatedPortionCost: round3(s.uses.reduce((sum, u) => sum + (u.qty / ing[u.id].packSize) * ing[u.id].price, 0)),
      packEstimatedCost: round3(s.uses.reduce((sum, u) => sum + ing[u.id].price, 0)),
      ingredients,
      recipeSteps: s.recipeSteps,
      tags: s.tags,
      pantryNotes: s.pantryNotes,
    };
  });

  // البدائل تُحسب من الأرقام نفسها، فلا يظهر «أرخص» إلا إذا كان أرخص فعلاً في هذه الدولة.
  for (const m of meals) {
    const same = meals.filter((o) => o.category === m.category && o.id !== m.id);
    const cheaper = same.filter((o) => o.estimatedPortionCost < m.estimatedPortionCost);
    const faster = same.filter((o) => o.prepTimeMin < m.prepTimeMin);
    m.cheaperAlternativeId = [...cheaper].sort((a, b) => a.estimatedPortionCost - b.estimatedPortionCost)[0]?.id;
    m.fasterAlternativeId = [...faster].sort((a, b) => a.prepTimeMin - b.prepTimeMin)[0]?.id;
    m.swapOptionIds = same.map((o) => o.id);
  }
  return meals;
}

const MEALS_CACHE: Partial<Record<CountryCode, Meal[]>> = {};

export function mealsFor(country: CountryCode): Meal[] {
  return (MEALS_CACHE[country] ??= buildMeals(country));
}

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];
export const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'الفطور',
  lunch: 'الغداء',
  dinner: 'العشاء',
  snack: 'وجبة خفيفة',
};
const SLOT_CATEGORY: Record<MealSlot, Meal['category']> = {
  breakfast: 'فطور',
  lunch: 'غداء',
  dinner: 'عشاء',
  snack: 'سناك',
};

/** الأحد إلى السبت: فطور، غداء، عشاء، وجبة خفيفة. كل وجبة تتكرر مرتين أو ثلاثاً فقط في الأسبوع. */
const WEEK: [string, string, string, string, string, string][] = [
  ['day_sun', 'الأحد', 'meal_egg_oats_breakfast', 'meal_chicken_rice_budget', 'meal_cottage_cheese_snack', 'snack_yogurt_banana'],
  ['day_mon', 'الإثنين', 'meal_shakshuka_budget', 'meal_lentil_rice_bowl', 'meal_tuna_light_dinner', 'snack_eggs_veg'],
  ['day_tue', 'الثلاثاء', 'meal_boiled_eggs_oat', 'meal_tuna_pasta_salad', 'meal_lentil_soup', 'snack_chickpeas_lemon'],
  ['day_wed', 'الأربعاء', 'meal_egg_oats_breakfast', 'meal_chicken_rice_budget', 'meal_lentil_soup', 'snack_yogurt_banana'],
  ['day_thu', 'الخميس', 'meal_shakshuka_budget', 'meal_tuna_sandwich_wrap', 'meal_cottage_cheese_snack', 'snack_chickpeas_lemon'],
  ['day_fri', 'الجمعة', 'meal_boiled_eggs_oat', 'meal_lentil_rice_bowl', 'meal_tuna_light_dinner', 'snack_eggs_veg'],
  ['day_sat', 'السبت', 'meal_egg_oats_breakfast', 'meal_tuna_pasta_salad', 'meal_lentil_soup', 'snack_yogurt_banana'],
];

export const DAY_IDS = WEEK.map((w) => w[0]);

export function defaultWeekPlan(country: CountryCode): DayNutritionPlan[] {
  const meals = mealsFor(country);
  const by = (id: string) => meals.find((m) => m.id === id)!;
  return WEEK.map(([dayId, dayName, b, l, d, sn]) => ({
    dayId,
    dayName,
    meals: { breakfast: by(b), lunch: by(l), dinner: by(d), snack: by(sn) },
  }));
}

/**
 * يعيد بناء أيام الخطة المحفوظة بأسعار الدولة المختارة وأحدث بيانات الوجبات،
 * مع الإبقاء على اختيارات المستخدم (الوجبات التي بدّلها).
 */
export function refreshPlan(saved: DayNutritionPlan[] | undefined, country: CountryCode): DayNutritionPlan[] {
  const defaults = defaultWeekPlan(country);
  if (!saved || !Array.isArray(saved)) return defaults;
  const meals = mealsFor(country);
  return defaults.map((def) => {
    const s = saved.find((d) => d.dayId === def.dayId);
    const pick = (slot: MealSlot) => {
      const id = s?.meals?.[slot]?.id;
      const fresh = id ? meals.find((m) => m.id === id) : undefined;
      return fresh && fresh.category === SLOT_CATEGORY[slot] ? fresh : def.meals[slot]!;
    };
    return { ...def, meals: { breakfast: pick('breakfast'), lunch: pick('lunch'), dinner: pick('dinner'), snack: pick('snack') } };
  });
}

export function dayTotals(day: DayNutritionPlan | undefined) {
  const list = day ? MEAL_SLOTS.map((s) => day.meals[s]).filter(Boolean) as Meal[] : [];
  return {
    calories: list.reduce((a, m) => a + m.calories, 0),
    protein: list.reduce((a, m) => a + m.protein, 0),
    cost: list.reduce((a, m) => a + m.estimatedPortionCost, 0),
  };
}

export interface ShoppingStatus {
  isPurchased?: boolean;
  inPantry?: boolean;
  actualPrice?: number;
}

/** العدد مع المعدود بصيغة عربية صحيحة: علبة، علبتان، 3 علب، 11 علبة. */
function countWord(n: number, one: string, two: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${n} ${few}`;
  return `${n} ${many}`;
}

const COUNT_FORMS: Record<string, [string, string, string, string]> = {
  'حبة': ['حبة واحدة', 'حبتان', 'حبات', 'حبة'],
  'علبة': ['علبة واحدة', 'علبتان', 'علب', 'علبة'],
  'رغيف': ['رغيف واحد', 'رغيفان', 'أرغفة', 'رغيفاً'],
};

const fmtQty = (qty: number, unit: Ingredient['unit']) => {
  if (unit === 'جم') return qty >= 1000 ? `${(qty / 1000).toFixed(qty % 1000 === 0 ? 0 : 1)} كجم` : `${Math.round(qty)} جم`;
  if (unit === 'علبة' && qty < 1) return 'جزء من علبة';
  const n = Math.ceil(qty - 1e-9);
  const [one, two, few, many] = COUNT_FORMS[unit];
  return countWord(n, one, two, few, many);
};

const weeksWord = (w: number) => countWord(w, 'أسبوعاً واحداً', 'أسبوعين', 'أسابيع', 'أسبوعاً');

/**
 * قائمة مشتريات الأسبوع من وجبات الخطة الفعلية.
 * - الطازج: عدد العبوات الكاملة اللازمة × سعرها.
 * - المؤن التي تدوم: ما يُستهلك هذا الأسبوع فقط، مع ذكر سعر العبوة الكاملة وكم أسبوعاً تكفي.
 */
export function buildShoppingList(
  days: DayNutritionPlan[],
  persons: number,
  status: Record<string, ShoppingStatus>,
  country: CountryCode
): ShoppingItem[] {
  const INGREDIENTS = ingredientsFor(country);
  const countryName = COUNTRIES.find((c) => c.code === country)?.name ?? '';
  const totals = new Map<string, number>();
  for (const day of days) {
    for (const slot of MEAL_SLOTS) {
      const spec = SPECS.find((s) => s.id === day.meals[slot]?.id);
      for (const u of spec?.uses ?? []) totals.set(u.id, (totals.get(u.id) ?? 0) + u.qty * Math.max(1, persons));
    }
  }

  const items: ShoppingItem[] = [];
  for (const [id, qty] of totals) {
    const ing = INGREDIENTS[id];
    const packs = Math.max(1, Math.ceil(qty / ing.packSize - 1e-9));
    let estimatedPrice: number;
    let packToBuy: string;
    const weeks = ing.packSize / qty;
    if (ing.longLasting && weeks >= 1.5) {
      // مؤونة تكفي أكثر من أسبوع: نحسب في ميزانية هذا الأسبوع ما يُستهلك منها فقط
      estimatedPrice = round3((qty / ing.packSize) * ing.price);
      packToBuy = `${ing.pack} بسعر ${money(ing.price, country)}، تكفي نحو ${weeksWord(Math.floor(weeks))}، ونحسب هنا حصة هذا الأسبوع فقط`;
    } else {
      estimatedPrice = round3(packs * ing.price);
      packToBuy = `${packs} × ${ing.pack} بسعر ${money(ing.price, country)} للعبوة`;
    }
    const st = status[id] || {};
    items.push({
      id,
      name: ing.name,
      aisle: ing.aisle,
      recipeQty: `${fmtQty(qty, ing.unit)} للأسبوع`,
      packToBuy,
      estimatedPrice,
      actualPrice: st.actualPrice,
      isPurchased: Boolean(st.isPurchased),
      inPantry: Boolean(st.inPantry),
      cheaperTip: ing.tip,
      sourceNote: `السعر من موقع ${ing.store} ${countryName} بتاريخ ${PRICES_CHECKED_AT}`,
    });
  }

  const aisleOrder: Aisle[] = ['خضار وفواكه', 'لحوم ودواجن وأسماك', 'ألبان وبيض', 'بقوليات وحبوب', 'مخبوزات', 'بهارات ومؤن'];
  return items.sort((a, b) => aisleOrder.indexOf(a.aisle) - aisleOrder.indexOf(b.aisle) || b.estimatedPrice - a.estimatedPrice);
}

/** تنسيق المبلغ بعملة الدولة: ريال عُماني بثلاث خانات (بيسة)، وريال قطري بخانتين. */
export function money(n: number, country: CountryCode): string {
  const c = COUNTRIES.find((x) => x.code === country) ?? COUNTRIES[0];
  return `${(Number.isFinite(n) ? n : 0).toFixed(c.decimals)} ${c.currency}`;
}

/** تكلفة أسبوع الخطة الافتراضية لشخص واحد، لاقتراح ميزانية واقعية لكل دولة. */
export function suggestedWeeklyBudget(country: CountryCode, persons = 1): number {
  const items = buildShoppingList(defaultWeekPlan(country), persons, {}, country);
  const total = items.reduce((a, i) => a + i.estimatedPrice, 0);
  // هامش 15٪ ثم تقريب لرقم سهل
  const step = country === 'OM' ? 0.5 : 5;
  return Math.ceil((total * 1.15) / step) * step;
}

const PANTRY_IDS = new Set(['lentils_brown', 'lentils_red', 'rice', 'pasta', 'oats', 'eggs', 'chickpeas', 'onion', 'tuna', 'bread']);

/** من وجبات الفئة نفسها: التي تعتمد مكوناتها أكثر على مؤن البيت (عدس، أرز، بيض…) بدل الطازج. */
export function pantryFriendlyMealId(category: Meal['category'], excludeId: string): string | undefined {
  const score = (s: MealSpec) => s.uses.filter((u) => PANTRY_IDS.has(u.id)).length / s.uses.length;
  return SPECS.filter((s) => s.category === category && s.id !== excludeId).sort((a, b) => score(b) - score(a))[0]?.id;
}
