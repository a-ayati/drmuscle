import React from 'react';
import { Building2, Home, Footprints, Wind } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LOCATION_LABELS } from '../data/workouts';
import type { LocationPreference } from '../types';

const ICONS: Record<LocationPreference, React.ElementType> = {
  gym: Building2,
  home: Home,
  run: Wind,
  walk: Footprints,
};

/** اختيار نوع التمرين: الصالة، البيت، الجري، المشي. */
export const LocationPicker: React.FC<{ tone?: 'light' | 'onDark' }> = ({ tone = 'light' }) => {
  const { workoutLocation, setWorkoutLocation } = useApp();
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="نوع التمرين">
      {(['gym', 'home', 'run', 'walk'] as LocationPreference[]).map((loc) => {
        const Icon = ICONS[loc];
        const active = workoutLocation === loc;
        const base = 'h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors';
        const cls = active
          ? 'bg-emerald-600 border-emerald-600 text-white'
          : tone === 'onDark'
          ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
        return (
          <button
            key={loc}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setWorkoutLocation(loc)}
            className={`${base} ${cls}`}
          >
            <Icon className={`w-4 h-4 ${active ? 'text-white' : ''}`} />
            <span>{LOCATION_LABELS[loc]}</span>
          </button>
        );
      })}
    </div>
  );
};
