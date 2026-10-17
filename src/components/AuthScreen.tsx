import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, Wallet, Dumbbell, ShoppingCart, MessageSquareText } from 'lucide-react';
import { api, ApiError, AuthUser } from '../lib/api';

interface Props {
  onAuthenticated: (user: AuthUser, isNew: boolean) => void;
}

export const AuthScreen: React.FC<Props> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchMode = (next: 'register' | 'login') => {
    setMode(next);
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === 'register' && !name.trim()) return setError('اكتب اسمك.');
    if (!email.trim()) return setError('اكتب بريدك الإلكتروني.');
    if (mode === 'register' && password.length < 8) return setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل.');
    setBusy(true);
    try {
      if (mode === 'register') {
        const { user } = await api.register(name.trim(), email.trim(), password);
        onAuthenticated(user, true);
      } else {
        const { user } = await api.login(email.trim(), password);
        onAuthenticated(user, false);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'حدث خطأ غير متوقع. حاول مرة أخرى.';
      setError(message);
      if (err instanceof ApiError && err.status === 409) setMode('login');
    } finally {
      setBusy(false);
    }
  };

  const features = [
    { icon: Wallet, title: 'أكلك على قدّ ميزانيتك', text: 'خطة أسبوعية بوجبات اقتصادية، وزر «أرخص» لأي وجبة.' },
    { icon: Dumbbell, title: 'تمرينك على قدّ مستواك', text: 'برنامج للصالة أو البيت، مع مؤقت راحة وبدائل للأجهزة.' },
    { icon: ShoppingCart, title: 'قائمة مشتريات جاهزة', text: 'تعرف كم ستدفع قبل أن تذهب إلى السوق.' },
    { icon: MessageSquareText, title: 'كابتن يجيبك', text: 'اسأله عن بديل وجبة أو تمرين في أي وقت.' },
  ];

  const inputClass =
    'w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition';

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-slate-800 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
        {/* التعريف */}
        <div className="contents lg:block lg:space-y-8">
          <div className="order-1 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              ع
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">على قدّك</h1>
              <p className="text-sm font-medium text-emerald-700">غذاؤك حسب ميزانيتك، وتمرينك حسب مستواك</p>
            </div>
          </div>

          <div className="order-3 grid sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{f.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* النموذج */}
        <div className="order-2 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-2 text-sm mb-6">
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`h-10 rounded-lg font-bold transition-colors ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              حساب جديد
            </button>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`h-10 rounded-lg font-bold transition-colors ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              تسجيل الدخول
            </button>
          </div>

          <h2 className="text-xl font-extrabold text-slate-900">
            {mode === 'register' ? 'افتح حسابك مجاناً' : 'أهلاً بعودتك'}
          </h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            {mode === 'register'
              ? 'دقيقة واحدة، ثم نبني خطتك حسب ميزانيتك ومستواك.'
              : 'ادخل ببريدك لتكمل خطتك من حيث توقفت.'}
          </p>

          <form onSubmit={submit} className="space-y-4" noValidate>
            {mode === 'register' && (
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">الاسم</span>
                <input
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="اسمك كما تحب أن نناديك"
                  maxLength={60}
                />
              </label>
            )}

            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">البريد الإلكتروني</span>
              <input
                className={`${inputClass} text-left`}
                dir="ltr"
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="name@example.com"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">كلمة المرور</span>
              <div className="relative">
                <input
                  className={`${inputClass} text-left pl-12`}
                  dir="ltr"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  placeholder={mode === 'register' ? '8 أحرف على الأقل' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-700"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </label>

            {error && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-bold text-base flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {busy && <Loader2 className="w-5 h-5 animate-spin text-white" />}
              <span>{mode === 'register' ? 'افتح حسابي' : 'دخول'}</span>
            </button>
          </form>

          <p className="text-xs text-slate-400 mt-6 leading-relaxed">
            {mode === 'register' ? 'عندك حساب؟ ' : 'ليس لديك حساب؟ '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'register' ? 'login' : 'register')}
              className="font-bold text-emerald-700 hover:underline"
            >
              {mode === 'register' ? 'سجّل الدخول' : 'افتح حساباً جديداً'}
            </button>
            <span className="block mt-2">
              بياناتك محفوظة في حسابك، وتصل إليها من أي جهاز. «على قدّك» منصة توعوية ولا تغني عن استشارة الطبيب.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
