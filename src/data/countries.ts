export const COUNTRIES: { name: string; currency: string }[] = [
  { name: 'قطر', currency: 'ر.ق' },
  { name: 'السعودية', currency: 'ر.س' },
  { name: 'الإمارات', currency: 'د.إ' },
  { name: 'الكويت', currency: 'د.ك' },
  { name: 'البحرين', currency: 'د.ب' },
  { name: 'عُمان', currency: 'ر.ع' },
  { name: 'مصر', currency: 'ج.م' },
  { name: 'الأردن', currency: 'د.أ' },
  { name: 'الجزائر', currency: 'د.ج' },
  { name: 'المغرب', currency: 'د.م' },
  { name: 'تونس', currency: 'د.ت' },
];

export function currencyFor(country: string): string | undefined {
  return COUNTRIES.find((c) => c.name === country)?.currency;
}
