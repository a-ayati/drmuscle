import React from 'react';
import { useApp } from '../context/AppContext';
import { Dumbbell, User, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, startLiveWorkout, setIsOnboardingOpen, isAdminMode, setIsAdminMode } = useApp();

  const navItems = [
    { id: 'today', label: 'اليوم' },
    { id: 'nutrition', label: 'خطة الغذاء والميزانية' },
    { id: 'workout', label: 'برنامج التمارين' },
    { id: 'shopping', label: 'قائمة المشتريات' },
    { id: 'library', label: 'دليل الأجهزة' },
    { id: 'progress', label: 'التقدم والمراجعة' },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#fbfbf9]/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('today')}
            className="text-right group flex items-center gap-2.5 focus:outline-none"
            aria-label="الرئيسية منصة على قدّك"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-emerald-700 transition-colors">
              ع
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-tight">
                على قدّك
              </span>
              <span className="text-[11px] font-medium text-emerald-700 block leading-tight">
                غذاؤك حسب ميزانيتك، وتمرينك حسب مستواك
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 relative ${
                  isActive
                    ? 'text-emerald-700 font-bold border-b-2 border-emerald-600'
                    : 'hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Profile Control */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors hidden sm:flex items-center gap-1.5 ${
              isAdminMode
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'text-slate-500 hover:text-slate-800 border-slate-200'
            }`}
            title="وضع الإدارة لمراجعة التكاليف والمحتوى"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden xl:inline">{isAdminMode ? 'الإدارة (نشط)' : 'لوحة الإدارة'}</span>
          </button>

          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="تعديل الملف الشخصي والميزانية"
            aria-label="تعديل الملف الشخصي"
          >
            <User className="w-5 h-5" />
          </button>

          <button
            onClick={() => startLiveWorkout()}
            className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-sm font-semibold flex items-center gap-2 transition-all shadow-sm whitespace-nowrap"
          >
            <Dumbbell className="w-4 h-4" />
            <span>ابدأ حصتي</span>
          </button>
        </div>

      </div>
    </header>
  );
};
