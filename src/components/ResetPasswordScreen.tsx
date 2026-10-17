import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';
import { api, ApiError, AuthUser } from '../lib/api';

interface Props {
  token: string;
  onDone: (user: AuthUser) => void;
  onCancel: () => void;
}

export const ResetPasswordScreen: React.FC<Props> = ({ token, onDone, onCancel }) => {
  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid'>('checking');
  const [who, setWho] = useState<{ name: string; email: string } | null>(null);
  const [invalidMsg, setInvalidMsg] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .checkReset(token)
      .then((res) => {
        setWho(res);
        setStatus('ready');
      })
      .catch((err) => {
        setInvalidMsg(err instanceof ApiError ? err.message : 'تعذر التحقق من الرابط.');
        setStatus('invalid');
      });
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل.');
    if (password !== confirm) return setError('كلمتا المرور غير متطابقتين.');
    setBusy(true);
    try {
      const { user } = await api.completeReset(token, password);
      onDone(user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر حفظ كلمة المرور.');
      setBusy(false);
    }
  };

  const inputClass =
    'w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 text-left placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition';

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-slate-800 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">كلمة مرور جديدة</h1>
            <p className="text-xs text-emerald-700 font-semibold">على قدّك</p>
          </div>
        </div>

        {status === 'checking' && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحقق من الرابط…
          </div>
        )}

        {status === 'invalid' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{invalidMsg}</div>
            <button
              type="button"
              onClick={onCancel}
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              العودة إلى تسجيل الدخول
            </button>
          </div>
        )}

        {status === 'ready' && who && (
          <form onSubmit={submit} className="space-y-4" noValidate>
            <p className="text-sm text-slate-600 leading-relaxed">
              أهلاً {who.name}. اختر كلمة مرور جديدة لحسابك{' '}
              <span dir="ltr" className="font-semibold text-slate-800">
                {who.email}
              </span>
              .
            </p>
            <div className="relative">
              <input
                className={`${inputClass} pl-12`}
                dir="ltr"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="8 أحرف على الأقل"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-700"
                aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <input
              className={inputClass}
              dir="ltr"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="أعد كتابتها للتأكيد"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {error && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-bold flex items-center justify-center gap-2"
            >
              {busy && <Loader2 className="w-5 h-5 animate-spin text-white" />}
              <span>حفظ والدخول</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
