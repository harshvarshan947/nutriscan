import React, { useState } from 'react';
import {
  Flame,
  Dumbbell,
  Wheat,
  Candy,
  Droplet,
  ShieldAlert,
  Sparkles,
  Layers,
  Heart,
} from 'lucide-react';
import { ProductDetails, ProductNutrients } from '../../types/product';
import { HealthAssessmentResult, NutrientRating } from '../../types/assessment';
import { formatNumber } from '../../utils/formatters';
import { Edit3, Info } from 'lucide-react';

interface NutritionGridProps {
  product: ProductDetails;
  assessment: HealthAssessmentResult;
  onEditNutrition?: () => void;
}

export const NutritionGrid: React.FC<NutritionGridProps> = ({
  product,
  assessment,
  onEditNutrition,
}) => {
  const hasServing = !!product.nutrientsServing;
  const [viewMode, setViewMode] = useState<'100g' | 'serving'>('100g');

  const nutrients = viewMode === 'serving' && product.nutrientsServing
    ? product.nutrientsServing
    : product.nutrients100g;

  const getTrafficColor = (color: 'green' | 'amber' | 'red') => {
    switch (color) {
      case 'green':
        return {
          bar: 'bg-emerald-500',
          badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          icon: '✓',
        };
      case 'amber':
        return {
          bar: 'bg-amber-400',
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          icon: '•',
        };
      case 'red':
      default:
        return {
          bar: 'bg-rose-500',
          badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          icon: '⚠',
        };
    }
  };

  const renderCard = (
    key: keyof ProductNutrients,
    label: string,
    icon: React.ReactNode,
    unit: string,
    isCrucial = false
  ) => {
    const val = nutrients[key];
    if (val === undefined) return null;

    const rating: NutrientRating | undefined = assessment.ratings[key];
    const traffic = rating ? getTrafficColor(rating.trafficLightColor) : { bar: 'bg-slate-400', badge: 'bg-slate-100 text-slate-700', icon: '•' };
    const levelLabel = rating ? rating.level.replace('_', ' ').toUpperCase() : '';
    const percentDv = rating ? Math.min(100, rating.percentDailyValue) : 0;

    return (
      <div
        key={key}
        className={`bg-white dark:bg-slate-900 rounded-2xl p-3.5 border transition-all shadow-2xs hover:shadow-sm ${
          isCrucial
            ? 'border-slate-300 dark:border-slate-700'
            : 'border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            {icon}
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {label}
            </span>
          </div>

          {rating && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border flex items-center gap-0.5 ${traffic.badge}`}
            >
              <span>{traffic.icon}</span>
              <span>{levelLabel}</span>
            </span>
          )}
        </div>

        {/* Amount & Value */}
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {formatNumber(val)}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {unit}
            </span>
          </div>

          {rating && rating.percentDailyValue > 0 && (
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {rating.percentDailyValue}% DV
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${traffic.bar}`}
            style={{ width: `${Math.max(4, percentDv)}%` }}
          />
        </div>

        {/* Short advice */}
        {rating?.advice && (
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 truncate">
            {rating.advice}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-3">
      {/* Estimation Notice if Standard Benchmark Applied */}
      {product.isEstimated && (
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">
              Estimated Category Benchmarks Applied
            </span>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
              The online database only had a photo for this product without typed numbers. We applied standard USDA benchmarks for{' '}
              <strong className="underline">{product.estimatedCategory || 'this food category'}</strong>.
            </p>
          </div>
          {onEditNutrition && (
            <button
              onClick={onEditNutrition}
              className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] shrink-0 transition-all"
            >
              Edit
            </button>
          )}
        </div>
      )}

      {/* Portion Toggle and Edit Trigger */}
      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-1 px-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Nutritional Values
          </span>
          {onEditNutrition && (
            <button
              onClick={onEditNutrition}
              className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md transition-colors"
              title="Edit nutrition values"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {hasServing && (
            <button
              onClick={() => setViewMode('serving')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'serving'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Per Serving ({product.servingSize || 'serving'})
            </button>
          )}

          <button
            onClick={() => setViewMode('100g')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              viewMode === '100g'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Per 100 g / ml
          </button>
        </div>
      </div>

      {/* Grid of Nutrient Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {renderCard('calories', 'Calories', <Flame className="w-3.5 h-3.5 text-amber-500" />, 'kcal', true)}
        {renderCard('protein', 'Protein', <Dumbbell className="w-3.5 h-3.5 text-indigo-500" />, 'g', true)}
        {renderCard('fiber', 'Dietary Fiber', <Sparkles className="w-3.5 h-3.5 text-emerald-500" />, 'g', true)}
        {renderCard('sugars', 'Total Sugars', <Candy className="w-3.5 h-3.5 text-rose-500" />, 'g', true)}
        {renderCard('saturatedFat', 'Saturated Fat', <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />, 'g', true)}
        {renderCard('sodium', 'Sodium', <Droplet className="w-3.5 h-3.5 text-cyan-500" />, 'mg', true)}
        {renderCard('fat', 'Total Fat', <Droplet className="w-3.5 h-3.5 text-yellow-500" />, 'g')}
        {renderCard('carbohydrates', 'Total Carbs', <Wheat className="w-3.5 h-3.5 text-amber-600" />, 'g')}
        {renderCard('salt', 'Salt', <Layers className="w-3.5 h-3.5 text-slate-500" />, 'g')}
        {nutrients.addedSugars !== undefined &&
          renderCard('addedSugars', 'Added Sugars', <Candy className="w-3.5 h-3.5 text-red-500" />, 'g')}
      </div>
    </div>
  );
};
