import React, { useState } from 'react';
import { X, Edit3, CheckCircle2 } from 'lucide-react';
import { ProductDetails, ProductNutrients } from '../../types/product';
import { storageService } from '../../services/storageService';

interface EditProductNutritionModalProps {
  product: ProductDetails;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updatedProduct: ProductDetails) => void;
}

export const EditProductNutritionModal: React.FC<EditProductNutritionModalProps> = ({
  product,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState(product.name);
  const [brand, setBrand] = useState(product.brand);
  const [servingSize, setServingSize] = useState(product.servingSize || '100 g');
  const [servingQuantityGrams, setServingQuantityGrams] = useState(
    product.servingQuantityGrams ? String(product.servingQuantityGrams) : '100'
  );

  const [calories, setCalories] = useState(String(product.nutrients100g.calories || ''));
  const [protein, setProtein] = useState(String(product.nutrients100g.protein || ''));
  const [carbs, setCarbs] = useState(String(product.nutrients100g.carbohydrates || ''));
  const [sugars, setSugars] = useState(String(product.nutrients100g.sugars || ''));
  const [addedSugars, setAddedSugars] = useState(
    product.nutrients100g.addedSugars !== undefined ? String(product.nutrients100g.addedSugars) : ''
  );
  const [fat, setFat] = useState(String(product.nutrients100g.fat || ''));
  const [satFat, setSatFat] = useState(String(product.nutrients100g.saturatedFat || ''));
  const [fiber, setFiber] = useState(String(product.nutrients100g.fiber || ''));
  const [sodium, setSodium] = useState(String(product.nutrients100g.sodium || ''));

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const servGrams = Number(servingQuantityGrams) || 100;
    const ratio = servGrams / 100;

    const updated100g: ProductNutrients = {
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbohydrates: Number(carbs) || 0,
      sugars: Number(sugars) || 0,
      addedSugars: addedSugars ? Number(addedSugars) : undefined,
      fat: Number(fat) || 0,
      saturatedFat: Number(satFat) || 0,
      fiber: Number(fiber) || 0,
      sodium: Number(sodium) || 0,
      salt: Number(((Number(sodium) || 0) / 400).toFixed(2)),
    };

    const updatedServing: ProductNutrients = {
      calories: Math.round(updated100g.calories * ratio),
      protein: Number((updated100g.protein * ratio).toFixed(1)),
      carbohydrates: Number((updated100g.carbohydrates * ratio).toFixed(1)),
      sugars: Number((updated100g.sugars * ratio).toFixed(1)),
      addedSugars:
        updated100g.addedSugars !== undefined
          ? Number((updated100g.addedSugars * ratio).toFixed(1))
          : undefined,
      fat: Number((updated100g.fat * ratio).toFixed(1)),
      saturatedFat: Number((updated100g.saturatedFat * ratio).toFixed(1)),
      fiber: Number((updated100g.fiber * ratio).toFixed(1)),
      sodium: Math.round(updated100g.sodium * ratio),
      salt: Number((updated100g.salt * ratio).toFixed(2)),
    };

    const updated: ProductDetails = {
      ...product,
      name: name.trim() || product.name,
      brand: brand.trim() || product.brand,
      servingSize: servingSize.trim() || `${servGrams} g`,
      servingQuantityGrams: servGrams,
      nutrients100g: updated100g,
      nutrientsServing: updatedServing,
      isEstimated: false,
      isComplete: true,
      missingFields: [],
      lastUpdated: Date.now(),
    };

    await storageService.cacheProduct(updated);
    onSaved(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Edit Nutrition Values
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Product Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Brand
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Serving Size Description
              </label>
              <input
                type="text"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                placeholder="e.g. 1 bar (50 g)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Serving Weight (g or ml)
              </label>
              <input
                type="number"
                value={servingQuantityGrams}
                onChange={(e) => setServingQuantityGrams(e.target.value)}
                placeholder="100"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Nutrients per 100g
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                  Protein (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                  Sugars (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={sugars}
                  onChange={(e) => setSugars(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                  Total Fat (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                  Sat. Fat (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={satFat}
                  onChange={(e) => setSatFat(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                  Fiber (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={fiber}
                  onChange={(e) => setFiber(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                  Sodium (mg)
                </label>
                <input
                  type="number"
                  value={sodium}
                  onChange={(e) => setSodium(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
