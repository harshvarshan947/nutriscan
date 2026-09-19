import React from 'react';
import { Home, Scan, Calendar, Clock, Star, User } from 'lucide-react';

export type NavTab = 'home' | 'scan' | 'tracking' | 'history' | 'favorites' | 'profile';

interface BottomNavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  favoritesCount?: number;
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({
  activeTab,
  onTabChange,
  favoritesCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-lg pb-safe transition-colors shadow-lg">
      <div className="max-w-md mx-auto px-3 h-16 flex items-center justify-between relative">
        {/* Home */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'home'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Today's Intake / Tracking */}
        <button
          onClick={() => onTabChange('tracking')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'tracking'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Intake</span>
        </button>

        {/* Center Scanner Action Button */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={() => onTabChange('scan')}
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 ${
              activeTab === 'scan'
                ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950 scale-105'
                : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white hover:shadow-emerald-500/30'
            }`}
            aria-label="Scan Product"
          >
            <Scan className="w-6 h-6 stroke-[2.5]" />
            <span className="text-[9px] font-bold mt-0.5">SCAN</span>
          </button>
        </div>

        {/* History */}
        <button
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'history'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">History</span>
        </button>

        {/* Favorites */}
        <button
          onClick={() => onTabChange('favorites')}
          className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
            activeTab === 'favorites'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Star className="w-5 h-5 mb-0.5" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {favoritesCount > 9 ? '9+' : favoritesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Favorites</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'profile'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};
