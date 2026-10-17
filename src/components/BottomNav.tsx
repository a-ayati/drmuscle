import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Utensils, Dumbbell, ShoppingCart, MessageSquareText } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsChatDrawerOpen } = useApp();

  const tabs = [
    { id: 'today', label: 'اليوم', icon: Home },
    { id: 'nutrition', label: 'الغذاء', icon: Utensils },
    { id: 'workout', label: 'التمارين', icon: Dumbbell },
    { id: 'shopping', label: 'المشتريات', icon: ShoppingCart },
    { id: 'coach', label: 'المساعد', icon: MessageSquareText, isDrawer: true },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fbfbf9]/95 backdrop-blur-md border-t border-slate-200/90 pb-safe">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = !tab.isDrawer && activeTab === tab.id;

          const handleClick = () => {
            if (tab.isDrawer) {
              setIsChatDrawerOpen(true);
            } else {
              setActiveTab(tab.id);
            }
          };

          return (
            <button
              key={tab.id}
              onClick={handleClick}
              className={`min-h-[48px] min-w-[44px] flex flex-col items-center justify-center transition-colors focus:outline-none ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              <span className="text-[11px] tracking-tight mt-1 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
