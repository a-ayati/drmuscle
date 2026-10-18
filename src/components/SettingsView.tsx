import React, { useEffect, useState } from 'react';
import {
  User,
  Palette,
  Wallet,
  Dumbbell,
  Volume2,
  Database,
  Info,
  Sun,
  Moon,
  Monitor,
  LogOut,
  KeyRound,
  Download,
  RotateCcw,
  Trash2,
  CheckCircle2,
  CloudOff,
  Loader2,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api, ApiError } from '../lib/api';
import { getThemeChoice, setThemeChoice, ThemeChoice } from '../lib/theme';
import { COUNTRIES, PRICES_CHECKED_AT } from '../data/food';
import { LOCATION_LABELS } from '../data/workouts';
import type { LocationPreference } from '../types';

const fmtDate = (ms: number) =>
  new Date(ms).toLocaleString('ar-u-nu-latn', { dateStyle: 'medium', timeStyle: 'short' });

const Section: React.FC<{ icon: React.ElementType; title: string; hint?: string; children: React.ReactNode }> = ({
  icon: Icon,
  title,
  hint,
  children,
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 shrink-0 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="font-extrabold text-slate-900 text-base">{title}</h2>
        {hint && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{hint}</p>}
      </div>
    </div>
    <div className="space-y-5">{children}</div>
  </section>
);

const Row: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <div className="min-w-0">
      <div className="text-sm font-semibold text-slate-800">{label}</div>
      {hint && <div className="text-xs text-slate-500 mt-1 leading-relaxed">{hint}</div>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string; icon?: React.ElementType }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="bg-slate-100 p-1 rounded-xl inline-flex flex-wrap gap-1 text-sm">
      {options.map((o) => {
        const active = o.value === value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`h-9 px-3 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
              active ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {Icon && <Icon className={`w-4 h-4 ${active ? 'text-white' : ''}`} />}
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

const fieldClass =
  'h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20';

const Notice: React.FC<{ tone: 'ok' | 'warn'; children: React.ReactNode }> = ({ tone, children }) => (
  <div
    role="status"
    className={`rounded-xl px-4 py-3 text-sm border ${
      tone === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900'
    }`}
  >
    {children}
  </div>
);

export const SettingsView: React.FC = () => {
  const {
    user,
    setUser,
    logout,
    saveStatus,
    lastSavedAt,
    exportData,
    userProfile,
    updateUserProfile,
    audioMode,
    setAudioMode,
    workoutLocation,
    setWorkoutLocation,
    setWorkoutDays,
    setCountry,
    countryCode,
    notify,
    setIsOnboardingOpen,
    resetAllData,
  } = useApp();

  const [theme, setTheme] = useState<ThemeChoice>(getThemeChoice());

  // الاسم
  const [name, setName] = useState(user.name);
  const [nameMsg, setNameMsg] = useState<{ tone: 'ok' | 'warn'; text: string } | null>(null);
  const [savingName, setSavingName] = useState(false);

  // كلمة المرور
  const [pwOpen, setPwOpen] = useState(false);
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNext, setPwNext] = useState('');
  const [pwMsg, setPwMsg] = useState<{ tone: 'ok' | 'warn'; text: string } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  // الإجراءات الحساسة
  const [confirmReset, setConfirmReset] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePw, setDeletePw] = useState('');
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => setName(user.name), [user.name]);

  const chooseTheme = (t: ThemeChoice) => {
    setTheme(t);
    setThemeChoice(t);
  };

  const saveName = async () => {
    const clean = name.trim();
    if (!clean || clean === user.name) return;
    setSavingName(true);
    setNameMsg(null);
    try {
      const res = await api.updateName(clean);
      setUser(res.user);
      updateUserProfile({ name: res.user.name });
      setNameMsg({ tone: 'ok', text: 'تم حفظ الاسم.' });
    } catch (err) {
      setNameMsg({ tone: 'warn', text: err instanceof ApiError ? err.message : 'تعذر حفظ الاسم.' });
    } finally {
      setSavingName(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (pwNext.length < 8) return setPwMsg({ tone: 'warn', text: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.' });
    setPwBusy(true);
    try {
      await api.changePassword(pwCurrent, pwNext);
      setPwCurrent('');
      setPwNext('');
      setPwMsg({ tone: 'ok', text: 'تم تغيير كلمة المرور، وخرجت أجهزتك الأخرى من الحساب.' });
      notify('info', 'تغيّرت كلمة المرور', 'خرجت أجهزتك الأخرى من الحساب. إذا لم تغيّرها أنت، تواصل مع صاحب التطبيق فوراً.');
    } catch (err) {
      setPwMsg({ tone: 'warn', text: err instanceof ApiError ? err.message : 'تعذر تغيير كلمة المرور.' });
    } finally {
      setPwBusy(false);
    }
  };

  const downloadData = () => {
    const blob = new Blob([JSON.stringify({ account: { name: user.name, email: user.email }, ...exportData() }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ala-qaddak-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteMsg(null);
    setDeleteBusy(true);
    try {
      await api.deleteAccount(deletePw);
      window.location.reload();
    } catch (err) {
      setDeleteMsg(err instanceof ApiError ? err.message : 'تعذر حذف الحساب.');
      setDeleteBusy(false);
    }
  };

  const doLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  const syncBadge =
    saveStatus === 'saving' ? (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" /> جارٍ الحفظ…
      </span>
    ) : saveStatus === 'error' ? (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800">
        <CloudOff className="w-4 h-4" /> لم يُحفظ آخر تعديل، سنعيد المحاولة مع تعديلك التالي
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="w-4 h-4" /> محفوظة في حسابك
        {lastSavedAt ? <span className="font-normal text-slate-500">· {fmtDate(lastSavedAt)}</span> : null}
      </span>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-28 lg:pb-10">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">الإعدادات</h1>
        <p className="text-sm text-slate-500 mt-1">حسابك، وشكل التطبيق، وأساسيات خطتك في مكان واحد.</p>
      </div>

      {/* 1. الحساب */}
      <Section icon={User} title="الحساب">
        <Row label="الاسم" hint="يظهر في التحية وفي رسائل الكابتن.">
          <div className="flex items-center gap-2">
            <input
              className={`${fieldClass} w-48`}
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveName()}
            />
            <button
              type="button"
              onClick={saveName}
              disabled={savingName || !name.trim() || name.trim() === user.name}
              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold"
            >
              حفظ
            </button>
          </div>
        </Row>
        {nameMsg && <Notice tone={nameMsg.tone}>{nameMsg.text}</Notice>}

        <Row label="البريد الإلكتروني" hint={`عضو منذ ${fmtDate(user.createdAt)}`}>
          <span dir="ltr" className="text-sm font-semibold text-slate-700">
            {user.email}
          </span>
        </Row>

        <div className="border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => {
              setPwOpen((v) => !v);
              setPwMsg(null);
            }}
            className="w-full flex items-center justify-between text-sm font-semibold text-slate-800"
          >
            <span className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-slate-500" /> تغيير كلمة المرور
            </span>
            <ChevronLeft className={`w-4 h-4 text-slate-400 transition-transform ${pwOpen ? '-rotate-90' : ''}`} />
          </button>
          {pwOpen && (
            <form onSubmit={changePassword} className="mt-4 grid sm:grid-cols-2 gap-3">
              <input
                className={`${fieldClass} text-left`}
                dir="ltr"
                type="password"
                autoComplete="current-password"
                placeholder="كلمة المرور الحالية"
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
              />
              <input
                className={`${fieldClass} text-left`}
                dir="ltr"
                type="password"
                autoComplete="new-password"
                placeholder="الجديدة (8 أحرف على الأقل)"
                value={pwNext}
                onChange={(e) => setPwNext(e.target.value)}
              />
              <div className="sm:col-span-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={pwBusy || !pwCurrent || !pwNext}
                  className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold flex items-center gap-2"
                >
                  {pwBusy && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                  <span>حفظ كلمة المرور</span>
                </button>
              </div>
              {pwMsg && (
                <div className="sm:col-span-2">
                  <Notice tone={pwMsg.tone}>{pwMsg.text}</Notice>
                </div>
              )}
            </form>
          )}
        </div>

        <div className="border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={doLogout}
            disabled={loggingOut}
            className="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-bold flex items-center gap-2"
          >
            {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </Section>

      {/* 2. المظهر */}
      <Section icon={Palette} title="المظهر" hint="يُحفظ هذا الاختيار على هذا الجهاز.">
        <Row label="الوضع">
          <Segmented<ThemeChoice>
            value={theme}
            onChange={chooseTheme}
            options={[
              { value: 'light', label: 'فاتح', icon: Sun },
              { value: 'dark', label: 'ليلي', icon: Moon },
              { value: 'system', label: 'حسب الجهاز', icon: Monitor },
            ]}
          />
        </Row>
      </Section>

      {/* 3. الميزانية والسوق */}
      <Section
        icon={Wallet}
        title="الميزانية والسوق"
        hint={`الأسعار من مواقع متاجر الدولة المختارة بتاريخ ${PRICES_CHECKED_AT}. إذا اختلف السعر في متجرك، اكتب السعر الفعلي في قائمة المشتريات.`}
      >
        <Row label="الدولة" hint="المتاح الآن: قطر وعُمان. تغيير الدولة يحدّث الأسعار والعملة ويقترح ميزانية جديدة.">
          <Segmented<string>
            value={userProfile.country}
            onChange={setCountry}
            options={COUNTRIES.map((c) => ({ value: c.name, label: c.name }))}
          />
        </Row>
        <Row label="الميزانية الأسبوعية للأكل" hint={`بالعملة: ${userProfile.currency}`}>
          <input
            type="number"
            inputMode="decimal"
            step={countryCode === 'OM' ? 0.5 : 5}
            min={0}
            className={`${fieldClass} w-32 tabular-nums`}
            value={userProfile.foodBudgetWeekly}
            onChange={(e) => updateUserProfile({ foodBudgetWeekly: Math.max(0, Number(e.target.value) || 0) })}
          />
        </Row>
        <Row label="عدد الأشخاص في الميزانية">
          <Segmented<string>
            value={String(userProfile.budgetPersons)}
            onChange={(v) => updateUserProfile({ budgetPersons: Number(v) })}
            options={['1', '2', '3', '4'].map((n) => ({ value: n, label: n }))}
          />
        </Row>
      </Section>

      {/* 4. التمرين */}
      <Section icon={Dumbbell} title="التمرين">
        <Row label="نوع التمرين" hint="يتغيّر برنامجك الأسبوعي كاملاً حسب اختيارك.">
          <Segmented<LocationPreference>
            value={workoutLocation}
            onChange={setWorkoutLocation}
            options={(['gym', 'home', 'run', 'walk'] as LocationPreference[]).map((l) => ({ value: l, label: LOCATION_LABELS[l] }))}
          />
        </Row>
        <Row label="أيام التمرين في الأسبوع">
          <Segmented<string>
            value={String(userProfile.workoutDaysPerWeek)}
            onChange={(v) => setWorkoutDays(Number(v))}
            options={['2', '3', '4', '5', '6'].map((n) => ({ value: n, label: n }))}
          />
        </Row>
        <Row label="مدة الحصة" hint="بالدقائق">
          <Segmented<string>
            value={String(userProfile.sessionDurationMin)}
            onChange={(v) => updateUserProfile({ sessionDurationMin: Number(v) })}
            options={['30', '45', '60', '75'].map((n) => ({ value: n, label: n }))}
          />
        </Row>
      </Section>

      {/* 5. الصوت أثناء الحصة */}
      <Section icon={Volume2} title="الصوت أثناء الحصة">
        <Row label="الإرشاد الصوتي" hint="يمكنك تغييره أيضاً من داخل الحصة.">
          <Segmented<'full_guidance' | 'essential_beeps' | 'silent_visual'>
            value={audioMode}
            onChange={setAudioMode}
            options={[
              { value: 'full_guidance', label: 'إرشاد كامل' },
              { value: 'essential_beeps', label: 'تنبيهات فقط' },
              { value: 'silent_visual', label: 'صامت' },
            ]}
          />
        </Row>
      </Section>

      {/* 6. ملفي الكامل */}
      <button
        type="button"
        onClick={() => setIsOnboardingOpen(true)}
        className="w-full rounded-2xl border border-slate-200 bg-white p-5 flex items-center justify-between gap-3 hover:border-emerald-600 transition-colors text-right"
      >
        <div>
          <div className="font-extrabold text-slate-900">تعديل ملفي الكامل</div>
          <div className="text-xs text-slate-500 mt-1">الهدف، الوزن، المستوى، الإصابات، الحساسية، وما تحب وما لا تحب من الأكل.</div>
        </div>
        <ChevronLeft className="w-5 h-5 text-slate-400 shrink-0" />
      </button>

      {/* 7. بياناتي */}
      <Section icon={Database} title="بياناتي">
        <Row label="الحفظ">{syncBadge}</Row>
        <Row label="تنزيل نسخة من بياناتي" hint="ملف فيه ملفك وخطتك ومشترياتك وتقدّمك.">
          <button
            type="button"
            onClick={downloadData}
            className="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-bold flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> تنزيل
          </button>
        </Row>

        <div className="border-t border-slate-100 pt-5 space-y-3">
          <Row label="البدء من جديد" hint="يمسح خطتك ومشترياتك وتقدّمك، ويبقى حسابك.">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="h-10 px-4 rounded-xl border border-amber-300 text-amber-800 hover:bg-amber-50 text-sm font-bold flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> إعادة الضبط
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetAllData();
                    setConfirmReset(false);
                  }}
                  className="h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold"
                >
                  نعم، ابدأ من جديد
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="h-10 px-4 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-bold"
                >
                  تراجع
                </button>
              </div>
            )}
          </Row>

          <Row label="حذف الحساب" hint="يحذف حسابك وكل بياناتك نهائياً، ولا يمكن التراجع.">
            {!deleteOpen && (
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="h-10 px-4 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-sm font-bold flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> حذف الحساب
              </button>
            )}
          </Row>
          {deleteOpen && (
            <form onSubmit={deleteAccount} className="rounded-xl border border-rose-300 p-4 space-y-3">
              <p className="text-sm text-slate-700">للتأكيد، اكتب كلمة المرور ثم اضغط «احذف نهائياً».</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  className={`${fieldClass} flex-1 text-left`}
                  dir="ltr"
                  type="password"
                  autoComplete="current-password"
                  value={deletePw}
                  onChange={(e) => setDeletePw(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={deleteBusy || !deletePw}
                  className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2"
                >
                  {deleteBusy && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                  <span>احذف نهائياً</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteOpen(false);
                    setDeletePw('');
                    setDeleteMsg(null);
                  }}
                  className="h-10 px-4 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-bold"
                >
                  تراجع
                </button>
              </div>
              {deleteMsg && <Notice tone="warn">{deleteMsg}</Notice>}
            </form>
          )}
        </div>
      </Section>

      {/* 8. عن التطبيق */}
      <Section icon={Info} title="عن «على قدّك»">
        <p className="text-sm text-slate-600 leading-relaxed">
          منصة توعوية للأكل والتمرين حسب ميزانيتك ومستواك. لا تقدّم تشخيصاً أو علاجاً طبياً. إذا شعرت بألم حاد أو دوخة أثناء
          التمرين فتوقف فوراً، وراجع طبيباً إذا استمر.
        </p>
      </Section>
    </div>
  );
};
