import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Plus,
  Flame,
  Dumbbell,
  Sparkles,
  PieChart as PieChartIcon,
  Package,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { MealLogEntry, MealType } from '../../types/tracking';
import { UserProfile } from '../../types/profile';
import { storageService } from '../../services/storageService';
import { calculateUserTargets } from '../../engine/tdeeCalculator';
import { getTodayDateString, formatNumber } from '../../utils/formatters';

interface DailyIntakeDashboardProps {
  userProfile: UserProfile;
  onOpenScanner: () => void;
  onSelectProduct: (barcode: string) => void;
}

export const DailyIntakeDashboard: React.FC<DailyIntakeDashboardProps> = ({
  userProfile,
  onOpenScanner,
  onSelectProduct,
}) => {
  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());
  const [meals, setMeals] = useState<MealLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const targets = calculateUserTargets(userProfile);

  const loadMeals = async (dateStr: string) => {
    setIsLoading(true);
    try {
      const data = await storageService.getMealsForDate(dateStr);
      setMeals(data);
    } catch (e) {
      console.error('Error loading meals', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMeals(currentDate);
  }, [currentDate]);

  const handleDeleteEntry = async (id: string) => {
    await storageService.deleteMealLog(id);
    loadMeals(currentDate);
  };

  const changeDate = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setCurrentDate(`${year}-${month}-${day}`);
  };

  // Calculate totals
  const totals = meals.reduce(
    (acc, m) => {
      acc.calories += m.calories;
      acc.protein += m.protein;
      acc.carbs += m.carbohydrates;
      acc.sugars += m.sugars;
      acc.fat += m.fat;
      acc.satFat += m.saturatedFat;
      acc.fiber += m.fiber;
      acc.sodium += m.sodium;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, sugars: 0, fat: 0, satFat: 0, fiber: 0, sodium: 0 }
  );

  // Macro calorie breakdown data for Recharts
  const proteinCal = totals.protein * 4;
  const carbsCal = totals.carbs * 4;
  const fatCal = totals.fat * 9;
  const totalMacroCal = proteinCal + carbsCal + fatCal;

  const chartData = [
    { name: 'Protein', value: proteinCal, color: '#6366f1', grams: totals.protein },
    { name: 'Carbs', value: carbsCal, color: '#f59e0b', grams: totals.carbs },
    { name: 'Fat', value: fatCal, color: '#10b981', grams: totals.fat },
  ].filter((d) => d.value > 0);

  const mealGroups: { type: MealType; label: string; emoji: string }[] = [
    { type: 'breakfast', label: 'Breakfast', emoji: '🍳' },
    { type: 'lunch', label: 'Lunch', emoji: '🥗' },
    { type: 'dinner', label: 'Dinner', emoji: '🍲' },
    { type: 'snack', label: 'Snacks', emoji: '🍎' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 pb-24 p-4">
      {/* Date Switcher Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => changeDate(-1)}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-center">
          <CalendarIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-bold text-sm text-slate-900 dark:text-white">
            {currentDate === getTodayDateString() ? "Today's Intake" : currentDate}
          </span>
        </div>

        <button
          onClick={() => changeDate(1)}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Overview Energy & Target Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Daily Energy Target
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {totals.calories.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-slate-400">
                / {targets.targetCalories.toLocaleString()} kcal
              </span>
            </div>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
            <Flame className="w-7 h-7" />
          </div>
        </div>

        {/* Calories Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.round((totals.calories / targets.targetCalories) * 100))}%` }}
          />
        </div>

        {/* Macro Nutrient Targets Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Protein */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold">Protein</span>
              <Dumbbell className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {formatNumber(totals.protein)} / {targets.targetProtein}g
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${Math.min(100, Math.round((totals.protein / targets.targetProtein) * 100))}%` }}
              />
            </div>
          </div>

          {/* Fiber */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold">Fiber</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {formatNumber(totals.fiber)} / {targets.targetFiber}g
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(100, Math.round((totals.fiber / targets.targetFiber) * 100))}%` }}
              />
            </div>
          </div>

          {/* Sugar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold">Sugars</span>
              <span className="text-[10px] text-slate-400">max</span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {formatNumber(totals.sugars)} / {targets.targetSugars}g
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${totals.sugars > targets.targetSugars ? 'bg-rose-500' : 'bg-amber-400'}`}
                style={{ width: `${Math.min(100, Math.round((totals.sugars / targets.targetSugars) * 100))}%` }}
              />
            </div>
          </div>

          {/* Sodium */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold">Sodium</span>
              <span className="text-[10px] text-slate-400">limit</span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {totals.sodium} / {targets.targetSodium}mg
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${totals.sodium > targets.targetSodium ? 'bg-rose-500' : 'bg-cyan-500'}`}
                style={{ width: `${Math.min(100, Math.round((totals.sodium / targets.targetSodium) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Macro Distribution Donut Chart if meals are logged */}
        {totalMacroCal > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 mb-2">
              <PieChartIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Calorie Breakdown by Macronutrient
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-4">
              <div className="w-36 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={54}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `${Math.round(Number(value))} kcal`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-slate-600 dark:text-slate-400">Protein:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatNumber(totals.protein)}g ({Math.round((proteinCal / totalMacroCal) * 100)}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-slate-600 dark:text-slate-400">Carbs:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatNumber(totals.carbs)}g ({Math.round((carbsCal / totalMacroCal) * 100)}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-400">Fat:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatNumber(totals.fat)}g ({Math.round((fatCal / totalMacroCal) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Meal Group Lists */}
      <div className="space-y-3">
        {mealGroups.map((group) => {
          const groupMeals = meals.filter((m) => m.mealType === group.type);
          const groupCalories = groupMeals.reduce((sum, m) => sum + m.calories, 0);

          return (
            <div
              key={group.type}
              className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{group.emoji}</span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {group.label}
                  </h4>
                  {groupMeals.length > 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {groupCalories} kcal
                    </span>
                  )}
                </div>

                <button
                  onClick={onOpenScanner}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Scan to Add
                </button>
              </div>

              {groupMeals.length === 0 ? (
                <div className="py-3 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                  No items logged for {group.label.toLowerCase()} yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {groupMeals.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-slate-200 transition-all"
                    >
                      <div
                        onClick={() => onSelectProduct(item.barcode)}
                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.productName} className="w-full h-full object-contain" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {item.productName}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.servingLabel} • {item.calories} kcal
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteEntry(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete meal entry"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
