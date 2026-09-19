import React from 'react';
import {
  Star,
  PlusCircle,
  ArrowLeftRight,
  Share2,
  Package,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import { ProductDetails } from '../../types/product';
import { HealthAssessmentResult } from '../../types/assessment';

interface ProductHeroProps {
  product: ProductDetails;
  assessment: HealthAssessmentResult;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenLogMeal: () => void;
  onOpenCompare: () => void;
  onShare: () => void;
}

export const ProductHero: React.FC<ProductHeroProps> = ({
  product,
  assessment,
  isFavorite,
  onToggleFavorite,
  onOpenLogMeal,
  onOpenCompare,
  onShare,
}) => {
  const getNovaColor = (group?: number) => {
    switch (group) {
      case 1:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
      case 2:
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
      case 3:
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
      case 4:
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getNutriScoreColor = (grade?: string) => {
    switch (grade) {
      case 'a':
        return 'bg-emerald-600 text-white';
      case 'b':
        return 'bg-lime-500 text-white';
      case 'c':
        return 'bg-amber-400 text-slate-900';
      case 'd':
        return 'bg-orange-500 text-white';
      case 'e':
        return 'bg-rose-600 text-white';
      default:
        return 'bg-slate-400 text-white';
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
        {/* Product Image */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0 bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 flex items-center justify-center p-2 shadow-inner">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain rounded-xl"
              loading="lazy"
              onError={(e) => {
                // Fallback on broken image link
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <Package className="w-14 h-14 text-slate-300 dark:text-slate-600" />
          )}

          {/* Source Tag */}
          <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] font-semibold bg-black/60 text-white backdrop-blur-xs uppercase tracking-wider">
            {product.source === 'openfoodfacts' ? 'OFF API' : product.source}
          </span>
        </div>

        {/* Product Details & Actions */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              {product.brand || 'Food Product'}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-400 font-mono">
              #{product.barcode}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
            {product.name}
          </h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-4">
            {product.servingSize && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Serving: {product.servingSize}
              </span>
            )}

            {product.novaGroup && (
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getNovaColor(
                  product.novaGroup
                )}`}
                title={`NOVA Group ${product.novaGroup}`}
              >
                NOVA {product.novaGroup}
              </span>
            )}

            {product.nutriScore && (
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase shadow-2xs ${getNutriScoreColor(
                  product.nutriScore
                )}`}
                title={`Nutri-Score ${product.nutriScore.toUpperCase()}`}
              >
                Nutri-Score {product.nutriScore.toUpperCase()}
              </span>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <button
              onClick={onOpenLogMeal}
              className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Log to Meals
            </button>

            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-xl border transition-all active:scale-95 ${
                isFavorite
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-500 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label="Favorite"
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={onOpenCompare}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all active:scale-95"
              title="Compare with another food"
              aria-label="Compare"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <button
              onClick={onShare}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all active:scale-95"
              title="Share product"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
