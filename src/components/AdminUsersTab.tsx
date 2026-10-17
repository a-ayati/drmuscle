import React, { useEffect, useState } from 'react';
import { Loader2, KeyRound, Copy, Check, MessageCircle, RefreshCw, Users } from 'lucide-react';
import { api, ApiError } from '../lib/api';

type AdminUser = { id: string; email: string; name: string; createdAt: number; lastSavedAt: number | null };
type ResetLink = { userId: string; url: string; expiresAt: number; name: string };

const fmt = (ms: number) => new Date(ms).toLocaleString('ar-u-nu-latn', { dateStyle: 'medium', timeStyle: 'short' });
const fmtTime = (ms: number) => new Date(ms).toLocaleTimeString('ar-u-nu-latn', { hour: '2-digit', minute: '2-digit' });

export const AdminUsersTab: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [link, setLink] = useState<ResetLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState('');

  const load = () => {
    setError(null);
    setUsers(null);
    api
      .adminUsers()
      .then((r) => setUsers(r.users))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'تعذر تحميل المستخدمين.'));
  };

  useEffect(load, []);

  const makeLink = async (u: AdminUser) => {
    setBusyId(u.id);
    setCopied(false);
    try {
      const r = await api.adminResetLink(u.id);
      setLink({ userId: u.id, url: r.url, expiresAt: r.expiresAt, name: r.name });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر إنشاء الرابط.');
    } finally {
      setBusyId(null);
    }
  };

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const whatsappText = link
    ? `أهلاً ${link.name}، هذا رابط لاختيار كلمة مرور جديدة لحسابك في «على قدّك». صالح حتى الساعة ${fmtTime(
        link.expiresAt
      )} ولمرة واحدة:\n${link.url}`
    : '';

  const filtered = (users || []).filter((u) => {
    const q = query.trim().toLowerCase();
    return !q || u.name.toLowerCase().includes(q) || u.email.includes(q);
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-base">المستخدمون</h3>
          {users && <span className="text-xs text-slate-500 tabular-nums">({users.length})</span>}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث بالاسم أو البريد"
            className="h-10 w-full sm:w-56 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={load}
            className="h-10 w-10 shrink-0 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center"
            aria-label="تحديث"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        إذا نسي أحدهم كلمة المرور، اضغط «رابط استرجاع» بجانب اسمه وأرسل له الرابط. الرابط صالح لساعة واحدة ولمرة واحدة، وإنشاء
        رابط جديد يلغي السابق.
      </p>

      {link && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
          <div className="text-sm font-bold text-emerald-900">
            رابط استرجاع لـ {link.name} · صالح حتى {fmtTime(link.expiresAt)}
          </div>
          <div dir="ltr" className="text-xs break-all rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700">
            {link.url}
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
              target="_blank"
              rel="noreferrer"
              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-white" /> إرسال عبر واتساب
            </a>
            <button
              type="button"
              onClick={copy}
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-sm font-bold flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'تم النسخ' : 'نسخ الرابط'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>
      )}

      {!users && !error && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" /> جارٍ التحميل…
        </div>
      )}

      {users && (
        <div className="divide-y divide-slate-100">
          {filtered.map((u) => (
            <div key={u.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                <div dir="ltr" className="text-xs text-slate-600 text-right truncate">
                  {u.email}
                </div>
                <div className="text-[11px] text-slate-500">
                  انضم {fmt(u.createdAt)}
                  {u.lastSavedAt ? ` · آخر نشاط ${fmt(u.lastSavedAt)}` : ''}
                </div>
              </div>
              <button
                type="button"
                onClick={() => makeLink(u)}
                disabled={busyId === u.id}
                className="h-10 px-4 shrink-0 self-start sm:self-auto rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-bold flex items-center gap-2"
              >
                {busyId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                رابط استرجاع
              </button>
            </div>
          ))}
          {filtered.length === 0 && <div className="py-6 text-sm text-slate-500 text-center">لا يوجد مستخدمون مطابقون.</div>}
        </div>
      )}
    </div>
  );
};
