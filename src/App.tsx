/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { AppProvider, useApp, SavedAppData } from './context/AppContext';
import { AuthScreen } from './components/AuthScreen';
import { SettingsView } from './components/SettingsView';
import { api, ApiError, AuthUser } from './lib/api';
import { Loader2, RefreshCw } from 'lucide-react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { TodayView } from './components/TodayView';
import { NutritionView } from './components/NutritionView';
import { ShoppingView } from './components/ShoppingView';
import { WorkoutPlanView } from './components/WorkoutPlanView';
import { ExerciseLibraryView } from './components/ExerciseLibraryView';
import { ProgressView } from './components/ProgressView';
import { AdminView } from './components/AdminView';
import { LiveWorkoutModal } from './components/LiveWorkoutModal';
import { AICoachDrawer } from './components/AICoachDrawer';
import { OnboardingModal } from './components/OnboardingModal';
import { MessageSquareText, Shield, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, isAdminMode, setIsChatDrawerOpen, isOnboardingOpen } = useApp();

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-slate-800 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Global Navigation Header */}
      <Header />

      {/* 2. Main Page Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {isAdminMode ? (
          <AdminView />
        ) : (
          <>
            {activeTab === 'today' && <TodayView />}
            {activeTab === 'nutrition' && <NutritionView />}
            {activeTab === 'workout' && <WorkoutPlanView />}
            {activeTab === 'shopping' && <ShoppingView />}
            {activeTab === 'library' && <ExerciseLibraryView />}
            {activeTab === 'progress' && <ProgressView />}
            {activeTab === 'settings' && <SettingsView />}
          </>
        )}
      </main>

      {/* 3. Floating AI Assistant Quick Trigger */}
      <button
        onClick={() => setIsChatDrawerOpen(true)}
        className="fixed bottom-20 lg:bottom-6 left-5 z-30 h-12 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all"
        aria-label="محادثة كابتن على قدّك"
      >
        <MessageSquareText className="w-5 h-5 text-amber-300" />
        <span className="hidden sm:inline">كابتن على قدّك</span>
      </button>

      {/* 4. Desktop Footer */}
      <footer className="hidden lg:block border-t border-slate-200/80 bg-white/60 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">على قدّك</span>
            <span>·</span>
            <span>«غذاؤك حسب ميزانيتك، وتمرينك حسب مستواك»</span>
          </div>

          <p className="text-[11px] text-slate-400 text-center sm:text-right max-w-xl">
            منصة رياضية وتوعوية. لا تقدم المنصة تشخيصاً أو علاجاً طبياً، وتتوقف الحصص فورياً عند تسجيل ألم مفصلي أو دوخة للحفاظ على سلامتك.
          </p>
        </div>
      </footer>

      {/* 5. Mobile Ergonomic Bottom Bar */}
      <BottomNav />

      {/* 6. Modals & Drawers */}
      <LiveWorkoutModal />
      <AICoachDrawer />
      {isOnboardingOpen && <OnboardingModal />}
    </div>
  );
};

type Session =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'signed_out' }
  | { status: 'signed_in'; user: AuthUser; data: Partial<SavedAppData> | null; savedAt: number | null };

const FullScreenMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#fbfbf9] flex flex-col items-center justify-center gap-4 px-6 text-center text-slate-600">
    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
      ع
    </div>
    {children}
  </div>
);

export default function App() {
  const [session, setSession] = useState<Session>({ status: 'loading' });

  const loadAccount = useCallback(async (knownUser?: AuthUser) => {
    setSession({ status: 'loading' });
    try {
      const user = knownUser ?? (await api.me()).user;
      const state = await api.getState();
      setSession({
        status: 'signed_in',
        user,
        data: (state.data as Partial<SavedAppData> | null) ?? null,
        savedAt: state.updatedAt,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setSession({ status: 'signed_out' });
      else setSession({ status: 'error', message: err instanceof Error ? err.message : 'تعذر تحميل حسابك.' });
    }
  }, []);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const handleUserChange = useCallback((user: AuthUser) => {
    setSession((prev) => (prev.status === 'signed_in' ? { ...prev, user } : prev));
  }, []);

  const handleLoggedOut = useCallback(() => setSession({ status: 'signed_out' }), []);

  if (session.status === 'loading') {
    return (
      <FullScreenMessage>
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <p className="text-sm">جارٍ تحميل خطتك…</p>
      </FullScreenMessage>
    );
  }

  if (session.status === 'error') {
    return (
      <FullScreenMessage>
        <p className="text-sm max-w-sm">{session.message}</p>
        <button
          onClick={() => loadAccount()}
          className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4 text-white" />
          <span>حاول مجدداً</span>
        </button>
      </FullScreenMessage>
    );
  }

  if (session.status === 'signed_out') {
    return <AuthScreen onAuthenticated={(user) => loadAccount(user)} />;
  }

  return (
    <AppProvider
      key={session.user.id}
      user={session.user}
      initialData={session.data}
      initialSavedAt={session.savedAt}
      onUserChange={handleUserChange}
      onLoggedOut={handleLoggedOut}
    >
      <AppContent />
    </AppProvider>
  );
}
