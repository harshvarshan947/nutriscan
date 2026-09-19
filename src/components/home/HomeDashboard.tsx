import React, { useState, useEffect } from 'react';
import {
  ScanLine,
  Search,
  Sparkles,
  Flame,
  Dumbbell,
  Clock,
  Star,
  ChevronRight,
  ShieldCheck,
  Package,
  Layers,
} from 'lucide-react';
import { ScannedHistoryItem, MealLogEntry } from '../../types/tracking';
import { UserProfile } from '../../types/profile';
import { storageService } from '../../services/storageService';
import { SAMPLE_PRODUCTS } from '../../data/sampleProducts';
import { calculateUserTargets } from '../../engine/tdeeCalculator';
import { getTodayDateString, formatNumber } from '../../utils/formatters';

interface HomeDashboardProps {
  userProfile: UserProfile;
  onOpenScanner: () => void;
  onOpenSearch: () => void;
  onSelectProduct: (barcode: string) => void;
  onNavigateToIntake: () => void;
  onOpenDisclaimer: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  userProfile,
  onOpenScanner,
  onOpenSearch,
  onSelectProduct,
  onNavigateToIntake,
  onOpenDisclaimer,
}) => {
  const [recentScans, setRecentScans] = useState<ScannedHistoryItem[]>([]);
  const [todayMeals, setTodayMeals] = useState<MealLogEntry[]>([]);

  const targets = calculateUserTargets(userProfile);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const history = await storageService.getRecentHistory(5);
        setRecentScans(history);
        const meals = await storageService.getMealsForDate(getTodayDateString());
        setTodayMeals(meals);
      } catch (e) {
        console.error('Error loading home data', e);
      }
    };
    loadHomeData();
  }, []);

  const todayCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const todayProtein = todayMeals.reduce((sum, m) => sum + m.protein, 0);

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
    if (score >= 65) return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300';
    if (score >= 45) return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 pb-24 p-4">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 shadow-xl">
        <div className="relative z-10 space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-emerald-100 mb-2 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" /> Instant Food Transparency
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Know what's in your food.
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-md mt-1 leading-relaxed">
              Scan any packaged food barcode for immediate nutrition ratings, ingredient insights, and transparent health estimates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              onClick={onOpenScanner}
              className="flex-1 py-3.5 px-5 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 active:scale-98 font-bold text-sm shadow-lg shadow-black/10 flex items-center justify-center gap-2 transition-all"
            >
              <ScanLine className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
              Scan Product Barcode
            </button>

            <button
              onClick={onOpenSearch}
              className="py-3.5 px-5 rounded-2xl bg-emerald-800/80 hover:bg-emerald-800 active:scale-98 text-white font-semibold text-sm border border-emerald-500/40 flex items-center justify-center gap-2 transition-all"
            >
              <Search className="w-4 h-4" />
              Search by Name
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Today's Intake Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Today's Nutrition Summary
            </h3>
          </div>

          <button
            onClick={onNavigateToIntake}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
          >
            View Details <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
              Calories Consumed
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {todayCalories.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">
                / {targets.targetCalories} kcal
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((todayCalories / targets.targetCalories) * 100))}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
              Protein Intake
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {formatNumber(todayProtein)}
              </span>
              <span className="text-xs text-slate-400">
                / {targets.targetProtein} g
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((todayProtein / targets.targetProtein) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Test Barcodes Carousel / Shelf */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Instant Demo Products
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">Tap to analyze</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {Object.entries(SAMPLE_PRODUCTS).slice(0, 4).map(([barcode, p]) => (
            <div
              key={barcode}
              onClick={() => onSelectProduct(barcode)}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/60 cursor-pointer transition-all active:scale-95 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-700 p-1 border border-slate-200 dark:border-slate-600 flex items-center justify-center mb-1.5">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                ) : (
                  <Package className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase truncate max-w-full">
                {p.brand}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Scans Section */}
      {recentScans.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Recent Scans
              </h3>
            </div>
          </div>

          <div className="space-y-2">
            {recentScans.map((item) => (
              <div
                key={`${item.barcode}-${item.scannedAt}`}
                onClick={() => onSelectProduct(item.barcode)}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 p-1 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <Package className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
                      {item.brand}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {item.name}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${getScoreBadge(item.qualityScore)}`}>
                    {item.qualityScore}/100
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safety Notice Card */}
      <div
        onClick={onOpenDisclaimer}
        className="p-4 rounded-3xl bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-500/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
            NutriScan provides educational nutrition analysis and does not constitute medical advice.
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
      </div>
    </div>
  );
};
