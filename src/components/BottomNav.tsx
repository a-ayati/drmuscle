import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Utensils, Dumbbell, ShoppingCart, MessageSquareText } from 'lucide-react';

/**
 * شريط تنقل عائم وزجاجي للهاتف (على طريقة إنستغرام في الآيفون):
 * كبسولة معلّقة فوق المحتوى، بخلفية ضبابية شفافة، وأيقونات فقط مع فقاعة خفيفة خلف المختار.
 */
export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsChatDrawerOpen, isAdminMode, setIsAdminMode } = useApp();

  const tabs = [
    { id: 'today', label: 'اليوم', icon: Home },
    { id: 'nutrition', label: 'الغذاء', icon: Utensils },
    { id: 'workout', label: 'التمارين', icon: Dumbbell },
    { id: 'shopping', label: 'المشتريات', icon: ShoppingCart },
    { id: 'coach', label: 'الكابتن', icon: MessageSquareText, isDrawer: true },
  ];

  return (
    <nav
      aria-label="التنقل الرئيسي"
      className="lg:hidden fixed inset-x-0 z-40 flex justify-center px-4 pointer-events-none"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
    >
      <div className="glass-bar pointer-events-auto w-full max-w-sm h-16 rounded-full grid grid-cols-5 items-center px-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = !tab.isDrawer && !isAdminMode && activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => {
                if (tab.isDrawer) {
                  setIsChatDrawerOpen(true);
                } else {
                  setIsAdminMode(false);
                  setActiveTab(tab.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="relative h-12 mx-0.5 flex items-center justify-center rounded-full focus:outline-none active:scale-90 transition-transform"
            >
              <span
                aria-hidden="true"
                className={`absolute inset-0 rounded-full transition-all duration-300 ${
                  isActive ? 'glass-pill opacity-100 scale-100' : 'opacity-0 scale-75'
                }`}
              />
              <Icon
                className={`relative w-6 h-6 transition-colors ${
                  isActive ? 'text-slate-900 stroke-[2.4]' : 'text-slate-600 stroke-[1.9]'
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
};
