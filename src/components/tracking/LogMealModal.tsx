import React, { useState } from 'react';
import { X, Plus, Minus, Check, Calendar, Utensils } from 'lucide-react';
import { ProductDetails } from '../../types/product';
import { MealType, MealLogEntry } from '../../types/tracking';
import { storageService } from '../../services/storageService';
import { getTodayDateString, formatNumber } from '../../utils/formatters';

interface LogMealModalProps {
  product: ProductDetails;
  isOpen: boolean;
  onClose: () => void;
  onLogged: () => void;
}

export const LogMealModal: React.FC<LogMealModalProps> = ({
  product,
  isOpen,
  onClose,
  onLogged,
}) => {
  const [mealType, setMealType] = useState<MealType>('snack');
  const [servings, setServings] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const baseNutrients = product.nutrientsServing || product.nutrients100g;
  const baseLabel = product.nutrientsServing
    ? product.servingSize || '1 serving'
    : '100 g';

  const scaledCalories = Math.round(baseNutrients.calories * servings);
  const scaledProtein = Number((baseNutrients.protein * servings).toFixed(1));
  const scaledCarbs = Number((baseNutrients.carbohydrates * servings).toFixed(1));
  const scaledSugars = Number((baseNutrients.sugars * servings).toFixed(1));
  const scaledFat = Number((baseNutrients.fat * servings).toFixed(1));
  const scaledSatFat = Number((baseNutrients.saturatedFat * servings).toFixed(1));
  const scaledFiber = Number((baseNutrients.fiber * servings).toFixed(1));
  const scaledSodium = Math.round(baseNutrients.sodium * servings);
  const scaledSalt = Number((baseNutrients.salt * servings).toFixed(2));

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const entry: MealLogEntry = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        date: getTodayDateString(),
        timestamp: Date.now(),
        mealType,
        barcode: product.barcode,
        productName: product.name,
        brand: product.brand,
        image: product.thumbnail || product.image,
        servingsCount: servings,
        servingLabel: `${servings}x (${baseLabel})`,
        calories: scaledCalories,
        protein: scaledProtein,
        carbohydrates: scaledCarbs,
        sugars: scaledSugars,
        fat: scaledFat,
        saturatedFat: scaledSatFat,
        fiber: scaledFiber,
        sodium: scaledSodium,
        salt: scaledSalt,
      };

      await storageService.logMeal(entry);
      onLogged();
      onClose();
    } catch (e) {
      console.error('Failed to log meal', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mealTypes: { type: MealType; label: string; emoji: string }[] = [
    { type: 'breakfast', label: 'Breakfast', emoji: '🍳' },
    { type: 'lunch', label: 'Lunch', emoji: '🥗' },
    { type: 'dinner', label: 'Dinner', emoji: '🍲' },
    { type: 'snack', label: 'Snack', emoji: '🍎' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
            <Utensils className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Log Today's Meal</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
            {product.name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{product.brand}</p>
        </div>

        {/* Meal Type Picker */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
            Select Meal
          </label>
          <div className="grid grid-cols-2 gap-2">
            {mealTypes.map((m) => (
              <button
                key={m.type}
                type="button"
                onClick={() => setMealType(m.type)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                  mealType === m.type
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Serving Multiplier */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Portion / Servings
            </label>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Unit: {baseLabel}
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setServings((prev) => Math.max(0.25, Number((prev - 0.25).toFixed(2))))}
              className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 active:scale-95 shadow-2xs"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {servings}
              </span>
              <span className="text-xs text-slate-400 ml-1 font-medium">servings</span>
            </div>

            <button
              type="button"
              onClick={() => setServings((prev) => Number((prev + 0.25).toFixed(2)))}
              className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 active:scale-95 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Calculation Preview Card */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Nutritional Contribution
          </span>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-1.5 bg-white dark:bg-slate-800 rounded-xl">
              <span className="text-slate-400 text-[10px] block">Calories</span>
              <span className="font-bold text-slate-900 dark:text-white">{scaledCalories}</span>
            </div>
            <div className="p-1.5 bg-white dark:bg-slate-800 rounded-xl">
              <span className="text-slate-400 text-[10px] block">Protein</span>
              <span className="font-bold text-slate-900 dark:text-white">{scaledProtein}g</span>
            </div>
            <div className="p-1.5 bg-white dark:bg-slate-800 rounded-xl">
              <span className="text-slate-400 text-[10px] block">Carbs</span>
              <span className="font-bold text-slate-900 dark:text-white">{scaledCarbs}g</span>
            </div>
            <div className="p-1.5 bg-white dark:bg-slate-800 rounded-xl">
              <span className="text-slate-400 text-[10px] block">Fat</span>
              <span className="font-bold text-slate-900 dark:text-white">{scaledFat}g</span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-semibold rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Check className="w-4 h-4" />
          Add to {mealTypes.find((m) => m.type === mealType)?.label}
        </button>
      </div>
    </div>
  );
};
