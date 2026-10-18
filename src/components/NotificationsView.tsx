import React, { useEffect, useMemo } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, Dumbbell, Utensils, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { AppNotification } from '../types';

const KIND: Record<AppNotification['kind'], { icon: React.ElementType; cls: string; label: string }> = {
  success: { icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700', label: 'إنجاز' },
  warning: { icon: AlertTriangle, cls: 'bg-amber-50 text-amber-800', label: 'تنبيه' },
  info: { icon: Info, cls: 'bg-sky-50 text-sky-600', label: 'معلومة' },
  workout: { icon: Dumbbell, cls: 'bg-emerald-50 text-emerald-700', label: 'تمرين' },
  meal: { icon: Utensils, cls: 'bg-emerald-50 text-emerald-700', label: 'أكل' },
  budget: { icon: Wallet, cls: 'bg-amber-50 text-amber-800', label: 'ميزانية' },
};

const dayKey = (ms: number) => new Date(ms).toDateString();

function dayLabel(ms: number): string {
  const d = new Date(ms);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  if (d.toDateString() === today.toDateString()) return 'اليوم';
  if (d.toDateString() === yesterday.toDateString()) return 'أمس';
  return d.toLocaleDateString('ar-u-nu-latn', { weekday: 'long', day: 'numeric', month: 'long' });
}

const time = (ms: number) => new Date(ms).toLocaleTimeString('ar-u-nu-latn', { hour: '2-digit', minute: '2-digit' });

export const NotificationsView: React.FC = () => {
  const { notifications, markAllNotificationsRead } = useApp();

  // نُبقي الجديد مميزاً أثناء فتح الصفحة، ونعلّمه مقروءاً عند مغادرتها
  const unreadIds = useMemo(() => new Set(notifications.filter((n) => !n.read).map((n) => n.id)), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => markAllNotificationsRead(), [markAllNotificationsRead]);

  const groups = useMemo(() => {
    const map = new Map<string, AppNotification[]>();
    for (const n of notifications) {
      const k = dayKey(n.createdAt);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(n);
    }
    return [...map.values()];
  }, [notifications]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-28 lg:pb-10">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">الإشعارات</h1>
          <p className="text-sm text-slate-500 mt-1">كل ما يحدث في حسابك محفوظ هنا.</p>
        </div>
        {unreadIds.size > 0 && (
          <span className="text-xs font-bold text-white bg-emerald-600 rounded-full px-3 py-1 tabular-nums">{unreadIds.size} جديد</span>
        )}
      </div>

      {notifications.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-600">لا توجد إشعارات بعد. ستظهر هنا خطة كل يوم وتنبيهات الميزانية وحصصك المنجزة.</p>
        </div>
      )}

      {groups.map((items) => (
        <section key={dayKey(items[0].createdAt)} className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 px-1">{dayLabel(items[0].createdAt)}</h2>
          <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
            {items.map((n) => {
              const k = KIND[n.kind] ?? KIND.info;
              const Icon = k.icon;
              const isNew = unreadIds.has(n.id);
              return (
                <article key={n.id} className={`p-4 flex gap-3 ${isNew ? 'bg-emerald-50/50' : ''}`}>
                  <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${k.cls}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {isNew && <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 ml-1.5 align-middle" aria-label="جديد" />}
                        {n.title}
                      </h3>
                      <span className="text-[11px] text-slate-500 shrink-0 tabular-nums">{time(n.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{n.body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
