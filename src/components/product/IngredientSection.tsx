import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  FlaskConical,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ProductDetails } from '../../types/product';

interface IngredientSectionProps {
  product: ProductDetails;
}

export const IngredientSection: React.FC<IngredientSectionProps> = ({ product }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { ingredientsText, ingredientsList, allergens, additives } = product;

  const getAdditiveRiskBadge = (risk?: string) => {
    switch (risk) {
      case 'safe':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'caution':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'high_risk':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Ingredients & Allergens
          </h3>
        </div>

        {ingredientsList && ingredientsList.length > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {ingredientsList.length} ingredients
          </span>
        )}
      </div>

      {/* Allergens Banner */}
      {allergens.length > 0 ? (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block mb-1">
              Allergen Notice
            </span>
            <div className="flex flex-wrap gap-1.5">
              {allergens.map((allergen, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-100"
                >
                  {allergen}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>No common major allergen alerts declared in database record.</span>
        </div>
      )}

      {/* Ingredients List */}
      <div>
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
          Ingredient Composition
        </span>

        {ingredientsText ? (
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className={!isExpanded && ingredientsText.length > 200 ? 'line-clamp-3' : ''}>
              {ingredientsText}
            </p>

            {ingredientsText.length > 200 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                {isExpanded ? (
                  <>
                    Show Less <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    Read Full Ingredient List <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 dark:text-slate-400 italic">
            Ingredient list is not specified in the database record for this product.
          </div>
        )}
      </div>

      {/* Food Additives / E-numbers */}
      {additives.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Food Additives ({additives.length})
              </span>
            </div>
            <span className="text-[10px] text-slate-400">E-numbers identified</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {additives.map((add, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-xs"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {add.name}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${getAdditiveRiskBadge(
                      add.riskLevel
                    )}`}
                  >
                    {add.riskLevel ? add.riskLevel.replace('_', ' ') : add.id}
                  </span>
                </div>
                {add.function && (
                  <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 mb-0.5">
                    {add.function}
                  </p>
                )}
                {add.description && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                    {add.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
